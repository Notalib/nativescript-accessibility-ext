/// <reference path="./core/view.d.ts" />

import * as nsApp from '@nativescript/core/application';
import { CSSUtils } from '@nativescript/core/css/system-classes';
import { PropertyChangeData } from '@nativescript/core/data/observable';
import { isAndroid } from '@nativescript/core/platform';
import { profile } from '@nativescript/core/profiling';
import { View } from '@nativescript/core/ui/core/view';
import { isTraceEnabled, writeFontScaleTrace, writeTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { hmrSafeEvents } from '../utils/helpers';
import { AccessibilityServiceEnabledObservable } from '../utils/utils';

// CSS-classes
const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;
const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;
const rootA11YClass = 'ns-a11y';

class A11YCssClassHelper {
  private readonly cls = `CssClassesHelper`;

  private readonly fontScaleCssClasses = new Map(FontScaleObservable.VALID_FONT_SCALES.map((fs) => [fs, `a11y-fontscale-${Number(fs * 100).toFixed(0)}`]));

  private currentFontScaleClass = '';
  private currentFontScaleCategory = '';
  private currentA11YStatusClass = '';
  private currentRootA11YClass = '';

  private readonly fontScaleObservable = new FontScaleObservable();
  private readonly a11yServiceObservable = new AccessibilityServiceEnabledObservable();

  /**
   * Keep a list of WeakRefs to loaded modal views.
   *
   * This is needed to trigger UI updates if the fontscale or a11y-service status changes
   **/
  private loadedModalViewRefs = new Map<string, WeakRef<View>>();

  constructor() {
    this.fontScaleObservable.on(FontScaleObservable.propertyChangeEvent, this.fontScaleChanged, this);
    this.a11yServiceObservable.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, this.a11yServiceChanged, this);

    // Override global events
    hmrSafeEvents(`${this.cls}.updateRootViews`, [nsApp.displayedEvent, nsApp.resumeEvent], nsApp, (evt) => {
      this.updateRootViews(evt);
    });

    hmrSafeEvents(`${this.cls}.modalViewShowing`, [View.shownModallyEvent], View, (evt) => {
      this.addModalViewRef(evt.object);
    });
  }

  /**
   * Update css-helper classes on root and modal-views
   */
  @profile
  private updateRootViews(evt?: any) {
    evt = { ...evt };

    const cls = `${this.cls}.updateRootViews({eventName: ${evt.eventName}, object: ${evt.object}})`;
    if (!this.updateCurrentHelperClasses()) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - no changes`);
      }

      return;
    }

    for (const view of [nsApp.getRootView(), ...this.getModalViews()]) {
      if (!view) {
        continue;
      }

      if (isTraceEnabled()) {
        writeTrace(`${cls} - update css state on ${view}`);
      }

      view._onCssStateChange();
    }
  }

  /**
   * Get loaded modal views
   */
  @profile
  private getModalViews() {
    const views = [] as View[];
    for (const [id, viewRef] of this.loadedModalViewRefs) {
      const view = viewRef.get();
      if (!view) {
        // This view doesn't exists anymore, remove the WeakRef from the set.
        this.loadedModalViewRefs.delete(id);
        continue;
      }

      views.push(view);
    }

    return views;
  }

  /**
   * Add modal view to list loaded modals.
   *
   * These are used to the UI if fontscale or the a11y-service status changes while the modal is active.
   */
  @profile
  private addModalViewRef(modalView: View) {
    for (const [id, viewRef] of this.loadedModalViewRefs) {
      const otherView = viewRef.get();
      if (!otherView) {
        // This view doesn't exists anymore, remove the WeakRef from the set.
        this.loadedModalViewRefs.delete(id);
        continue;
      }
    }

    this.loadedModalViewRefs.set(`${modalView}`, new WeakRef(modalView));
  }

  @profile
  private removeCssClass(cssClass: string) {
    CSSUtils.removeSystemCssClass(cssClass);

    [nsApp.getRootView(), ...this.getModalViews()].forEach((view) => {
      if (view) {
        view.cssClasses.delete(cssClass);
      }
    });
  }

  @profile
  private addCssClass(cssClass: string) {
    CSSUtils.pushToRootViewCssClasses(cssClass);

    [nsApp.getRootView(), ...this.getModalViews()].forEach((view) => {
      if (view) {
        view.cssClasses.add(cssClass);
      }
    });
  }

  /**
   * Update the helper CSS-classes.
   * Return true is any changes.
   */
  @profile
  private updateCurrentHelperClasses(): boolean {
    const { fontScale, isExtraSmall, isExtraLarge } = this.fontScaleObservable;

    let changed = false;

    const oldFontScaleClass = this.currentFontScaleClass;
    if (this.fontScaleCssClasses.has(fontScale)) {
      this.currentFontScaleClass = this.fontScaleCssClasses.get(fontScale);
    } else {
      this.currentFontScaleClass = this.fontScaleCssClasses.get(1);
    }

    if (oldFontScaleClass !== this.currentFontScaleClass) {
      this.removeCssClass(oldFontScaleClass);
      this.addCssClass(this.currentFontScaleClass);

      changed = true;
    }

    let oldActiveFontScaleCategory = this.currentFontScaleCategory;
    if (isAndroid) {
      this.currentFontScaleCategory = fontExtraMediumClass;
    } else {
      if (isExtraSmall) {
        this.currentFontScaleCategory = fontExtraSmallClass;
      } else if (isExtraLarge) {
        this.currentFontScaleCategory = fontExtraLargeClass;
      } else {
        this.currentFontScaleCategory = fontExtraMediumClass;
      }
    }

    if (oldActiveFontScaleCategory !== this.currentFontScaleCategory) {
      this.removeCssClass(oldActiveFontScaleCategory);
      this.addCssClass(this.currentFontScaleCategory);

      changed = true;
    }

    const oldA11YStatusClass = this.currentA11YStatusClass;
    if (this.a11yServiceObservable.accessibilityServiceEnabled) {
      this.currentA11YStatusClass = a11yServiceEnabledClass;
    } else {
      this.currentA11YStatusClass = a11yServiceDisabledClass;
    }

    if (oldA11YStatusClass !== this.currentA11YStatusClass) {
      this.removeCssClass(oldA11YStatusClass);
      this.addCssClass(this.currentA11YStatusClass);

      changed = true;
    }

    if (this.currentRootA11YClass !== rootA11YClass) {
      this.addCssClass(rootA11YClass);
      this.currentRootA11YClass = rootA11YClass;

      changed = true;
    }

    return changed;
  }

  @profile
  private fontScaleChanged(event: PropertyChangeData) {
    const { fontScale } = this.fontScaleObservable;
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${this.cls}.fontScaleChanged(): ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
    }

    this.updateRootViews(event);
  }

  @profile
  private a11yServiceChanged(event: PropertyChangeData) {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${this.cls}.a11yServiceChanged(): to ${this.a11yServiceObservable.accessibilityServiceEnabled}`);
    }

    this.updateRootViews(event);
  }
}

export const cssClassHelper = new A11YCssClassHelper();

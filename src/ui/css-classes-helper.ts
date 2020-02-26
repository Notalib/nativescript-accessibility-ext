/// <reference path="./core/view.d.ts" />

import * as nsApp from '@nativescript/core/application/application';
import { getModalRootViewCssClass, getRootViewCssClasses } from '@nativescript/core/css/system-classes';
import { PropertyChangeData } from '@nativescript/core/data/observable';
import { isAndroid } from '@nativescript/core/platform';
import { profile } from '@nativescript/core/profiling';
import { View, ViewBase } from '@nativescript/core/ui/core/view';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { getViewNgCssClassesMap, hmrSafeEvents, wrapFunction } from '../utils/helpers';
import { AccessibilityServiceEnabledObservable } from '../utils/utils';
import { ViewCommon } from './core/view-common';

// CSS-classes
const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;
const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;
const rootA11YClass = 'ns-a11y';
const nsRootClass = getRootViewCssClasses()[0];
const nsModalClass = getModalRootViewCssClass();

const cssClassesPropName = '_a11yCssClasses';
const cssClassesLastChangedIdPropName = `${cssClassesPropName}_lastChangeId`;

class CssClassHelper {
  private readonly cls = `CssClassesHelper`;

  private readonly fontScaleCssClasses = new Map(FontScaleObservable.VALID_FONT_SCALES.map((fs) => [fs, this.fontScaleToCssClass(fs)]));

  private activeFontScaleClass = this.fontScaleCssClasses.get(1);
  private activeFontScaleCategory = fontExtraMediumClass;
  private currentA11YStatusClass = '';

  private lastChangeId = -1;

  private readonly fontScaleObservable = new FontScaleObservable();
  private readonly a11yServiceObservable = new AccessibilityServiceEnabledObservable();

  /**
   * Keep a list of WeakRefs to loaded modal views.
   *
   * This is needed to trigger UI updates if the fontscale or a11y-service status changes
   **/
  private loadedModalViewRefs = new Map<string, WeakRef<View>>();

  constructor() {
    const self = this;

    // Overriding cssClasses-property on the ViewBase-class to add the a11y-helper-classes.
    Object.defineProperty(ViewBase.prototype, 'cssClasses', {
      configurable: true,
      get(this: ViewBase) {
        const cssClasses = this[cssClassesPropName] as Set<string>;
        if (!self.isViewClassesValid(this)) {
          return self.updateViewCssClasses(this);
        }

        return cssClasses;
      },
      set(this: ViewBase, cssClasses: Set<string>) {
        this[cssClassesPropName] = cssClasses;

        wrapFunction(
          cssClasses,
          'clear',
          () => {
            delete this[cssClassesLastChangedIdPropName];

            self.updateViewCssClasses(this);
          },
          `${this.typeName}.cssClasses`,
        );

        self.updateViewCssClasses(this);
      },
    });

    this.fontScaleObservable.on(FontScaleObservable.propertyChangeEvent, this.fontScaleChanged, this);
    this.a11yServiceObservable.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, this.a11yServiceChanged, this);

    // Override global events
    hmrSafeEvents(`${this.cls}.updateRootViews`, [nsApp.displayedEvent, nsApp.resumeEvent], nsApp, (evt) => {
      this.updateRootViews(evt);
    });

    hmrSafeEvents(`${this.cls}.modalViewShowing`, [View.shownModallyEvent], ViewCommon, (evt) => {
      this.modalViewShowing(evt.object);
    });

    hmrSafeEvents(`${this.cls}.updateViewCssClasses`, [View.loadedEvent], View, (evt) => {
      this.updateViewCssClasses(evt.object);
    });
  }

  private modalViewShowing(modalView: View) {
    this.addModalViewRef(modalView);
  }

  @profile
  private isViewClassesValid(view: ViewBase): boolean {
    const cssClasses = view[cssClassesPropName] as Set<string>;
    if (cssClasses.size === 0) {
      // If the view have just been created or cssClasses.clear() have been called the view's classes are no longer valid.
      return false;
    }

    if (view[cssClassesLastChangedIdPropName] !== this.lastChangeId) {
      // Helper classes have been changed, view's classes are no longer valid.
      return false;
    }

    const isModal = cssClasses.has(nsModalClass);
    const isRoot = !isModal && cssClasses.has(nsRootClass);

    if (isModal || isRoot) {
      if (!cssClasses.has(rootA11YClass)) {
        // Root/Modal views without the ns-a11y class are invalid.
        return false;
      }
    }

    return true;
  }

  @profile
  public updateViewCssClasses(view: ViewBase): Set<string> {
    const cssClasses = view[cssClassesPropName] as Set<string>;
    const ngCssClasses = getViewNgCssClassesMap(view);

    if (!this.activeFontScaleClass || !this.currentA11YStatusClass) {
      this.updateCurrentHelperClasses();
    }

    view[cssClassesLastChangedIdPropName] = this.lastChangeId;

    const isModal = cssClasses.has(nsModalClass);
    const isRoot = !isModal && cssClasses.has(nsRootClass);

    if (!isModal && !isRoot) {
      return cssClasses;
    }

    if (!cssClasses.has(this.activeFontScaleClass)) {
      for (const cssClass of this.fontScaleCssClasses.values()) {
        if (this.activeFontScaleClass === cssClass) {
          continue;
        }

        cssClasses.delete(cssClass);
        ngCssClasses.delete(cssClass);
      }

      cssClasses.add(this.activeFontScaleClass);
      ngCssClasses.set(this.activeFontScaleClass, true);
    }

    if (!cssClasses.has(this.activeFontScaleCategory)) {
      for (const cssClass of [fontExtraSmallClass, fontExtraMediumClass, fontExtraLargeClass]) {
        if (this.activeFontScaleCategory === cssClass) {
          continue;
        }

        cssClasses.delete(cssClass);
        ngCssClasses.delete(cssClass);
      }

      cssClasses.add(this.activeFontScaleCategory);
      ngCssClasses.set(this.activeFontScaleCategory, true);
    }

    if (!cssClasses.has(this.currentA11YStatusClass)) {
      for (const cssClass of [a11yServiceEnabledClass, a11yServiceDisabledClass]) {
        if (this.currentA11YStatusClass === cssClass) {
          continue;
        }

        cssClasses.delete(cssClass);
        ngCssClasses.delete(cssClass);
      }

      cssClasses.add(this.currentA11YStatusClass);
      ngCssClasses.set(this.currentA11YStatusClass, true);
    }

    if (!cssClasses.has(rootA11YClass)) {
      cssClasses.add(rootA11YClass);
      ngCssClasses.set(rootA11YClass, true);
    }

    view[cssClassesLastChangedIdPropName] = this.lastChangeId;

    return cssClasses;
  }

  @profile
  private setHelperCssRecursively(view: View) {
    if (!view) {
      return false;
    }

    let changed = false;
    if (!this.isViewClassesValid(view)) {
      this.updateViewCssClasses(view);
    }

    view.eachChildView((childView) => {
      if (this.setHelperCssRecursively(childView)) {
        changed = true;
      }

      return true;
    });

    return changed;
  }

  /**
   * Update css-helper classes on root and modal-views
   */
  @profile
  private updateRootViews(evt?: any) {
    evt = { ...evt };

    const cls = `${this.cls}.updateRootViews({eventName: ${evt.eventName}, object: ${evt.object}})`;
    this.updateCurrentHelperClasses();

    const rootView = nsApp.getRootView();
    if (rootView) {
      if (this.setHelperCssRecursively(rootView)) {
        if (isTraceEnabled()) {
          writeFontScaleTrace(`${cls} - update rootView ${rootView}. was changed: true`);
        }
        rootView._onCssStateChange();
      } else if (isTraceEnabled()) {
        writeFontScaleTrace(`${cls} - update rootView ${rootView}. was changed: false`);
      }
    } else {
      if (isTraceEnabled()) {
        writeFontScaleTrace(`${cls} - no rootView`);
      }
    }

    for (const modalView of this.getModalViews()) {
      if (this.setHelperCssRecursively(modalView)) {
        if (isTraceEnabled()) {
          writeFontScaleTrace(`${cls} - update modal ${modalView}. was changed: true`);
        }

        modalView._onCssStateChange();
      } else if (isTraceEnabled()) {
        writeFontScaleTrace(`${cls} - update modal ${modalView}. was changed: false`);
      }
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
    if (this.setHelperCssRecursively(modalView)) {
      modalView._onCssStateChange();
    }
  }

  /**
   * Update the helper CSS-classes.
   * Return true is any changes.
   */
  @profile
  private updateCurrentHelperClasses() {
    const { fontScale, isExtraSmall, isExtraLarge } = this.fontScaleObservable;

    const oldFontScaleClass = this.activeFontScaleClass;

    if (this.fontScaleCssClasses.has(fontScale)) {
      this.activeFontScaleClass = this.fontScaleCssClasses.get(fontScale);
    } else {
      this.activeFontScaleClass = this.fontScaleCssClasses.get(1);
    }

    if (oldFontScaleClass !== this.activeFontScaleClass) {
      this.lastChangeId += 1;
    }

    let oldActiveFontScaleCategory = this.activeFontScaleCategory;
    if (isAndroid) {
      this.activeFontScaleCategory = fontExtraMediumClass;
    } else if (isExtraSmall) {
      this.activeFontScaleCategory = fontExtraSmallClass;
    } else if (isExtraLarge) {
      this.activeFontScaleCategory = fontExtraLargeClass;
    } else {
      this.activeFontScaleCategory = fontExtraMediumClass;
    }

    if (this.activeFontScaleCategory !== oldActiveFontScaleCategory) {
      this.lastChangeId += 1;
    }

    const oldA11YStatusClass = this.currentA11YStatusClass;
    if (this.a11yServiceObservable.accessibilityServiceEnabled) {
      this.currentA11YStatusClass = a11yServiceEnabledClass;
    } else {
      this.currentA11YStatusClass = a11yServiceDisabledClass;
    }

    if (oldA11YStatusClass !== this.currentA11YStatusClass) {
      this.lastChangeId += 1;
    }
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

  private fontScaleToCssClass(fontScale: number) {
    return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
  }
}

export const cssClassHelper = new CssClassHelper();

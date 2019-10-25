/// <reference path="./core/view.d.ts" />

import * as nsApp from 'tns-core-modules/application/application';
import { getModalRootViewCssClass, getRootViewCssClasses } from 'tns-core-modules/css/system-classes';
import { PropertyChangeData } from 'tns-core-modules/data/observable';
import { isAndroid } from 'tns-core-modules/platform';
import { profile } from 'tns-core-modules/profiling';
import { View, ViewBase } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { getViewNgCssClassesMap, hmrSafeGlobalEvents, wrapFunction } from '../utils/helpers';
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

declare const Zone: any;

const cssClassesPropName = '_a11yCssClasses';
const cssClassesLastChangedPropName = `${cssClassesPropName}_lastChangeId`;

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
            delete this[cssClassesLastChangedPropName];
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
    hmrSafeGlobalEvents(`${this.cls}.updateRootViews`, [nsApp.displayedEvent, nsApp.resumeEvent], nsApp, (evt) => this.updateRootViews(evt));
    hmrSafeGlobalEvents(`${this.cls}.modalViewShowing`, [View.shownModallyEvent], ViewCommon, (evt) => this.modalViewShowing(evt.object));
    hmrSafeGlobalEvents(`${this.cls}.updateViewCssClasses`, [View.loadedEvent], View, (evt) => this.updateViewCssClasses(evt.object));
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

    if (view[cssClassesLastChangedPropName] !== this.lastChangeId) {
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
  public updateViewCssClasses(view: ViewBase) {
    const cssClasses = view[cssClassesPropName] as Set<string>;
    let ngCssClasses = new Map<string, boolean>();
    // Zone is globally available on nativescript-angular. If defined assume angular environment.
    if (typeof Zone !== 'undefined') {
      ngCssClasses = getViewNgCssClassesMap(view);
    }

    if (!this.activeFontScaleClass || !this.currentA11YStatusClass) {
      this.updateCurrentHelperClasses();
    }

    if (!cssClasses.has(this.activeFontScaleClass)) {
      for (const cssClass of this.fontScaleCssClasses.values()) {
        cssClasses.delete(cssClass);
        ngCssClasses.delete(cssClass);
      }

      cssClasses.add(this.activeFontScaleClass);
      ngCssClasses.set(this.activeFontScaleClass, true);
    }

    if (!cssClasses.has(this.activeFontScaleCategory)) {
      for (const cssClass of [fontExtraSmallClass, fontExtraMediumClass, fontExtraLargeClass]) {
        cssClasses.delete(cssClass);
        ngCssClasses.delete(cssClass);
      }

      cssClasses.add(this.activeFontScaleCategory);
      ngCssClasses.set(this.activeFontScaleCategory, true);
    }

    const isModal = cssClasses.has(nsModalClass);
    const isRoot = !isModal && cssClasses.has(nsRootClass);

    if (isModal || isRoot) {
      if (!cssClasses.has(this.currentA11YStatusClass)) {
        for (const cssClass of [a11yServiceEnabledClass, a11yServiceDisabledClass]) {
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
    }

    view[cssClassesLastChangedPropName] = this.lastChangeId;

    return cssClasses;
  }

  @profile
  private setHelperCssRecursively(view: View) {
    if (!view) {
      return false;
    }

    this.updateViewCssClasses(view);

    view.eachChildView((child) => this.setHelperCssRecursively(child));

    return true;
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
      const isValid = this.isViewClassesValid(rootView);
      if (isTraceEnabled()) {
        writeFontScaleTrace(`${cls} - update rootView ${rootView}. isValid: ${isValid}`);
      }

      this.setHelperCssRecursively(rootView);
      if (!isValid) {
        rootView._onCssStateChange();
      }
    } else {
      if (isTraceEnabled()) {
        writeFontScaleTrace(`${cls} - no rootView`);
      }
    }

    for (const view of this.getModalViews()) {
      const isValid = this.isViewClassesValid(view);
      if (isTraceEnabled()) {
        writeFontScaleTrace(`${cls} - update modal ${view}. isValid: ${isValid}`);
      }

      this.setHelperCssRecursively(rootView);
      if (!isValid) {
        view._onCssStateChange();
      }
    }
  }

  /**
   * Get loaded modal views
   */
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

    this.setHelperCssRecursively(modalView);
  }

  /**
   * Update the helper CSS-classes.
   * Return true is any changes.
   */
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
    if (isAndroid || (!isExtraSmall && !isExtraLarge)) {
      this.activeFontScaleCategory = fontExtraMediumClass;
    } else if (isExtraSmall) {
      this.activeFontScaleCategory = fontExtraSmallClass;
    } else if (isExtraLarge) {
      this.activeFontScaleCategory = fontExtraLargeClass;
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

  private fontScaleChanged(event: PropertyChangeData) {
    const { fontScale } = this.fontScaleObservable;
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${this.cls}.fontScaleChanged(): ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
    }

    this.updateRootViews(event);
  }

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

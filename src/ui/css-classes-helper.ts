/// <reference path="./core/view.d.ts" />

import * as nsApp from 'tns-core-modules/application/application';
import { getModalRootViewCssClass, getRootViewCssClasses } from 'tns-core-modules/css/system-classes';
import { Observable } from 'tns-core-modules/data/observable';
import { isAndroid } from 'tns-core-modules/platform';
import { profile } from 'tns-core-modules/profiling';
import { View, ViewBase } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { getViewNgCssClassesMap, hmrSafeGlobalEvents } from '../utils/helpers';
import { AccessibilityServiceEnabledObservable } from '../utils/utils';

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

const fontScaleCssClasses = new Map(FontScaleObservable.VALID_FONT_SCALES.map((fs) => [fs, fontScaleToCssClass(fs)]));

/**
 * Keep a list of WeakRefs to loaded modal views.
 *
 * This is needed to trigger UI updates if the fontscale or a11y-service status changes
 **/
const loadedModalViewRefs = new Map<string, WeakRef<View>>();

const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;
const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;
const rootA11YClass = 'ns-a11y';

const nsRootClass = getRootViewCssClasses()[0];
const nsModalClass = getModalRootViewCssClass();

const cls = `FontScaling`;

function modalViewLoaded(modalView: View) {
  addModalViewRef(modalView);
}

declare const Zone: any;

const cssClassesPropName = '_a11yCssClasses';
const cssClassesLastChangedPropName = `${cssClassesPropName}_lastChangeId`;
const updateViewCssClasses = profile('A11Y.updateViewCssClasses', function(view: ViewBase) {
  const cssClasses = view[cssClassesPropName] as Set<string>;
  let ngCssClasses = new Map<string, boolean>();
  // Zone is globally available on nativescript-angular. If defined assume angular environment.
  if (typeof Zone !== 'undefined') {
    ngCssClasses = getViewNgCssClassesMap(view);
  }

  if (!activeFontScaleClass || !currentA11YStatusClass) {
    updateCurrentHelperClasses();
  }

  if (!cssClasses.has(activeFontScaleClass)) {
    for (const cssClass of fontScaleCssClasses.values()) {
      cssClasses.delete(cssClass);
      ngCssClasses.delete(cssClass);
    }

    cssClasses.add(activeFontScaleClass);
    ngCssClasses.set(activeFontScaleClass, true);
  }

  if (!cssClasses.has(activeFontScaleCategory)) {
    for (const cssClass of [fontExtraSmallClass, fontExtraMediumClass, fontExtraLargeClass]) {
      cssClasses.delete(cssClass);
      ngCssClasses.delete(cssClass);
    }

    cssClasses.add(activeFontScaleCategory);
    ngCssClasses.set(activeFontScaleCategory, true);
  }

  const isModal = cssClasses.has(nsModalClass);
  const isRoot = !isModal && cssClasses.has(nsRootClass);

  if (isModal || isRoot) {
    if (!cssClasses.has(currentA11YStatusClass)) {
      for (const cssClass of [a11yServiceEnabledClass, a11yServiceDisabledClass]) {
        cssClasses.delete(cssClass);
        ngCssClasses.delete(cssClass);
      }

      cssClasses.add(currentA11YStatusClass);
      ngCssClasses.set(currentA11YStatusClass, true);
    }

    if (!cssClasses.has(rootA11YClass)) {
      cssClasses.add(rootA11YClass);
      ngCssClasses.set(rootA11YClass, true);
    }
  }

  view[cssClassesLastChangedPropName] = lastChangeId;

  return cssClasses;
});

const setHelperCssRecursively = profile('A11Y.setHelperCssRecursively()', function(view: View) {
  if (!view) {
    return false;
  }

  updateViewCssClasses(view);

  view.eachChildView(setHelperCssRecursively);
  return true;
});

const updateRootViews = profile('A11Y:updateRootViews()', function(event?: any) {
  event = { ...event };
  const localCls = `${cls}.updateRootViews({eventName: ${event.eventName}})`;
  updateCurrentHelperClasses();

  const rootView = nsApp.getRootView();
  if (rootView) {
    const isValid = isViewClassesValid(rootView);
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls} - update rootView ${rootView}. isValid: ${isValid}`);
    }

    setHelperCssRecursively(rootView);
    if (!isValid) {
      rootView._onCssStateChange();
    }
  } else {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls} - no rootView`);
    }
  }

  for (const view of getModalViews()) {
    const isValid = isViewClassesValid(view);
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls} - update modal ${view}. isValid: ${isValid}`);
    }

    setHelperCssRecursively(rootView);
    if (!isValid) {
      view._onCssStateChange();
    }
  }
});

/**
 * Get loaded modal views
 */
function getModalViews() {
  const views = [] as View[];
  for (const [id, viewRef] of loadedModalViewRefs) {
    const view = viewRef.get();
    if (!view) {
      // This view doesn't exists anymore, remove the WeakRef from the set.
      loadedModalViewRefs.delete(id);
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
function addModalViewRef(modalView: View) {
  for (const [id, viewRef] of loadedModalViewRefs) {
    const otherView = viewRef.get();
    if (!otherView) {
      // This view doesn't exists anymore, remove the WeakRef from the set.
      loadedModalViewRefs.delete(id);
      continue;
    }
  }

  loadedModalViewRefs.set(`${modalView}`, new WeakRef(modalView));
}

let activeFontScaleClass = fontScaleCssClasses.get(1);
let activeFontScaleCategory = fontExtraMediumClass;
let currentA11YStatusClass = '';

let lastChangeId = -1;

const fontScaleObservable = new FontScaleObservable();
const a11yServiceObservable = new AccessibilityServiceEnabledObservable();

/**
 * Update the helper CSS-classes.
 * Return true is any changes.
 */
function updateCurrentHelperClasses() {
  const { fontScale, isExtraSmall, isExtraLarge } = fontScaleObservable;

  let changed = false;
  const oldFontScaleClass = activeFontScaleClass;

  if (fontScaleCssClasses.has(fontScale)) {
    activeFontScaleClass = fontScaleCssClasses.get(fontScale);
  } else {
    activeFontScaleClass = fontScaleCssClasses.get(1);
  }

  if (oldFontScaleClass !== activeFontScaleClass) {
    changed = true;
  }

  let oldActiveFontScaleCategory = activeFontScaleCategory;
  if (isAndroid || (!isExtraSmall && !isExtraLarge)) {
    activeFontScaleCategory = fontExtraMediumClass;
  } else if (isExtraSmall) {
    activeFontScaleCategory = fontExtraSmallClass;
  } else if (isExtraLarge) {
    activeFontScaleCategory = fontExtraLargeClass;
  }

  if (activeFontScaleCategory !== oldActiveFontScaleCategory) {
    changed = true;
  }

  const oldA11YStatusClass = currentA11YStatusClass;
  if (a11yServiceObservable.accessibilityServiceEnabled) {
    currentA11YStatusClass = a11yServiceEnabledClass;
  } else {
    currentA11YStatusClass = a11yServiceDisabledClass;
  }

  if (oldA11YStatusClass !== currentA11YStatusClass) {
    changed = true;
  }

  if (changed) {
    lastChangeId += 1;
  }

  return changed;
}

fontScaleObservable.on(
  Observable.propertyChangeEvent,
  profile('A11Y:fontScaleChanged()', (event) => {
    const { fontScale } = fontScaleObservable;
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
    }

    updateRootViews(event);
  }),
);

a11yServiceObservable.on(
  Observable.propertyChangeEvent,
  profile('A11Y:a11yServiceChanged', (event) => {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${cls}: a11yServiceObservable.accessibilityServiceEnabled = ${a11yServiceObservable.accessibilityServiceEnabled}`);
    }

    updateRootViews(event);
  }),
);

hmrSafeGlobalEvents(`updateRootViews`, [nsApp.displayedEvent, nsApp.resumeEvent], nsApp, updateRootViews);
hmrSafeGlobalEvents(`ShowingModallyEventFontScale`, [View.shownModallyEvent], View, (evt) => modalViewLoaded(evt.object));
hmrSafeGlobalEvents('updateViewCssClasses', [View.loadedEvent], View, (evt) => updateViewCssClasses(evt.object));

function isViewClassesValid(view: ViewBase): boolean {
  const cssClasses = view[cssClassesPropName] as Set<string>;
  if (cssClasses.size === 0) {
    // If the view have just been created or cssClasses.clear() have been called the view's classes are no longer valid.
    return false;
  }

  if (view[cssClassesLastChangedPropName] !== lastChangeId) {
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

// Overriding cssClasses-property on the ViewBase-class to add the a11y-helper-classes.
Object.defineProperty(ViewBase.prototype, 'cssClasses', {
  configurable: true,
  get(this: ViewBase) {
    const cssClasses = this[cssClassesPropName] as Set<string>;
    if (!isViewClassesValid(this)) {
      return updateViewCssClasses(this);
    }

    return cssClasses;
  },
  set(this: ViewBase, cssClasses: Set<string>) {
    this[cssClassesPropName] = cssClasses;
    updateViewCssClasses(this);
  },
});

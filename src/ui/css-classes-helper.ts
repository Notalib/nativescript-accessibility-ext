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

const cls = `FontScaling`;

const modalViewLoaded = profile('A11Y:modalViewLoaded()', function(modalView: View) {
  addModalViewRef(modalView);
});

const updateRootViews = profile('A11Y:updateRootViews()', function() {
  const localCls = `${cls}.updateRootViews()`;
  if (!updateCurrentHelperClasses()) {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls} - no changes`);
    }

    return;
  }

  const rootView = nsApp.getRootView();
  if (rootView) {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls} - update rootView ${rootView}`);
    }

    rootView._onCssStateChange();
  }

  for (const view of getModalViews()) {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls} - update modal ${view}`);
    }

    view._onCssStateChange();
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

const fontScaleObservable = new FontScaleObservable();
const a11yServiceObservable = new AccessibilityServiceEnabledObservable();

/**
 * Update the helper CSS-classes.
 * Return true is any changes.
 */
const updateCurrentHelperClasses = profile('A11Y:updateCurrentHelperClasses()', function() {
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
  } else if (fontScaleObservable.isExtraSmall) {
    activeFontScaleCategory = fontExtraSmallClass;
  } else if (fontScaleObservable.isExtraLarge) {
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

  return changed;
});

fontScaleObservable.on(
  Observable.propertyChangeEvent,
  profile('A11Y:fontScaleChanged()', () => {
    const { fontScale } = fontScaleObservable;
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
    }

    updateRootViews();
  }),
);

a11yServiceObservable.on(
  Observable.propertyChangeEvent,
  profile('A11Y:a11yServiceChanged', () => {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${cls}: a11yServiceObservable.accessibilityServiceEnabled = ${a11yServiceObservable.accessibilityServiceEnabled}`);
    }

    updateRootViews();
  }),
);

function bindGlobalEventOnObjectHmrSafe(fnName: string, events: string[], obj: any, callback: (...args: any[]) => any) {
  if (fnName in obj) {
    for (const eventName of events) {
      obj.off(eventName, obj[fnName]);
    }
  }

  obj[fnName] = callback;
  for (const eventName of events) {
    obj.on(eventName, obj[fnName]);
  }
}

bindGlobalEventOnObjectHmrSafe(`updateRootViews`, [nsApp.launchEvent, nsApp.displayedEvent, nsApp.resumeEvent], nsApp, updateRootViews);
bindGlobalEventOnObjectHmrSafe(`ShowingModallyEventFontScale`, [View.shownModallyEvent], View, (evt) => modalViewLoaded(evt.object));

// Overriding cssClasses-property on the ViewBase-class to add the a11y-helper-classes.
const cssClassesPropName = '_a11yCssClasses';
Object.defineProperty(ViewBase.prototype, 'cssClasses', {
  configurable: true,
  get(this: ViewBase) {
    const cssClasses = this[cssClassesPropName] as Set<string>;
    if (!activeFontScaleClass || !currentA11YStatusClass) {
      updateCurrentHelperClasses();
    }

    if (!cssClasses.has(activeFontScaleClass)) {
      for (const cssClass of fontScaleCssClasses.values()) {
        cssClasses.delete(cssClass);
      }

      cssClasses.add(activeFontScaleClass);
    }

    if (!cssClasses.has(activeFontScaleCategory)) {
      cssClasses.delete(fontExtraSmallClass);
      cssClasses.delete(fontExtraMediumClass);
      cssClasses.delete(fontExtraLargeClass);
      cssClasses.add(activeFontScaleCategory);
    }

    const isModal = cssClasses.has(getModalRootViewCssClass());
    const isRoot = !isModal && cssClasses.has(getRootViewCssClasses()[0]);

    if (isModal || isRoot) {
      if (!cssClasses.has(currentA11YStatusClass)) {
        cssClasses.delete(a11yServiceEnabledClass);
        cssClasses.delete(a11yServiceDisabledClass);
        cssClasses.add(currentA11YStatusClass);
      }

      if (!cssClasses.has(rootA11YClass)) {
        cssClasses.add(rootA11YClass);
      }
    }

    return cssClasses;
  },
  set(cssClasses: Set<string>) {
    this[cssClassesPropName] = cssClasses;
  },
});

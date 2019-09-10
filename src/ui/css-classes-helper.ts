/// <reference path="./core/view.d.ts" />

import { EventData, Observable } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { viewSetCssClasses } from '../utils/helpers';
import { AccessibilityServiceEnabledObservable } from '../utils/utils';

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

function fontScaleToShortHandCssClass(fontScale: number) {
  return `ayfs-${Number(fontScale * 100).toFixed(0)}`;
}

const fontScaleCssClasses = new Map(
  FontScaleObservable.VALID_FONT_SCALES.map((fontScale) => [
    fontScale,
    {
      cssClass: fontScaleToCssClass(fontScale),
      shortHandCssClass: fontScaleToShortHandCssClass(fontScale),
    },
  ]),
);

/**
 * Keep a list of WeakRefs to loaded views.
 * These are needed when the fontScale value changes.
 **/
const loadedViewRefs = new Set<WeakRef<View>>();

const platformClass = isAndroid ? 'android' : 'ios';
const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;
const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;

const cls = `FontScaling`;

function setViewHelperCssClasses(views: View[], newFontScale: number, isExtraSmall: boolean, isExtraLarge: boolean) {
  const a11yCssClasses = {
    [platformClass]: true,
    [fontExtraSmallClass]: isIOS && isExtraSmall,
    [fontExtraLargeClass]: isIOS && isExtraLarge,
    [fontExtraMediumClass]: isAndroid || !(isExtraSmall && isExtraLarge),
  } as { [className: string]: boolean };

  if (!newFontScale || isNaN(newFontScale)) {
    newFontScale = 1;
  }

  for (const [fontScale, { cssClass, shortHandCssClass }] of fontScaleCssClasses) {
    a11yCssClasses[cssClass] = fontScale === newFontScale;
    a11yCssClasses[shortHandCssClass] = fontScale === newFontScale;
  }

  for (const view of views) {
    if (!view || !view.isLoaded) {
      continue;
    }

    const localCls = `${cls}.setViewHelperCssClasses(${view}, ${newFontScale})`;
    if (!view) {
      if (isTraceEnabled()) {
        writeFontScaleTrace(`${localCls}: view is undefined`);
      }

      continue;
    }

    const oldViewClassNames = view.className || '';

    if (viewSetCssClasses(view, a11yCssClasses)) {
      if (isTraceEnabled()) {
        const postViewClassNames = (view.className || '').trim();
        writeFontScaleTrace(`${localCls}: change from '${oldViewClassNames}' to '${postViewClassNames}'`);
      }
    }
  }
}

function setViewA11YServiceClassesHelper(views: View[], a11yServiceEnabled: boolean) {
  const a11yCssClasses = {
    [a11yServiceEnabledClass]: a11yServiceEnabled,
    [a11yServiceDisabledClass]: !a11yServiceEnabled,
  };

  for (const view of views) {
    const localCls = `${cls}.setViewHelperCssClasses(${view}, ${a11yServiceEnabled})`;

    const oldViewClassNames = view.className || '';

    if (viewSetCssClasses(view, a11yCssClasses)) {
      if (isTraceEnabled()) {
        const postViewClassNames = (view.className || '').trim();
        writeFontScaleTrace(`${localCls}: change from '${oldViewClassNames}' to '${postViewClassNames}'`);
      }
    }
  }
}

function getLoadedViews() {
  const views = [] as View[];
  for (const viewRef of loadedViewRefs) {
    const view = viewRef.get();
    if (!view) {
      // This view doesn't exists anymore, remove the WeakRef from the set.
      loadedViewRefs.delete(viewRef);
      continue;
    }

    views.push(view);
  }

  return views;
}

const fontScaleObservable = new FontScaleObservable();
fontScaleObservable.on(Observable.propertyChangeEvent, () => {
  const { fontScale, isExtraSmall, isExtraLarge } = fontScaleObservable;
  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
  }

  setViewHelperCssClasses(getLoadedViews(), fontScale, isExtraSmall, isExtraLarge);
});

const a11yServiceObservable = new AccessibilityServiceEnabledObservable();
a11yServiceObservable.on(Observable.propertyChangeEvent, () =>
  setViewA11YServiceClassesHelper(getLoadedViews(), a11yServiceObservable.accessibilityServiceEnabled),
);

function applyCssClassesOnLoad({ object: view }: EventData) {
  if (!(view instanceof View)) {
    return;
  }

  for (const viewRef of loadedViewRefs) {
    const otherView = viewRef.get();
    if (!otherView) {
      // This view doesn't exists anymore, remove the WeakRef from the set.
      loadedViewRefs.delete(viewRef);
      continue;
    }

    if (otherView === view) {
      // Already in list.
      return;
    }
  }

  const { fontScale, isExtraSmall, isExtraLarge } = fontScaleObservable;
  setViewHelperCssClasses([view], fontScale, !!isExtraSmall, !!isExtraLarge);
  setViewA11YServiceClassesHelper([view], a11yServiceObservable.accessibilityServiceEnabled);
  loadedViewRefs.add(new WeakRef(view));
}

if (View['applyCssClassesOnLoad']) {
  // Handle HMR restart
  View.off(View.loadedEvent, View['applyCssClassesOnLoad']);
}
View['applyCssClassesOnLoad'] = applyCssClassesOnLoad;

View.on(View.loadedEvent, applyCssClassesOnLoad);

function tearDownApplyCssClassesOnUnload({ object: view }: EventData) {
  if (!(view instanceof View)) {
    return;
  }

  for (const viewRef of loadedViewRefs) {
    const otherView = viewRef.get();
    if (!otherView) {
      // This view doesn't exists anymore, remove the WeakRef from the set.
      loadedViewRefs.delete(viewRef);
      continue;
    }

    if (otherView === view) {
      loadedViewRefs.delete(viewRef);
      return;
    }
  }
}

if (View['tearDownFontScaleOnUnload']) {
  // Handle HMR restart
  View.off(View.unloadedEvent, View['tearDownFontScaleOnUnload']);
}
View['tearDownFontScaleOnUnload'] = applyCssClassesOnLoad;

View.on(View.unloadedEvent, tearDownApplyCssClassesOnUnload);

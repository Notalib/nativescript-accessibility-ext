/// <reference path="./core/view.d.ts" />

import { EventData, Observable } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { viewSetCssClass } from '../utils/helpers';
import { isAccessibilityServiceEnabled } from '../utils/utils';

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

const platformClass = isAndroid ? 'ns-android' : 'ns-ios';
const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;
const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;

const cls = `FontScaling`;

function setViewHelperCssClasses(
  view: View,
  newFontScale: number,
  isExtraSmall: boolean,
  isExtraLarge: boolean,
  a11yServiceEnabled = isAccessibilityServiceEnabled(),
) {
  if (!view || !view.isLoaded) {
    return;
  }

  if (!newFontScale || isNaN(newFontScale)) {
    newFontScale = 1;
  }

  const localCls = `${cls}.setFontScaleClass(${view}, ${newFontScale})`;
  if (!view) {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls}: view is undefined`);
    }
    return;
  }

  const prevViewClassName = view.className || '';
  viewSetCssClass(view, platformClass, true);
  viewSetCssClass(view, platformClass.replace(/^ns-/, ''), true);
  viewSetCssClass(view, a11yServiceEnabledClass, a11yServiceEnabled);
  viewSetCssClass(view, a11yServiceDisabledClass, !a11yServiceEnabled);

  for (const [fontScale, { cssClass, shortHandCssClass }] of fontScaleCssClasses) {
    viewSetCssClass(view, cssClass, fontScale === newFontScale);
    viewSetCssClass(view, shortHandCssClass, fontScale === newFontScale);
  }

  viewSetCssClass(view, fontExtraSmallClass, isIOS && isExtraSmall);
  viewSetCssClass(view, fontExtraLargeClass, isIOS && isExtraLarge);
  viewSetCssClass(view, fontExtraMediumClass, isAndroid || !(isExtraSmall && isExtraLarge));

  const postViewClassNames = (view.className || '').trim();

  if (prevViewClassName !== postViewClassNames) {
    if (isTraceEnabled()) {
      writeFontScaleTrace(`${localCls}: change from '${prevViewClassName}' to '${postViewClassNames}'`);
    }
  }
}

const fontScaleObservable = new FontScaleObservable();
fontScaleObservable.on(Observable.propertyChangeEvent, () => {
  const { fontScale, isExtraSmall, isExtraLarge } = fontScaleObservable;
  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
  }
  const a11yServiceEnabled = isAccessibilityServiceEnabled();
  for (const viewRef of loadedViewRefs) {
    const view = viewRef.get();
    if (!view) {
      // This view doesn't exists anymore, remove the WeakRef from the set.
      loadedViewRefs.delete(viewRef);
      continue;
    }

    setViewHelperCssClasses(view, fontScale, isExtraSmall, isExtraLarge, a11yServiceEnabled);
  }
});

function applyFontScaleOnLoad({ object: view }: EventData) {
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
  setViewHelperCssClasses(view, fontScale, !!isExtraSmall, !!isExtraLarge);
  loadedViewRefs.add(new WeakRef(view));
}

if (View['applyFontScaleOnLoad']) {
  // Handle HMR restart
  View.off(View.loadedEvent, View['applyFontScaleOnLoad']);
}
View['applyFontScaleOnLoad'] = applyFontScaleOnLoad;

View.on(View.loadedEvent, applyFontScaleOnLoad);

function tearDownFontScaleOnUnload({ object: view }: EventData) {
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
View['tearDownFontScaleOnUnload'] = applyFontScaleOnLoad;

View.on(View.unloadedEvent, tearDownFontScaleOnUnload);

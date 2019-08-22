/// <reference path="./core/view.d.ts" />

import * as nsApp from 'tns-core-modules/application/application';
import { EventData, Observable } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { viewSetCssClasses } from '../utils/helpers';
import { isAccessibilityServiceEnabled } from '../utils/utils';

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

const fontScaleCssClasses = new Map(
  FontScaleObservable.VALID_FONT_SCALES.map((fontScale) => [
    fontScale,
    {
      cssClass: fontScaleToCssClass(fontScale),
    },
  ]),
);

/**
 * Keep a list of WeakRefs to loaded views.
 * These are needed when the fontScale value changes.
 **/
const loadedViewRefs = new Set<WeakRef<View>>();

const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;
const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;

const cls = `FontScaling`;

function setViewHelperCssClasses(views: View[], newFontScale: number, isExtraSmall: boolean, isExtraLarge: boolean, a11yServiceEnabled: boolean) {
  const a11yCssClasses = {
    [a11yServiceEnabledClass]: a11yServiceEnabled,
    [a11yServiceDisabledClass]: !a11yServiceEnabled,
    [fontExtraSmallClass]: isIOS && isExtraSmall,
    [fontExtraLargeClass]: isIOS && isExtraLarge,
    [fontExtraMediumClass]: isAndroid || !(isExtraSmall && isExtraLarge),
  } as { [className: string]: boolean };

  if (!newFontScale || isNaN(newFontScale)) {
    newFontScale = 1;
  }

  for (const [fontScale, { cssClass }] of fontScaleCssClasses) {
    a11yCssClasses[cssClass] = fontScale === newFontScale;
  }

  for (const view of views) {
    if (!view || !view.isLoaded) {
      continue;
    }

    const localCls = `${cls}.setFontScaleClass(${view}, ${newFontScale})`;
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

function setNgRootFontScale(fontScale: number) {
  const rootView = nsApp.getRootView();
  if (!rootView) {
    return;
  }

  rootView.style.setUnscopedCssVariable('--a11y-fontscale-factor', (fontScale || 1).toFixed(2));
  rootView._onCssStateChange();
}

const fontScaleObservable = new FontScaleObservable();
fontScaleObservable.on(Observable.propertyChangeEvent, () => {
  const { fontScale, isExtraSmall, isExtraLarge } = fontScaleObservable;
  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
  }

  setNgRootFontScale(fontScale);

  const a11yServiceEnabled = isAccessibilityServiceEnabled();
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

  setViewHelperCssClasses(views, fontScale, isExtraSmall, isExtraLarge, a11yServiceEnabled);
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
  setViewHelperCssClasses([view], fontScale, !!isExtraSmall, !!isExtraLarge, isAccessibilityServiceEnabled());
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

nsApp.on(nsApp.launchEvent, () => {
  if (fontScaleObservable.fontScale) {
    setNgRootFontScale(fontScaleObservable.fontScale);
  }
});

nsApp.on(nsApp.resumeEvent, () => {
  if (fontScaleObservable.fontScale) {
    setNgRootFontScale(fontScaleObservable.fontScale);
  }
});

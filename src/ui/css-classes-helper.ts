/// <reference path="./core/view.d.ts" />

import * as rdc from 'reduce-css-calc';
import * as nsApp from 'tns-core-modules/application/application';
import { EventData, Observable } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui/core/view';
import { ProxyViewContainer } from 'tns-core-modules/ui/proxy-view-container';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';
import { viewSetCssClasses } from '../utils/helpers';
import { AccessibilityServiceEnabledObservable } from '../utils/utils';

try {
  // WORKAROUND css-calc was broken in 6.1.0 due to import error
  if (!('default' in rdc)) {
    rdc['default'] = rdc;
  }
} catch (err) {
  console.error(err);
}

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

function setViewHelperCssClasses(views: View[], newFontScale: number) {
  const a11yCssClasses = {
    'ns-a11y': true,
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

    const localCls = `${cls}.setViewHelperCssClasses(${view}, ${newFontScale})`;
    if (!view) {
      if (isTraceEnabled()) {
        writeFontScaleTrace(`${localCls}: view is undefined`);
      }

      continue;
    }

    const oldViewClassNames = [...view.cssClasses].join(' ');

    if (viewSetCssClasses(view, a11yCssClasses)) {
      if (isTraceEnabled()) {
        const postViewClassNames = [...view.cssClasses].join(' ');
        writeFontScaleTrace(`${localCls}: change from '${oldViewClassNames}' to '${postViewClassNames}'`);
      }
    }
  }
}

function setNgRootFontScale() {
  const rootView = nsApp.getRootView();
  if (!rootView) {
    return;
  }

  let { isExtraSmall, isExtraLarge } = fontScaleObservable;
  const a11yServiceEnabled = a11yServiceObservable.accessibilityServiceEnabled;

  const localCls = `${cls}.setNgRootFontScale() - ${rootView}`;

  const a11yCssClasses = {
    [a11yServiceEnabledClass]: a11yServiceEnabled,
    [a11yServiceDisabledClass]: !a11yServiceEnabled,
    [fontExtraSmallClass]: isIOS && isExtraSmall,
    [fontExtraLargeClass]: isIOS && isExtraLarge,
    [fontExtraMediumClass]: isAndroid || !(isExtraSmall && isExtraLarge),
    'ns-a11y': true,
  } as { [className: string]: boolean };

  const newFontScale = fontScaleObservable.fontScale || 1;
  for (const [fontScale, { cssClass }] of fontScaleCssClasses) {
    a11yCssClasses[cssClass] = fontScale === newFontScale;
  }

  const oldViewClassNames = [...rootView.cssClasses].join(' ');
  if (viewSetCssClasses(rootView, a11yCssClasses)) {
    if (isTraceEnabled()) {
      const postViewClassNames = [...rootView.cssClasses].join(' ');
      console.log(`${localCls}: change from '${oldViewClassNames}' to '${postViewClassNames}'`);
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
  const { fontScale } = fontScaleObservable;
  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
  }

  setViewHelperCssClasses(getLoadedViews(), fontScale);
});

const a11yServiceObservable = new AccessibilityServiceEnabledObservable();
a11yServiceObservable.on(Observable.propertyChangeEvent, () => setNgRootFontScale());

function applyCssClassesOnLoad({ object: view }: EventData) {
  if (!(view instanceof View)) {
    return;
  }

  if (view instanceof ProxyViewContainer) {
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

  const { fontScale } = fontScaleObservable;
  setViewHelperCssClasses([view], fontScale);
  loadedViewRefs.add(new WeakRef(view));
}

if (View['applyCssClassesOnLoad']) {
  // Handle HMR restart
  View.off(View.loadedEvent, View['applyCssClassesOnLoad']);
}
View['applyCssClassesOnLoad'] = applyCssClassesOnLoad;
View.on(View.loadedEvent, View['applyCssClassesOnLoad']);

function tearDownApplyCssClassesOnUnload({ object: view }: EventData) {
  if (!(view instanceof View)) {
    return;
  }

  if (view instanceof ProxyViewContainer) {
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
View['tearDownFontScaleOnUnload'] = tearDownApplyCssClassesOnUnload;
View.on(View.unloadedEvent, View['tearDownFontScaleOnUnload']);

if (nsApp['setNgRootFontScale']) {
  // Handle HMR restart
  nsApp.off(nsApp.launchEvent, nsApp['setNgRootFontScale']);
  nsApp.off(nsApp.resumeEvent, nsApp['setNgRootFontScale']);
}
nsApp['setNgRootFontScale'] = setNgRootFontScale;

nsApp.on(nsApp.launchEvent, nsApp['setNgRootFontScale']);
nsApp.on(nsApp.resumeEvent, nsApp['setNgRootFontScale']);

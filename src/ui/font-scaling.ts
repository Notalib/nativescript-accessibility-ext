/// <reference path="./core/view.d.ts" />

import { EventData, Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui/core/view';
import { writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';

const fontScaleCssClasses = FontScaleObservable.VALID_FONT_SCALES.map(fontScaleToCssClass);

/**
 * Keep a list of WeakRefs to loaded views.
 * These are needed when the fontScale value changes.
 **/
const loadedViewRefs = new Set<WeakRef<View>>();

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

const cls = `FontScaling`;
function setFontScaleClass(view: View, fontScale: number) {
  const clsSetClass = `${cls}.setFontScaleClass(${view}, ${fontScale})`;
  if (!view) {
    writeFontScaleTrace(`${clsSetClass}: view is undefined`);
    return;
  }

  const oldClassNames = view.className || '';

  const newCssClass = fontScaleToCssClass(fontScale);
  if (!view.cssClasses.has(newCssClass)) {
    view.cssClasses.add(newCssClass);
    writeFontScaleTrace(`${clsSetClass}: '${newCssClass}' added`);
  }

  for (const cssClass of fontScaleCssClasses) {
    if (cssClass === newCssClass) {
      continue;
    }

    if (view.cssClasses.has(cssClass)) {
      view.cssClasses.delete(cssClass);
      writeFontScaleTrace(`${clsSetClass}: '${cssClass}' remove`);
    }
  }

  const newClassNames = [...view.cssClasses].join(' ');
  if (oldClassNames !== newClassNames) {
    writeFontScaleTrace(`${clsSetClass}: change from '${oldClassNames}' to '${newClassNames}'`);
    view.className = newClassNames;
  }
}

const fontScaleObservable = new FontScaleObservable();

fontScaleObservable.on(Observable.propertyChangeEvent, (args: PropertyChangeData) => {
  if (args.propertyName !== FontScaleObservable.FONT_SCALE) {
    return;
  }

  const fontScale = args.value;
  writeFontScaleTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${fontScale}`);
  for (const viewRef of loadedViewRefs) {
    const view = viewRef.get();
    if (!view) {
      // This view doesn't exists anymore, remove the WeakRef from the set.
      loadedViewRefs.delete(viewRef);
      continue;
    }

    setFontScaleClass(view, fontScale);
  }
});

const platformClass = isAndroid ? 'android' : 'ios';
const removePlatformClass = isIOS ? 'android' : 'ios';

View.on(View.loadedEvent, function loadedEventCb({ object: view }: EventData) {
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

  view.cssClasses.add(platformClass);
  view.cssClasses.delete(removePlatformClass);

  view.className = [...view.cssClasses].join(' ');

  const fontScale = fontScaleObservable.get(FontScaleObservable.FONT_SCALE);
  setFontScaleClass(view, fontScale);
  loadedViewRefs.add(new WeakRef(view));
});

View.on(View.unloadedEvent, function unloadedEventCb({ object: view }: EventData) {
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
});

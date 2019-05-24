/// <reference path="./core/view.d.ts" />

import { EventData, Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { isAndroid } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui/core/view';
import { writeFontScaleTrace } from '../trace';
import { FontScaleObservable } from '../utils/FontScaleObservable';
import '../utils/global-events';

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

const fontScaleCssClasses = new Set(FontScaleObservable.VALID_FONT_SCALES.map(fontScaleToCssClass));

/**
 * Keep a list of WeakRefs to loaded views.
 * These are needed when the fontScale value changes.
 **/
const loadedViewRefs = new Set<WeakRef<View>>();

const platformClass = isAndroid ? 'android' : 'ios';

const cls = `FontScaling`;
function setFontScaleClass(view: View, fontScale: number) {
  if (!view || !view.isLoaded) {
    return;
  }

  if (!fontScale || isNaN(fontScale)) {
    fontScale = 1;
  }

  const clsSetClass = `${cls}.setFontScaleClass(${view}, ${fontScale})`;
  if (!view) {
    writeFontScaleTrace(`${clsSetClass}: view is undefined`);
    return;
  }

  const oldViewCssClasses = (view.className || '').trim().split(' ');

  const newCssClass = fontScaleToCssClass(fontScale);
  const newViewCssClasses = [...oldViewCssClasses].filter((className) => className !== platformClass && !fontScaleCssClasses.has(className));

  newViewCssClasses.push(platformClass);
  newViewCssClasses.push(newCssClass);

  const newClassNames = [...newViewCssClasses].join(' ');
  if (view.className !== newClassNames) {
    writeFontScaleTrace(`${clsSetClass}: change from '${oldViewCssClasses.join(' ')}' to '${newClassNames}'`);
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

  const fontScale = fontScaleObservable.get(FontScaleObservable.FONT_SCALE);
  setFontScaleClass(view, fontScale);
  loadedViewRefs.add(new WeakRef(view));

  // Workaround:
  //   The nativescript-angular-binding resets the view.className on first load.
  setTimeout(() => setFontScaleClass(view, fontScale), 0);
}

if (View['applyFontScaleOnLoad']) {
  // Handle HMR restart
  View.off(View.loadedEvent, View['applyFontScaleOnLoad']);
}
View['applyFontScaleOnLoad'] = applyFontScaleOnLoad;

View.on(View.loadedEvent, applyFontScaleOnLoad);

function unapplyFontScaleOnUnload({ object: view }: EventData) {
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

if (View['unapplyFontScaleOnUnload']) {
  // Handle HMR restart
  View.off(View.unloadedEvent, View['unapplyFontScaleOnUnload']);
}
View['unapplyFontScaleOnUnload'] = applyFontScaleOnLoad;

View.on(View.unloadedEvent, unapplyFontScaleOnUnload);

import { Application, Observable, profile, PropertyChangeData } from '@nativescript/core';
import { isTraceEnabled, writeFontScaleTrace } from '../trace';

const getClosestValidFontScale = profile('getClosestValidFontScale', function getClosestValidFontScaleImpl(fontScale: number) {
  fontScale = Number(fontScale) || 1;

  return FontScaleObservable.VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b)).shift();
});

let internalObservable: Observable;
const fontScaleChanged = profile('fontScaleChanged', function fontScaleChangedImpl(origFontScale: number) {
  const fontScale = getClosestValidFontScale(origFontScale);

  const cls = `fontScaleChanged(${fontScale}) - was = ${origFontScale}`;
  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls}`);
  }

  internalObservable.set(FontScaleObservable.FONT_SCALE, fontScale);
});

const useAndroidFontScale = profile('useAndroidFontScale', function useAndroidFontScaleImpl() {
  fontScaleChanged(Number(Application.android.context.getResources().getConfiguration().fontScale));
});

function setupConfigListener() {
  Application.off(Application.launchEvent, setupConfigListener);

  const context = Application.android && (Application.android.context as android.content.Context);

  if (!context) {
    Application.on(Application.launchEvent, setupConfigListener);

    return;
  }

  useAndroidFontScale();

  let configChangedCallback = new android.content.ComponentCallbacks2({
    onLowMemory() {
      // Dummy
    },
    onTrimMemory() {
      // Dummy
    },
    onConfigurationChanged(newConfig: android.content.res.Configuration) {
      fontScaleChanged(Number(newConfig.fontScale));
    },
  });

  context.registerComponentCallbacks(configChangedCallback);
  Application.on(Application.resumeEvent, useAndroidFontScale);
}

function ensureObservable() {
  if (internalObservable) {
    return;
  }

  internalObservable = new Observable();
  setupConfigListener();
}

export class FontScaleObservable extends Observable {
  public static readonly FONT_SCALE = 'fontScale';
  public static readonly IS_EXTRA_SMALL = 'isExtraSmall';
  public static readonly IS_EXTRA_LARGE = 'isExtraSmall';

  public static get VALID_FONT_SCALES() {
    return [0.85, 1, 1.15, 1.3];
  }

  public readonly fontScale = 1;
  public readonly isExtraSmall = false;
  public readonly isExtraLarge = false;

  constructor() {
    super();

    ensureObservable();

    const selfRef = new WeakRef(this);
    const callback = profile('FontScaleObservable.propertyChangeEvent', function (args: PropertyChangeData) {
      const self = selfRef.get();
      if (self) {
        self.set(args.propertyName, args.value);

        return;
      }

      internalObservable.off(Observable.propertyChangeEvent, callback);
    });

    internalObservable.on(Observable.propertyChangeEvent, callback);
    this.set(FontScaleObservable.FONT_SCALE, internalObservable.get(FontScaleObservable.FONT_SCALE));
    this.set(FontScaleObservable.IS_EXTRA_SMALL, false);
    this.set(FontScaleObservable.IS_EXTRA_LARGE, false);
  }
}

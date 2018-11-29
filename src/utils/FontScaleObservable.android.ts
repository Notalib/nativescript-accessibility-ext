import * as nsApp from 'tns-core-modules/application';
import { Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { writeTrace } from './helpers';

function getClosestValidFontScale(fontScale: number) {
  return FontScaleObservable.VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b)).shift();
}

let internalObservable: Observable;

function fontScaleChanged(fontScale: number) {
  writeTrace(`fontScaleChanged: got: ${fontScale}`);

  fontScale = getClosestValidFontScale(fontScale);

  writeTrace(`fontScaleChanged: setting to: ${fontScale}`);

  internalObservable.set(FontScaleObservable.FONT_SCALE, fontScale);
}

function useAndroidFontScale() {
  fontScaleChanged(Number(nsApp.android.context.getResources().getConfiguration().fontScale));
}

function ensureObservable() {
  if (internalObservable) {
    return;
  }

  internalObservable = new Observable();

  useAndroidFontScale();

  nsApp.android.context.registerComponentCallbacks(
    new android.content.ComponentCallbacks2({
      onLowMemory() {
        // Dummy
      },
      onTrimMemory() {
        // Dummy
      },
      onConfigurationChanged(newConfig: android.content.res.Configuration) {
        fontScaleChanged(Number(newConfig.fontScale));
      },
    }),
  );

  nsApp.on(nsApp.resumeEvent, () => {
    useAndroidFontScale();
  });
}

export class FontScaleObservable extends Observable {
  public static FONT_SCALE = 'fontScale';
  public static get VALID_FONT_SCALES() {
    return [0.85, 1, 1.15, 1.3];
  }

  constructor() {
    super();

    ensureObservable();

    const self = new WeakRef(this);

    function callback(args: PropertyChangeData) {
      if (self.get()) {
        self.get().set(args.propertyName, args.value);
      } else {
        internalObservable.off(Observable.propertyChangeEvent, callback);
      }
    }

    internalObservable.on(Observable.propertyChangeEvent, callback);
    this.set(FontScaleObservable.FONT_SCALE, internalObservable.get(FontScaleObservable.FONT_SCALE));
  }
}

import * as nsApp from 'tns-core-modules/application';
import { Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { writeTrace } from './helpers';

function getClosestValidFontScale(fontScale: number) {
  return FontScaleObservable.VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b)).shift();
}

let internalObservable: Observable;
function fontScaleChanged(fontScale: number) {
  const cls = `fontScaleChanged(${fontScale})`;

  writeTrace(`${cls}`);

  fontScale = getClosestValidFontScale(fontScale);

  writeTrace(`${cls} - settings closest vaalid value: ${fontScale}`);

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

    const selfRef = new WeakRef(this);

    function callback(args: PropertyChangeData) {
      const self = selfRef.get();
      if (self) {
        self.set(args.propertyName, args.value);
        return;
      }

      internalObservable.off(Observable.propertyChangeEvent, callback);
    }

    internalObservable.on(Observable.propertyChangeEvent, callback);
    this.set(FontScaleObservable.FONT_SCALE, internalObservable.get(FontScaleObservable.FONT_SCALE));
  }
}

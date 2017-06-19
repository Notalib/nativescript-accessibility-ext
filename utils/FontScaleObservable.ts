import { Observable, PropertyChangeData }  from 'data/observable';

import * as nsApp from 'application';
import { isAndroid, isIOS } from 'platform';
import * as utils from 'utils/utils';

import { writeTrace } from './helpers';

let internalObservable: Observable;
function ensureObservable() {
  if (internalObservable) {
    return;
  }

  internalObservable = new Observable();

  function fixRoundingError(fontScale: number) {
    return Math.floor(fontScale * 100) / 100;
  }

  function fontScaleChanged(fontScale: number) {
    writeTrace(`fontScaleChanged: got: ${fontScale}`);
    fontScale = fixRoundingError(fontScale);
    writeTrace(`fontScaleChanged: got fixed: ${fontScale}`);

    for (const validFontScale of FontScaleObservable.VALID_FONT_SCALES) {
      writeTrace(`fontScaleChanged: ${fontScale} <= ${validFontScale} = ${fontScale <= validFontScale}`);
      if (fontScale <= validFontScale) {
        internalObservable.set(FontScaleObservable.FONT_SCALE, validFontScale);
        return;
      }
    }
  }

  if (isAndroid) {
    const useAndroidFontScale = () => {
      fontScaleChanged(Number(nsApp.android.context.getResources().getConfiguration().fontScale));
    };

    useAndroidFontScale();

    nsApp.android.context.registerComponentCallbacks(new android.content.ComponentCallbacks2({
      onLowMemory() {
        // Dummy
      },
      onTrimMemory() {
        // Dummy
      },
      onConfigurationChanged(newConfig: android.content.res.Configuration) {
        console.log(newConfig.fontScale);
        fontScaleChanged(Number(newConfig.fontScale));
      }
    }));

    nsApp.on(nsApp.resumeEvent, () => {
      useAndroidFontScale();
    });
  } else if (isIOS) {
    const sizeMap = new Map<string, number>([
      [UIContentSizeCategoryExtraSmall, 0.5],
      [UIContentSizeCategorySmall, 0.7],
      [UIContentSizeCategoryMedium, 0.85],
      [UIContentSizeCategoryLarge, 1],
      [UIContentSizeCategoryExtraLarge, 1.15],
      [UIContentSizeCategoryExtraExtraLarge, 1.30],
      [UIContentSizeCategoryExtraExtraExtraLarge, 1.50],
      [UIContentSizeCategoryAccessibilityMedium, 2],
      [UIContentSizeCategoryAccessibilityLarge, 2.5],
      [UIContentSizeCategoryAccessibilityExtraLarge, 3],
      [UIContentSizeCategoryAccessibilityExtraExtraLarge, 3.5],
      [UIContentSizeCategoryAccessibilityExtraExtraExtraLarge, 4],
    ]);

    const contentSizeUpdated = (fontSize: string) => {
      if (sizeMap.has(fontSize)) {
        fontScaleChanged(sizeMap.get(fontSize));
      } else {
        console.error(`fontSize: ${fontSize} is unknown`);
      }
    };

    contentSizeUpdated(utils.ios.getter(nsApp.ios.nativeApp, nsApp.ios.nativeApp.preferredContentSizeCategory));

    const fontSizeObserver = nsApp.ios.addNotificationObserver(UIContentSizeCategoryDidChangeNotification, (args) => {
      const fontSize = args.userInfo.valueForKey(UIContentSizeCategoryNewValueKey);
      contentSizeUpdated(fontSize);
    });

    nsApp.on(nsApp.exitEvent, () => {
      nsApp.ios.removeNotificationObserver(fontSizeObserver, UIContentSizeCategoryDidChangeNotification);
    });
  }
}

export class FontScaleObservable extends Observable {
  public static FONT_SCALE = 'fontScale';
  public static get VALID_FONT_SCALES() {
    return [
      0.5,
      0.7,
      0.85,
      1,
      1.15,
      1.30,
      1.5,
      2,
      2.5,
      3,
      3.5,
      4,
    ];
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

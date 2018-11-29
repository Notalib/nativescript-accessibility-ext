import * as nsApp from 'tns-core-modules/application';
import { Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import * as utils from 'tns-core-modules/utils/utils';
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

function ensureObservable() {
  if (internalObservable) {
    return;
  }

  internalObservable = new Observable();

  const sizeMap = new Map<string, number>([
    [UIContentSizeCategoryExtraSmall, 0.5],
    [UIContentSizeCategorySmall, 0.7],
    [UIContentSizeCategoryMedium, 0.85],
    [UIContentSizeCategoryLarge, 1],
    [UIContentSizeCategoryExtraLarge, 1.15],
    [UIContentSizeCategoryExtraExtraLarge, 1.3],
    [UIContentSizeCategoryExtraExtraExtraLarge, 1.5],
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
      writeTrace(`fontSize: ${fontSize} is unknown`);
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

export class FontScaleObservable extends Observable {
  public static FONT_SCALE = 'fontScale';
  public static get VALID_FONT_SCALES() {
    // iOS supports a wider number of font scales than Android does.
    return [0.5, 0.7, 0.85, 1, 1.15, 1.3, 1.5, 2, 2.5, 3, 3.5, 4];
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

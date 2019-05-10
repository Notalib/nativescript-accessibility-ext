import * as nsApp from 'tns-core-modules/application';
import { Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { isTraceEnabled, writeErrorTrace, writeFontScaleTrace } from '../trace';

function getClosestValidFontScale(fontScale: number) {
  return FontScaleObservable.VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b)).shift();
}

let internalObservable: Observable;
function fontScaleChanged(fontScale: number) {
  const cls = `fontScaleChanged(${fontScale})`;

  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls}`);
  }

  fontScale = getClosestValidFontScale(fontScale);

  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls} - settings closest valid value: ${fontScale}`);
  }

  internalObservable.set(FontScaleObservable.FONT_SCALE, fontScale);
}

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

function setupConfigListener(attempt = 0) {
  if (!nsApp.ios.nativeApp) {
    if (attempt > 10) {
      if (isTraceEnabled()) {
        writeErrorTrace(`App didn't become active couldn't enable font scaling`);
      }

      fontScaleChanged(1);
    } else {
      // Couldn't get launchEvent to trigger.
      setTimeout(() => setupConfigListener(attempt + 1), 10);
    }

    return;
  }

  function contentSizeUpdated(fontSize: string) {
    if (sizeMap.has(fontSize)) {
      fontScaleChanged(sizeMap.get(fontSize));
    } else {
      if (isTraceEnabled()) {
        writeFontScaleTrace(`fontSize: ${fontSize} is unknown`);
      }
    }
  }

  const fontSizeObserver = nsApp.ios.addNotificationObserver(UIContentSizeCategoryDidChangeNotification, (args) => {
    const fontSize = args.userInfo.valueForKey(UIContentSizeCategoryNewValueKey);
    contentSizeUpdated(fontSize);
  });

  nsApp.on(nsApp.exitEvent, () => {
    nsApp.ios.removeNotificationObserver(fontSizeObserver, UIContentSizeCategoryDidChangeNotification);
    internalObservable = null;
  });

  function useIOSFontScale() {
    if (nsApp.ios.nativeApp) {
      contentSizeUpdated(nsApp.ios.nativeApp.preferredContentSizeCategory);
    } else {
      fontScaleChanged(1);
    }
  }

  nsApp.on(nsApp.resumeEvent, useIOSFontScale);

  useIOSFontScale();
}

function ensureObservable() {
  if (internalObservable) {
    return;
  }

  internalObservable = new Observable();
  setupConfigListener();
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

import * as nsApp from '@nativescript/core/application';
import { Observable, PropertyChangeData } from '@nativescript/core/data/observable';
import { profile } from '@nativescript/core/profiling';
import { isTraceEnabled, writeErrorTrace, writeFontScaleTrace } from '../trace';

const getClosestValidFontScale = profile('getClosestValidFontScale', function getClosestValidFontScaleImpl(fontScale: number) {
  fontScale = Number(fontScale) || 1;

  return FontScaleObservable.VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b)).shift();
});

let internalObservable: Observable;
const fontScaleChanged = profile('fontScaleChanged', function fontScaleChangedImpl(origFontScale: number) {
  const cls = `fontScaleChanged(${origFontScale})`;

  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls}`);
  }

  const fontScale = getClosestValidFontScale(origFontScale);

  if (isTraceEnabled()) {
    writeFontScaleTrace(`${cls} - settings closest valid value: ${fontScale}`);
  }

  internalObservable.set(FontScaleObservable.FONT_SCALE, fontScale);
  internalObservable.set(FontScaleObservable.IS_EXTRA_SMALL, fontScale < 0.85);
  internalObservable.set(FontScaleObservable.IS_EXTRA_LARGE, fontScale > 1.5);
});

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

const contentSizeUpdated = profile('contentSizeUpdated', function contentSizeUpdatedImpl(fontSize: string) {
  if (sizeMap.has(fontSize)) {
    fontScaleChanged(sizeMap.get(fontSize));

    return;
  }

  if (isTraceEnabled()) {
    writeFontScaleTrace(`fontSize: ${fontSize} is unknown`);
  }

  fontScaleChanged(1);
});

const useIOSFontScale = profile('useIOSFontScale', function useIOSFontScaleImpl() {
  if (nsApp.ios.nativeApp) {
    contentSizeUpdated(nsApp.ios.nativeApp.preferredContentSizeCategory);
  } else {
    fontScaleChanged(1);
  }
});

function setupConfigListener(attempt = 0) {
  if (!nsApp.ios.nativeApp) {
    if (attempt > 100) {
      if (isTraceEnabled()) {
        writeErrorTrace(`App didn't become active couldn't enable font scaling`);
      }

      fontScaleChanged(1);

      return;
    }

    // Couldn't get launchEvent to trigger.
    setTimeout(() => setupConfigListener(attempt + 1), 1);

    return;
  }

  const fontSizeObserver = nsApp.ios.addNotificationObserver(UIContentSizeCategoryDidChangeNotification, (args) => {
    const fontSize = args.userInfo.valueForKey(UIContentSizeCategoryNewValueKey);
    contentSizeUpdated(fontSize);
  });

  nsApp.on(nsApp.exitEvent, () => {
    nsApp.ios.removeNotificationObserver(fontSizeObserver, UIContentSizeCategoryDidChangeNotification);
    internalObservable = null;

    nsApp.off(nsApp.resumeEvent, useIOSFontScale);
  });

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
  public static readonly FONT_SCALE = 'fontScale';
  public static readonly IS_EXTRA_SMALL = 'isExtraSmall';
  public static readonly IS_EXTRA_LARGE = 'isExtraSmall';

  public static get VALID_FONT_SCALES() {
    // iOS supports a wider number of font scales than Android does.
    return [0.5, 0.7, 0.85, 1, 1.15, 1.3, 1.5, 2, 2.5, 3, 3.5, 4];
  }

  public readonly fontScale = 1;
  public readonly isExtraSmall = false;
  public readonly isExtraLarge = false;

  constructor() {
    super();

    ensureObservable();

    const selfRef = new WeakRef(this);
    const callback = profile('FontScaleObservable.propertyChangeEvent', function(args: PropertyChangeData) {
      const self = selfRef.get();
      if (self) {
        self.set(args.propertyName, args.value);

        return;
      }

      internalObservable.off(Observable.propertyChangeEvent, callback);
    });

    internalObservable.on(Observable.propertyChangeEvent, callback);

    const fontScale = internalObservable.get(FontScaleObservable.FONT_SCALE);
    this.set(FontScaleObservable.IS_EXTRA_SMALL, fontScale < 0.85);
    this.set(FontScaleObservable.IS_EXTRA_LARGE, fontScale > 1.5);
    this.set(FontScaleObservable.FONT_SCALE, fontScale);
  }
}

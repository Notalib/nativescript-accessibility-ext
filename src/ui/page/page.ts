/// <reference path="./page-ext.d.ts" />
import { Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { Page, PageEventData } from 'tns-core-modules/ui/page';
import { FontScaleObservable } from '../../utils/FontScaleObservable';
import '../../utils/global-events';
import { writeTrace } from '../../utils/helpers';

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

function loadedEventCb({ object: page }: PageEventData) {
  setupPageFontScaling(page);
}

export function setupPageFontScaling(page: Page) {
  const cls = `Page<${page}>.fontScale`;
  if (page.fontScaleObservable) {
    writeTrace(`${cls}: already have FontScaleObservable`);
    return;
  }

  writeTrace(`${cls}: loaded -> setting up FontScaleObservable()`);

  const fontScaleObservable = new FontScaleObservable();
  page.fontScaleObservable = fontScaleObservable;

  const fontScaleCssClasses = FontScaleObservable.VALID_FONT_SCALES.map(fontScaleToCssClass);

  writeTrace(`${cls}: loaded -> font scale classes: ${fontScaleCssClasses.join(',')}`);

  const owner = new WeakRef<Page>(page);

  if (isAndroid) {
    page.cssClasses.add('android');
    page.cssClasses.delete('ios');
  } else if (isIOS) {
    page.cssClasses.add('ios');
    page.cssClasses.delete('android');
  }

  page.className = [...page.cssClasses].join(' ');

  const setFontScaleClass = (fontScale: number) => {
    const clsSetClass = `${cls}: setFontScaleClass`;
    writeTrace(`${clsSetClass}: Got fontScale = ${fontScale}`);

    const page = owner.get();
    if (!page) {
      writeTrace(`${cls}: page is undefined`);
      return;
    }

    const oldClassNames = page.className || '';

    const newCssClass = fontScaleToCssClass(fontScale);
    for (const cssClass of fontScaleCssClasses) {
      if (cssClass === newCssClass) {
        page.cssClasses.add(cssClass);
        writeTrace(`${clsSetClass}: '${newCssClass}' added to page`);
      } else if (page.cssClasses.has(cssClass)) {
        page.cssClasses.delete(cssClass);
        writeTrace(`${clsSetClass}: '${cssClass}' remove from page`);
      }
    }

    const newClassNames = [...page.cssClasses].join(' ');
    if (oldClassNames !== newClassNames) {
      writeTrace(`${clsSetClass}: change from '${oldClassNames}' to '${newClassNames}'`);
      page.className = newClassNames;
    }
  };

  const unloadedCb = () => {
    writeTrace(`${cls}: page unloaded remove listener`);

    removeListener();
  };

  const removeListener = () => {
    fontScaleObservable.off(Observable.propertyChangeEvent, cb);
    const page = owner.get();
    if (!page) {
      return;
    }

    delete page.fontScaleObservable;
    page.off(Page.unloadedEvent, unloadedCb);
  };

  const cb = (args: PropertyChangeData) => {
    const page = owner.get();
    if (!page) {
      writeTrace(`${cls}: Page no longer exists remove ${Observable.propertyChangeEvent} listener`);
      removeListener();
      return;
    }

    if (args.propertyName !== FontScaleObservable.FONT_SCALE) {
      return;
    }

    writeTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${args.value}`);
    setFontScaleClass(args.value);
  };

  fontScaleObservable.on(Observable.propertyChangeEvent, cb);
  page.on(Page.unloadedEvent, unloadedCb);

  setFontScaleClass(fontScaleObservable.get(FontScaleObservable.FONT_SCALE));
}

Page.on(Page.loadedEvent, loadedEventCb);

Page.on(Page.navigatedToEvent, (args: PageEventData) => {
  if (Page.disableAnnouncePage) {
    return;
  }
  const page = args.object;

  if (page.disableAnnouncePage) {
    return;
  }

  if (page.actionBarHidden || page.accessibilityLabel) {
    page.accessibilityScreenChanged();
  } else if (!page.actionBar.accessibilityLabel) {
    page.actionBar.accessibilityLabel = page.actionBar.title;
    page.actionBar.accessibilityScreenChanged();
    page.actionBar.accessibilityLabel = null;
  } else {
    page.actionBar.accessibilityScreenChanged();
  }
});

export { Page };

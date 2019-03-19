import 'nativescript-globalevents';

import { Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { Page, PageLoadedEventData } from 'tns-core-modules/ui/page';
import { FontScaleObservable } from '../../utils/FontScaleObservable';
import { writeTrace } from '../../utils/helpers';

import './page-ext';

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

function loadedEventCb({ object: page }: PageLoadedEventData) {
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
    const cls2 = `${cls}: setFontScaleClass:`;
    writeTrace(`${cls2}: Got fontScale = ${fontScale}`);

    const page = owner.get();
    if (!page) {
      writeTrace(`${cls}: page is undefined`);
      return;
    }

    const newCssClass = fontScaleToCssClass(fontScale);
    if (page.cssClasses.has(newCssClass)) {
      writeTrace(`${cls2}: '${newCssClass}' is already defined on page`);
      return;
    }

    for (const cssClass of fontScaleCssClasses) {
      if (cssClass === newCssClass) {
        page.cssClasses.add(cssClass);
        writeTrace(`${cls2}: '${newCssClass}' added to page`);
      } else if (page.cssClasses.has(cssClass)) {
        page.cssClasses.delete(cssClass);
        writeTrace(`${cls2}: '${cssClass}' remove from page`);
      }
    }

    writeTrace(`${cls2}: before change: page.className='${page.className || ''}'`);
    page.className = [...page.cssClasses].join(' ');
    writeTrace(`${cls2}: page.className='${page.className || ''}'`);
  };

  const unloadedCb = () => {
    writeTrace(`${cls}: page unloaded remove listener`);

    removeListener();
  };

  const removeListener = () => {
    fontScaleObservable.off(Observable.propertyChangeEvent, cb);
    const page = owner.get();
    if (page) {
      delete page.fontScaleObservable;

      page.off(Page.unloadedEvent, unloadedCb);
    }
  };

  const cb = (args: PropertyChangeData) => {
    const page = owner.get();
    if (!page) {
      writeTrace(`${cls}: Page no longer exists remove ${Observable.propertyChangeEvent} listener`);
      removeListener();
      return;
    }

    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      writeTrace(`${cls}: ${FontScaleObservable.FONT_SCALE} changed to ${args.value}`);

      setFontScaleClass(args.value);
    }
  };

  fontScaleObservable.on(Observable.propertyChangeEvent, cb);
  page.on(Page.unloadedEvent, unloadedCb);

  setFontScaleClass(fontScaleObservable.get(FontScaleObservable.FONT_SCALE));
}

Page.on(Page.loadedEvent, loadedEventCb);

export { Page };

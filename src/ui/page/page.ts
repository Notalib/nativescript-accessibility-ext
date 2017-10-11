import 'nativescript-globalevents';
import { Page } from 'ui/page';
import { EventData, Observable, PropertyChangeData } from 'data/observable';

import { writeTrace } from '../../utils/helpers';

interface PageLoadedEventData extends EventData {
  object: Page;
}

import { FontScaleObservable } from '../../utils/FontScaleObservable';

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

function loadedEventCb({object: page}: PageLoadedEventData) {
  if ((<any>page).fontScaleObservable) {
    writeTrace(`Page<${page}>.loadedEvent -> already have FontScaleObservable`);
    return;
  }

  writeTrace(`Page<${page}>.fontScale loaded -> setting up FontScaleObservable()`);

  const fontScaleObservable = new FontScaleObservable();
  (<any>page).fontScaleObservable = fontScaleObservable;

  const fontScaleCssClasses = FontScaleObservable.VALID_FONT_SCALES
    .map(fontScaleToCssClass);

  writeTrace(`Page<${page}>.fontScale loaded -> font scale classes: ${fontScaleCssClasses.join(',')}`);

  const owner = new WeakRef<Page>(page);

  const setFontScaleClass = (fontScale: number) => {
    writeTrace(`Page.fontScale: setFontScaleClass: Got fontScale = ${fontScale}`);

    const page = owner.get();
    if (!page) {
      writeTrace(`setFontScaleClass: page is undefined`);
      return;
    }

    const newCssClass = fontScaleToCssClass(fontScale);
    if (page.cssClasses.has(newCssClass)) {
      writeTrace(`Page<${page}>.fontScale: setFontScaleClass: '${newCssClass}' is already defined on page`);
      return;
    }

    for (const cssClass of fontScaleCssClasses) {
      if (cssClass === newCssClass) {
        page.cssClasses.add(cssClass);
        writeTrace(`Page<${page}>.fontScale: setFontScaleClass: '${newCssClass}' added to page`);
      } else if (page.cssClasses.has(cssClass)) {
        page.cssClasses.delete(cssClass);
        writeTrace(`Page<${page}>.fontScale: setFontScaleClass: '${cssClass}' remove from page`);
      }
    }

    writeTrace(`Page<${page}>.fontScale: setFontScaleClass: before change: page.className='${page.className || ''}'`);
    page.className = Array.from(page.cssClasses).join(' ');
    writeTrace(`Page<${page}>.fontScale: setFontScaleClass: page.className='${page.className || ''}'`);
  };

  const unloadedCb = () => {
    writeTrace(`Page<${page}>.fontScale: page unloaded remove listener`);

    removeListener();
  };

  const removeListener = () => {
    fontScaleObservable.off(Observable.propertyChangeEvent, cb);
    const page = owner.get();
    if (page) {
      delete (<any>page).fontScaleObservable;

      page.off(Page.unloadedEvent, unloadedCb);
    }
  };

  const cb = (args: PropertyChangeData) => {
    const page = owner.get();
    if (!page) {
      writeTrace(`Page.fontScale: Page no longe exists remove ${Observable.propertyChangeEvent} listener`);
      removeListener();
      return;
    }

    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      writeTrace(`Page<${page}>.fontScale: ${FontScaleObservable.FONT_SCALE} changed to ${args.value}`);

      setFontScaleClass(args.value);
    }
  };

  fontScaleObservable.on(Observable.propertyChangeEvent, cb);
  page.on(Page.unloadedEvent, unloadedCb);

  setFontScaleClass(fontScaleObservable.get(FontScaleObservable.FONT_SCALE));
}

(<any>Page).on(Page.loadedEvent, loadedEventCb);
export { Page } from 'ui/page';

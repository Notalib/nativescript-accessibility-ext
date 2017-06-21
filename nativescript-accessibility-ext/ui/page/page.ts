import 'nativescript-globalevents';
import { Page } from 'ui/page';
import { EventData, Observable, PropertyChangeData } from 'data/observable';

import { writeTrace } from '../../utils/helpers';

interface PageLoadedEventData extends EventData {
  object: Page;
}

import { FontScaleObservable } from '../../utils/FontScaleObservable';

function loadedEventCb({object: page}: PageLoadedEventData) {
  if ((<any>page).fontScaleObservable) {
    return;
  }

  const fontScaleObservable = new FontScaleObservable();
  (<any>page).fontScaleObservable = fontScaleObservable;

  function fontScaleToCssClass(fontScale: number) {
    return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
  }

  const fontScaleCssClasses = FontScaleObservable.VALID_FONT_SCALES
    .map(fontScaleToCssClass);

  const owner = new WeakRef<Page>(page);

  const setFontScaleClass = (fontScale: number) => {
    writeTrace(`setFontScaleClass: Got fontScale = ${fontScale}`);

    const page = owner.get();
    if (!page) {
      writeTrace(`setFontScaleClass: page is undefined`);
      return;
    }

    const newCssClass = fontScaleToCssClass(fontScale);
    if (page.cssClasses.has(newCssClass)) {
      writeTrace(`setFontScaleClass: '${newCssClass}' is already defined on page`);
      return;
    }

    for (const cssClass of fontScaleCssClasses) {
      if (cssClass === newCssClass) {
        page.cssClasses.add(cssClass);
        writeTrace(`setFontScaleClass: '${newCssClass}' added to page`);
      } else if (page.cssClasses.has(cssClass)) {
        page.cssClasses.delete(cssClass);
        writeTrace(`setFontScaleClass: '${newCssClass}' remove from page`);
      }
    }

    page.className = Array.from(page.cssClasses).join(' ');
    writeTrace(`setFontScaleClass: page.className='${page.className}'`);
  };

  const removeListener = () => {
    delete (<any>page).fontScaleObservable;
    fontScaleObservable.off(Observable.propertyChangeEvent, cb);
  };

  const cb = (args: PropertyChangeData) => {
    const page = owner.get();
    if (!page) {
      writeTrace(`Page.fontScale: Page no longe exists remove ${Observable.propertyChangeEvent} listener`);
      removeListener();
      return;
    }

    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      writeTrace(`Page.fontScale: ${FontScaleObservable.FONT_SCALE} changed to ${args.value}`);

      setFontScaleClass(args.value);
    }
  };

  fontScaleObservable.on(Observable.propertyChangeEvent, cb);

  page.on(Page.unloadedEvent, () => {
    writeTrace(`Page.fontScale: page unloaded remove listener`);
    removeListener();
  });

  setFontScaleClass(fontScaleObservable.get(FontScaleObservable.FONT_SCALE));
}

(<any>Page).on(Page.loadedEvent, loadedEventCb);

import 'nativescript-globalevents';
import { EventData, Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { Page } from 'tns-core-modules/ui/page';
import { FontScaleObservable } from '../../utils/FontScaleObservable';
import { writeTrace } from '../../utils/helpers';
import '../core/view';

export interface PageLoadedEventData extends EventData {
  object: Page;
}

function fontScaleToCssClass(fontScale: number) {
  return `a11y-fontscale-${Number(fontScale * 100).toFixed(0)}`;
}

function loadedEventCb({ object: page }: PageLoadedEventData) {
  setupPageFontScaling(page);
}

export function setupPageFontScaling(page: Page) {
  if ((<any>page).fontScaleObservable) {
    writeTrace(`Page<${page}>.loadedEvent -> already have FontScaleObservable`);
    return;
  }

  writeTrace(`Page<${page}>.fontScale loaded -> setting up FontScaleObservable()`);

  const fontScaleObservable = new FontScaleObservable();
  (<any>page).fontScaleObservable = fontScaleObservable;

  const fontScaleCssClasses = FontScaleObservable.VALID_FONT_SCALES.map(fontScaleToCssClass);

  writeTrace(`Page<${page}>.fontScale loaded -> font scale classes: ${fontScaleCssClasses.join(',')}`);

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
      writeTrace(`Page.fontScale: Page no longer exists remove ${Observable.propertyChangeEvent} listener`);
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

export { Page };

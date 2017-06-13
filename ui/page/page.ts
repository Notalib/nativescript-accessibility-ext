import 'nativescript-globalevents';
import { Page } from 'ui/page';
import { EventData, Observable, PropertyChangeData } from 'data/observable';

interface PageLoadedEventData extends EventData {
  object: Page;
}

import { FontScaleObservable } from '../../utils/FontScaleObservable';

function loadedEventCb({object}: PageLoadedEventData) {
  const fontScaleObservable = new FontScaleObservable();

  const fontScaleCssClasses = FontScaleObservable.VALID_FONT_SCALES
    .map((fontScale) => fontScale.toFixed(2).replace(/\./, '_'))
    .map((fontScaleStr) => `fontscale-${fontScaleStr}`);

  const owner = new WeakRef<Page>(object);

  const cb = (args: PropertyChangeData) => {
    const page = owner.get();
    if (!page) {
      fontScaleObservable.off(Observable.propertyChangeEvent, cb);
      return;
    }

    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      const newCssClass = Number(args.value).toFixed(2).replace(/\./, '_');

      for (const cssClass of fontScaleCssClasses) {
        if (cssClass === newCssClass) {
          page.cssClasses.add(cssClass);
        } else {
          page.cssClasses.delete(cssClass);
        }
      }
    }
  };

  fontScaleObservable.on(Observable.propertyChangeEvent, cb);
}

(<any>Page).on(Page.loadedEvent, loadedEventCb);

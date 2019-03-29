import { Page, EventData } from 'tns-core-modules/ui/page';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

declare module 'tns-core-modules/ui/page' {
  interface PageEventData {
    object: Page;
  }

  interface Page {
    fontScaleObservable?: FontScaleObservable | void;

    /**
     * Disable anounce page on `nagivatedTo`
     */
    disableAnnouncePage?: boolean;
  }

  namespace Page {
    function on(eventNames: string, callback: (data: PageEventData) => void, thisArg?: any): void;
    function addEventListener(eventNames: string, callback: (data: PageEventData) => void, thisArg?: any): void;
    function off(eventNames: string, callback: (data: PageEventData) => void, thisArg?: any): void;
    function removeEventListener(eventNames: string, callback: (data: PageEventData) => void, thisArg?: any): void;

    /**
     * Disable anounce page on `nagivatedTo`
     */
    let disableAnnouncePage: boolean | void;
  }
}

import { Page, EventData } from 'tns-core-modules/ui/page';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

declare module 'tns-core-modules/ui/page' {
  interface PageEventData extends EventData {
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
    /**
     * Disable anounce page on `nagivatedTo`
     */
    let disableAnnouncePage: boolean | void;
  }
}

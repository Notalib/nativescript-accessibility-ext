import { Page, EventData } from 'tns-core-modules/ui/page';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

declare module 'tns-core-modules/ui/page' {
  interface PageEventData extends EventData {
    object: Page;
  }

  interface Page {
    fontScaleObservable?: FontScaleObservable | void;

    /**
     * Disable announce page on `navigatedTo`
     */
    disableAnnouncePage?: boolean;
  }

  namespace Page {
    /**
     * Disable announce page on `navigatedTo`
     */
    var disableAnnouncePage: boolean | void;
  }
}

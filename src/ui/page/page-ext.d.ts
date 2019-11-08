import { Page, EventData } from '@nativescript/core/ui/page';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

declare module '@nativescript/core/ui/page' {
  interface PageEventData extends EventData {
    object: Page;
  }

  interface Page {
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

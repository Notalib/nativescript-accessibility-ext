import { Page, EventData } from '@nativescript/core';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

declare module '@nativescript/core/ui/page' {
  interface PageEventData extends EventData {
    object: Page;
  }

  interface PageNavigatedData extends PageEventData {
    /**
     * The navigation context (optional, may be undefined) passed to the page navigation events method.
     */
    context: any;

    /**
     * Represents if a navigation is forward or backward.
     */
    isBackNavigation: boolean;
  }

  interface Page {
    /**
     * Disable announce page on `navigatedTo`
     */
    disableAnnouncePage?: boolean;

    /**
     * Announce screen changed
     *
     * @param refocus Attempt to set focus to the last focused view on back navigation.
     */
    accessibilityScreenChanged(refocus?: boolean): void;
  }

  namespace Page {
    /**
     * Disable announce page on `navigatedTo`
     */
    var disableAnnouncePage: boolean | void;
  }
}

export { Page };

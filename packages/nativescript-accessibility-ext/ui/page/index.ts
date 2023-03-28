import type { EventData } from '@nativescript/core';
import { Page, PageNavigatedData } from '@nativescript/core/ui/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import '../../utils/global-events';
import { hmrSafeEvents } from '../../utils/helpers';

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

hmrSafeEvents('PageAnnounce', [Page.navigatedToEvent], Page, (args: PageNavigatedData) => {
  const page = args.object;
  if (!page) {
    return;
  }

  const cls = `${page} - PageAnnounce`;
  if (Page.disableAnnouncePage) {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - disabled globally`);
    }

    return;
  }

  if (page.disableAnnouncePage) {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - disabled for ${page}`);
    }

    return;
  }

  page.accessibilityScreenChanged(!!args.isBackNavigation);
});

export { Page };

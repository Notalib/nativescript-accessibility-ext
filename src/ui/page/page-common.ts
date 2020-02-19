/// <reference path="./page.d.ts" />

import { Page, PageNavigatedData } from '@nativescript/core/ui/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import '../../utils/global-events';
import { hmrSafeGlobalEvents } from '../../utils/helpers';

hmrSafeGlobalEvents('PageAnnounce', [Page.navigatedToEvent], Page, (args: PageNavigatedData) => {
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

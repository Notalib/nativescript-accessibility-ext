/// <reference path="./page-ext.d.ts" />

import { Page, PageEventData } from '@nativescript/core/ui/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import '../../utils/global-events';
import { hmrSafeGlobalEvents } from '../../utils/helpers';

hmrSafeGlobalEvents('PageAnnounce', [Page.navigatedToEvent], Page, (args: PageEventData) => {
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

  setTimeout(() => {
    if (page.actionBarHidden) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - action-bar hidden`);
      }

      page.accessibilityScreenChanged();
    } else if (page.accessibilityLabel) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - page has an accessibilityLabel: ${page.accessibilityLabel}`);
      }

      page.accessibilityScreenChanged();
    } else if (page.actionBar.titleView) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} action-bar has a title view: ${page.actionBar.titleView} ${page.actionBar.nativeView}`);
      }

      page.actionBar.titleView.accessibilityScreenChanged();
    } else if (page.actionBar.accessibilityLabel || page.actionBar.title) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} action-bar has an accessibilityLabel="${page.actionBar.accessibilityLabel}" or a title="${page.actionBar.title}"`);
      }

      page.actionBar.accessibilityScreenChanged();
    } else {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - action-bar doesn't have an accessibilityLabel or a title`);
      }

      page.accessibilityScreenChanged();
    }
  }, 10);
});

export { Page };

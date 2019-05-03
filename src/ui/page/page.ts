/// <reference path="./page-ext.d.ts" />

import { Page, PageEventData } from 'tns-core-modules/ui/page';
import '../../utils/global-events';
import { writeTrace } from '../../utils/helpers';

Page.on(Page.navigatedToEvent, (args: PageEventData) => {
  const cls = `Announce page change`;

  const page = args.object;
  if (!page) {
    return;
  }

  if (Page.disableAnnouncePage) {
    writeTrace(`${cls} disabled globally`);
    return;
  }

  if (page.disableAnnouncePage) {
    writeTrace(`${cls} disabled for ${page}`);
    return;
  }

  if (page.actionBarHidden || page.accessibilityLabel) {
    writeTrace(`${cls} action-bar hidden ${!!page.actionBarHidden} or page has an accessibilityLabel: ${page.accessibilityLabel}`);
    page.accessibilityScreenChanged();
  } else if (!page.actionBar.accessibilityLabel) {
    writeTrace(`${cls} action-bar doesn't have an accessibilityLabel use title: ${page.actionBar.title}`);
    page.actionBar.accessibilityLabel = page.actionBar.title;
    page.actionBar.accessibilityScreenChanged();
    page.actionBar.accessibilityLabel = null;
  } else {
    writeTrace(`${cls} action-bar has an accessibilityLabel: ${page.actionBar.accessibilityLabel}`);
    page.actionBar.accessibilityScreenChanged();
  }
});

export { Page };

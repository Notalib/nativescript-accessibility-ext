export * from './page-common';

import { profile } from '@nativescript/core/profiling';
import { Page } from '@nativescript/core/ui/page/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import { getLastFocusedViewOnPage, setViewFunction } from '../../utils';
import { getUIView } from '../../utils/AccessibilityHelper';
import { commonFunctions } from '../core/view-common';

setViewFunction(
  Page,
  commonFunctions.accessibilityScreenChanged,
  profile('Page<A11Y>.accessibilityScreenChanged', function accessibilityScreenChanged(this: Page, refocus = false) {
    const cls = `${this}.${commonFunctions.accessibilityScreenChanged}`;

    if (refocus) {
      const lastFocusedView = getLastFocusedViewOnPage(this);
      if (lastFocusedView) {
        if (isTraceEnabled()) {
          writeTrace(`${cls} - refocus on ${lastFocusedView}`);
        }

        const uiView = getUIView(lastFocusedView);
        if (uiView) {
          UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, uiView);

          return;
        }
      }
    }

    if (this.actionBarHidden) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - action-bar hidden`);
      }

      this.androidSendAccessibilityEvent('window_state_changed');

      return;
    }

    if (this.actionBarHidden) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - action-bar hidden`);
      }

      UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, getUIView(this));

      return;
    }

    if (this.accessibilityLabel) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - page has an accessibilityLabel: ${this.accessibilityLabel}`);
      }

      UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, getUIView(this));

      return;
    }

    if (this.actionBar.accessibilityLabel || this.actionBar.title) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} action-bar has an accessibilityLabel="${this.actionBar.accessibilityLabel}" or a title="${this.actionBar.title}"`);
      }

      UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, this.actionBar.nativeView);

      return;
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls} - action-bar doesn't have an accessibilityLabel or a title`);
    }

    UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, getUIView(this));
  }),
);

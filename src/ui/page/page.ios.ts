export * from './page-common';

import { View } from '@nativescript/core/ui/core/view';
import { Page } from '@nativescript/core/ui/page/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import { setViewFunction } from '../../utils';
import { getUIView } from '../../utils/AccessibilityHelper';
import { commonFunctions } from '../core/view-common';

setViewFunction(Page, commonFunctions.accessibilityScreenChanged, function(this: Page, refocus = false) {
  const cls = `${this}.${commonFunctions.accessibilityScreenChanged}`;

  if (refocus) {
    const lastFocusedView = this['__lastFocusedView'] && (this['__lastFocusedView'].get() as View);
    delete this['__lastFocusedView'];
    if (lastFocusedView && lastFocusedView.parent && lastFocusedView.page === this) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - action-bar hidden`);
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
});

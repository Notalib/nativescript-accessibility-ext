export * from './page-common';
import { Page } from '@nativescript/core/ui/page/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import { getLastFocusedViewOnPage, setViewFunction } from '../../utils';
import { getAndroidView } from '../../utils/AccessibilityHelper';
import { commonFunctions } from '../core/view-common';

setViewFunction(Page, commonFunctions.accessibilityScreenChanged, function(this: Page, refocus = false) {
  const cls = `${this}.${commonFunctions.accessibilityScreenChanged}(${refocus})`;

  if (refocus) {
    const lastFocusedView = getLastFocusedViewOnPage(this);
    if (lastFocusedView) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - refocus on ${lastFocusedView}`);
      }

      const announceView = getAndroidView(lastFocusedView);
      if (announceView) {
        announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_FOCUSED);
        announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED);

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

  if (this.accessibilityLabel) {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - page has an accessibilityLabel: ${this.accessibilityLabel}`);
    }

    this.androidSendAccessibilityEvent('window_state_changed');

    return;
  }

  if (this.actionBar.accessibilityLabel || this.actionBar.title) {
    if (isTraceEnabled()) {
      writeTrace(`${cls} action-bar has an accessibilityLabel="${this.actionBar.accessibilityLabel}" or a title="${this.actionBar.title}"`);
    }

    this.actionBar.accessibilityScreenChanged();

    return;
  }

  if (isTraceEnabled()) {
    writeTrace(`${cls} - action-bar doesn't have an accessibilityLabel or a title`);
  }

  this.androidSendAccessibilityEvent('window_state_changed');
});

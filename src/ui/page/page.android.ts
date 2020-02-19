export * from './page-common';
import { View } from '@nativescript/core/ui/core/view';
import { Page } from '@nativescript/core/ui/page/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import { setViewFunction } from '../../utils';
import { getAndroidView } from '../../utils/AccessibilityHelper';
import { commonFunctions } from '../core/view-common';

setViewFunction(Page, commonFunctions.accessibilityScreenChanged, function(this: Page, refocus = false) {
  const cls = `${this}.${commonFunctions.accessibilityScreenChanged}(${refocus})`;

  if (refocus) {
    const lastFocusedView = this['__lastFocusedView'] && (this['__lastFocusedView'].get() as View);
    delete this['__lastFocusedView'];
    if (lastFocusedView && lastFocusedView.parent && lastFocusedView.page === this) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - action-bar hidden`);
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

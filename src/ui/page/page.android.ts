export * from './page-common';
import { Page } from '@nativescript/core/ui/page/page';
import { isTraceEnabled, writeTrace } from '../../trace';
import { setViewFunction } from '../../utils';
import { commonFunctions } from '../core/view-common';

setViewFunction(Page, commonFunctions.accessibilityScreenChanged, function(this: Page) {
  const cls = `${this}.${commonFunctions.accessibilityScreenChanged}`;

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

export * from '@nativescript/core/ui/action-bar';
import { ActionBar, profile } from '@nativescript/core';
import { setViewFunction, wrapFunction } from '../../utils';
import { AccessibilityHelper, getAndroidView } from '../../utils/AccessibilityHelper';
import { commonFunctions } from '../core/view-common';

setViewFunction(
  ActionBar,
  commonFunctions.accessibilityScreenChanged,
  profile('ActionBar<A11Y>.accessibilityScreenChanged', function accessibilityScreenChanged(this: ActionBar) {
    const androidView = getAndroidView<androidx.appcompat.widget.Toolbar>(this);
    if (!androidView) {
      return;
    }

    const wasFocusable = android.os.Build.VERSION.SDK_INT >= 26 && androidView.getFocusable();
    const hasHeading = android.os.Build.VERSION.SDK_INT >= 28 && androidView.isAccessibilityHeading();
    const importantForA11Y = androidView.getImportantForAccessibility();

    try {
      androidView.setFocusable(false);
      androidView.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);

      let announceView: android.view.View | null = null;

      const numChildren = androidView.getChildCount();
      for (let i = 0; i < numChildren; i += 1) {
        const childView = androidView.getChildAt(i);
        if (!childView) {
          continue;
        }

        childView.setFocusable(true);
        if (childView instanceof androidx.appcompat.widget.AppCompatTextView) {
          announceView = childView;
          if (android.os.Build.VERSION.SDK_INT >= 28) {
            announceView.setAccessibilityHeading(true);
          }
        }
      }

      if (!announceView) {
        announceView = androidView;
      }

      announceView.setFocusable(true);
      announceView.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);

      announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_FOCUSED);
      announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED);
    } catch {
      // ignore
    } finally {
      setTimeout(() => {
        const localAndroidView = getAndroidView(this);
        if (!localAndroidView) {
          return;
        }

        if (android.os.Build.VERSION.SDK_INT >= 28) {
          androidView.setAccessibilityHeading(hasHeading);
        }

        if (android.os.Build.VERSION.SDK_INT >= 26) {
          localAndroidView.setFocusable(wasFocusable);
        }
        localAndroidView.setImportantForAccessibility(importantForA11Y);
      });
    }
  }),
);

for (const fnName of ['update', '_onTitlePropertyChanged']) {
  wrapFunction(
    ActionBar.prototype,
    fnName,
    function (this: ActionBar) {
      AccessibilityHelper.updateContentDescription(this, true);
    },
    'ActionBar',
  );
}

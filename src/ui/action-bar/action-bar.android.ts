export * from '@nativescript/core/ui/action-bar/action-bar';
import { ActionBar } from '@nativescript/core/ui/action-bar/action-bar';
import { setViewFunction } from '../../utils';
import { getAndroidView } from '../../utils/AccessibilityHelper';
import { commonFunctions } from '../core/view-common';

setViewFunction(ActionBar, commonFunctions.accessibilityScreenChanged, function(this: ActionBar) {
  const androidView = getAndroidView<androidx.appcompat.widget.Toolbar>(this);
  if (!androidView) {
    return;
  }

  const wasFocusable = androidView.getFocusable();
  const hasHeading = android.os.Build.VERSION.SDK_INT >= 28 && androidView.isAccessibilityHeading();
  const importantForA11Y = androidView.getImportantForAccessibility();

  try {
    androidView.setFocusable(false);
    androidView.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);

    let announceView: androidx.appcompat.widget.Toolbar | androidx.appcompat.widget.AppCompatTextView = androidView;

    const numChildren = androidView.getChildCount();
    for (let i = 0; i < numChildren; i += 1) {
      const childView = androidView.getChildAt(i);
      if (!childView) {
        continue;
      }

      childView.setFocusable(true);
      if (childView instanceof androidx.appcompat.widget.AppCompatTextView) {
        announceView = childView;
      }
    }

    if (android.os.Build.VERSION.SDK_INT >= 28) {
      announceView.setAccessibilityHeading(true);
    }

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

      localAndroidView.setFocusable(wasFocusable);
      localAndroidView.setImportantForAccessibility(importantForA11Y);
    });
  }
});

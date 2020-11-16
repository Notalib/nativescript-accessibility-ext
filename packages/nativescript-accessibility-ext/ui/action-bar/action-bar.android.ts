export * from '@nativescript/core/ui/action-bar';
import { ActionBar } from '@nativescript/core';
import { setViewFunction, wrapFunction } from '../../utils';
import { AccessibilityHelper, getAndroidView } from '../../utils/accessibility-helper';
import { commonFunctions } from '../core/view-common';

setViewFunction(ActionBar, commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: ActionBar) {
  const nativeView = getAndroidView<androidx.appcompat.widget.Toolbar>(this);
  if (!nativeView) {
    return;
  }

  const wasFocusable = android.os.Build.VERSION.SDK_INT >= 26 && nativeView.getFocusable();
  const hasHeading = android.os.Build.VERSION.SDK_INT >= 28 && nativeView.isAccessibilityHeading();
  const importantForA11Y = nativeView.getImportantForAccessibility();

  try {
    nativeView.setFocusable(false);
    nativeView.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);

    let announceView: android.view.View | null = null;

    const numChildren = nativeView.getChildCount();
    for (let i = 0; i < numChildren; i += 1) {
      const childView = nativeView.getChildAt(i);
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
      announceView = nativeView;
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
        nativeView.setAccessibilityHeading(hasHeading);
      }

      if (android.os.Build.VERSION.SDK_INT >= 26) {
        localAndroidView.setFocusable(wasFocusable);
      }
      localAndroidView.setImportantForAccessibility(importantForA11Y);
    });
  }
});

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

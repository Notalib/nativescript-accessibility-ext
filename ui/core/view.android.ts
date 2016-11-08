import { View } from 'ui/core/view';
import * as proxy from 'ui/core/proxy';
import { PropertyChangeData } from 'ui/core/dependency-observable';

import * as common from './view-common';
import { setNativeValueFn } from '../../utils/helpers';

// Define the ios specific properties with a noop function
for (const propertyName of common.iosProperties) {
  setNativeValueFn(common.View, propertyName);
}

// Android specific
setNativeValueFn(common.View, 'importantForAccessibility', function onImportantForAccessibilityChanged(data: PropertyChangeData) {
  const view = <android.view.View>(<any>data.object)._nativeView;
  const value = data.newValue;
  const oldValue = data.oldValue

  if (!value) {
    view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
    return;
  }

  switch (value.toLowerCase()) {
    case 'no-hide-descendants': {
      if (android.os.Build.VERSION.SDK_INT >= 19) {
        view.setImportantForAccessibility((<any>android.view.View).IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
      } else {
        view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      }
      break;
    }
    case 'yes': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);
      break;
    }
    case 'no': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);
      break;
    }
    default: {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
    }
  }
});

import { AccessibilityHelper } from '../../utils/AccessibilityHelper';
setNativeValueFn(common.View, 'accessibilityComponentType', function onAccessibilityComponentTypeChanged(data: PropertyChangeData) {
  const view = <android.view.View>(<any>data.object)._nativeView;
  const value = data.newValue;

  AccessibilityHelper.updateAccessibilityComponentType(view, value);
});

setNativeValueFn(common.View, 'accessibilityLiveRegion', function onAccessibilityLiveRegionChanged(data: PropertyChangeData) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = <any>(<any>data.object)._nativeView;
    const value = data.newValue;

    switch (value.toLowerCase()) {
      case 'assertive': {
        view.setAccessibilityLiveRegion((<any>android.view.View).ACCESSIBILITY_LIVE_REGION_ASSERTIVE);
        break;
      }
      case 'polite': {
        view.setAccessibilityLiveRegion((<any>android.view.View).ACCESSIBILITY_LIVE_REGION_POLITE);
        break;
      }
      default: {
        view.setAccessibilityLiveRegion((<any>android.view.View).ACCESSIBILITY_LIVE_REGION_NONE);
        break;
      }
    }
  }
});

setNativeValueFn(common.View, 'accessible', function onAccessibleChanged(data: PropertyChangeData) {
  const view = <android.view.View>(<any>data.object)._nativeView;
  const value = data.newValue;

  if (value == void 0) {
    return;
  }

  view.setFocusable(!!value);
});

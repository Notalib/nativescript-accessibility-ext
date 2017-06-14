import { PropertyChangeData } from 'ui/core/dependency-observable';

import * as common from './view-common';
import { setNativeValueFn, setViewFunction } from '../../utils/helpers';

function tnsViewToAndroidView(view: any): android.view.View {
  return view._nativeView;
}

// Define the ios specific properties with a noop function
for (const propertyName of common.iosProperties) {
  setNativeValueFn(common.View, propertyName);
}

for (const fnName of common.iosFunctions) {
  setViewFunction(common.View, fnName);
}

// Android specific
setNativeValueFn(common.View, 'importantForAccessibility', function onImportantForAccessibilityChanged(data: PropertyChangeData) {
  const view = tnsViewToAndroidView(data.object);
  const value = data.newValue;

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
  const view = tnsViewToAndroidView(data.object);
  const value = data.newValue;

  AccessibilityHelper.updateAccessibilityComponentType(view, value);
});

setNativeValueFn(common.View, 'accessibilityLiveRegion', function onAccessibilityLiveRegionChanged(data: PropertyChangeData) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = <any>tnsViewToAndroidView(data.object);

    const value = data.newValue || '';

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
  const view = tnsViewToAndroidView(data.object);
  const value = data.newValue;

  view.setFocusable(!!value);
});

setViewFunction(common.View, 'sendAccessibilityEvent', function sendAccessibilityEvent(this: common.View, eventName: string, msg?: string) {
  const view = tnsViewToAndroidView(this);
  if (view) {
    AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
  } else {
    const loadedFn = () => {
      const view = tnsViewToAndroidView(this);

      if (view) {
        AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
      }

      this.off(common.View.loadedEvent, loadedFn);
    };

    this.on(common.View.loadedEvent, loadedFn);
  }
});

setViewFunction(common.View, 'accessibilityAnnouncement', function accessibilityAnnouncement(this: common.View, msg?: string) {
  this.sendAccessibilityEvent('announcement', msg);
});

setNativeValueFn(common.View, 'accessibilityLabel', function onAccessibilityLabelChanged(data: PropertyChangeData) {
  const view = <android.view.View>(<any>data.object)._nativeView;
  view.setContentDescription(`${data.newValue}`);
});

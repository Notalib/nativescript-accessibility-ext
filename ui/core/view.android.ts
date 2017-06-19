import { PropertyChangeData } from 'ui/core/dependency-observable';

import * as common from './view-common';
import { setNativeValueFn, setViewFunction, writeTrace } from '../../utils/helpers';

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
    writeTrace(`View<android>.importantForAccessibility - value: ${value} is falsy setting to 'auto'`);
    return;
  }

  switch (value.toLowerCase()) {
    case 'no-hide-descendants': {
      if (android.os.Build.VERSION.SDK_INT >= 19) {
        view.setImportantForAccessibility((<any>android.view.View).IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        writeTrace(`View<android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS`);
      } else {
        writeTrace(`View<android>.importantForAccessibility - value: ${value}, but sdk is ${android.os.Build.VERSION.SDK_INT} < 19. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
        view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      }
      break;
    }
    case 'yes': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);
      writeTrace(`View<android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES`);
      break;
    }
    case 'no': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);
      writeTrace(`View<android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO`);
      break;
    }
    default: {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      writeTrace(`View<android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
    }
  }
});

import { AccessibilityHelper } from '../../utils/AccessibilityHelper';
setNativeValueFn(common.View, 'accessibilityComponentType', function onAccessibilityComponentTypeChanged(data: PropertyChangeData) {
  const view = tnsViewToAndroidView(data.object);
  const value = data.newValue;

  AccessibilityHelper.updateAccessibilityComponentType(data.object, view, value);
  writeTrace(`View<android>.accessibilityComponentType - value: ${value}.`);
});

setNativeValueFn(common.View, 'accessibilityLiveRegion', function onAccessibilityLiveRegionChanged(data: PropertyChangeData) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = <any>tnsViewToAndroidView(data.object);

    const value = data.newValue || '';

    switch (value.toLowerCase()) {
      case 'assertive': {
        view.setAccessibilityLiveRegion((<any>android.view.View).ACCESSIBILITY_LIVE_REGION_ASSERTIVE);
        writeTrace(`View<android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE`);
        break;
      }
      case 'polite': {
        view.setAccessibilityLiveRegion((<any>android.view.View).ACCESSIBILITY_LIVE_REGION_POLITE);
        writeTrace(`View<android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE`);
        break;
      }
      default: {
        view.setAccessibilityLiveRegion((<any>android.view.View).ACCESSIBILITY_LIVE_REGION_NONE);
        writeTrace(`View<android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_NONE`);
        break;
      }
    }
  } else {
    writeTrace(`View<android>.accessibilityLiveRegion - not support on SDK < 19`);
  }
});

setNativeValueFn(common.View, 'accessible', function onAccessibleChanged(data: PropertyChangeData) {
  const view = tnsViewToAndroidView(data.object);
  const value = !!data.newValue;

  view.setFocusable(value);
  writeTrace(`View<android>.accessible = ${value}`);

  if (value) {
    AccessibilityHelper.updateAccessibilityComponentType(data.object, view, AccessibilityHelper.PLAIN);
  } else {
    AccessibilityHelper.removeAccessibilityComponentType(view);
  }
});

setViewFunction(common.View, 'sendAccessibilityEvent', function sendAccessibilityEvent(this: common.View, eventName: string, msg?: string) {
  const view = tnsViewToAndroidView(this);
  if (view) {
    writeTrace(`View<android>.sendAccessibilityEvent(..) -> ${eventName} -> ${msg}`);
    AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
  } else {
    writeTrace(`View<android>.sendAccessibilityEvent(..) -> waiting for view to be loaded`);

    const loadedFn = () => {
      const view = tnsViewToAndroidView(this);

      if (view) {
        writeTrace(`View<android>.sendAccessibilityEvent(..) -> view loaded -> ${eventName} -> ${msg}`);
        AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
      } else {
        writeTrace(`View<android>.sendAccessibilityEvent(..) -> view not loaded -> ${eventName} -> ${msg}`);
      }

      this.off(common.View.loadedEvent, loadedFn);
    };

    this.on(common.View.loadedEvent, loadedFn);
  }
});

setViewFunction(common.View, 'accessibilityAnnouncement', function accessibilityAnnouncement(this: common.View, msg?: string) {
  writeTrace(`View<android>.accessibilityAnnouncement(..) -> ${msg}`);
  this.sendAccessibilityEvent('announcement', msg);
});

import { View } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeTrace } from '../../trace';
import { AccessibilityHelper } from '../../utils/AccessibilityHelper';
import { setViewFunction } from '../../utils/helpers';
import * as common from './view-common';

function getAndroidView(view: View): android.view.View {
  return view.nativeView || view.nativeViewProtected;
}

function getViewCompat() {
  return android.support.v4.view.ViewCompat;
}

View.prototype[common.importantForAccessibilityProperty.getDefault] = function importantForAccessibilityGetDefault(this: View) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = nativeView is missing`);
    }
    return 'auto';
  }

  const viewCompat = getViewCompat();

  const value = viewCompat.getImportantForAccessibility(androidView);
  if (!value) {
    return 'auto';
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS`);
    }
    return 'no-hide-descendants';
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_YES) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES`);
    }
    return 'yes';
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_NO) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO`);
    }
    return 'no';
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_AUTO) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
    }
    return 'auto';
  }

  return 'auto';
};

View.prototype[common.importantForAccessibilityProperty.setNative] = function importantForAccessibilitySetNative(this: View, value: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  const viewCompat = getViewCompat();

  if (!value) {
    viewCompat.setImportantForAccessibility(androidView, viewCompat.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value} is falsy setting to 'auto'`);
    }
    return;
  }

  switch (value.toLowerCase()) {
    case 'no-hide-descendants': {
      viewCompat.setImportantForAccessibility(androidView, viewCompat.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS`);
      }
      break;
    }
    case 'yes': {
      viewCompat.setImportantForAccessibility(androidView, viewCompat.IMPORTANT_FOR_ACCESSIBILITY_YES);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to IMPORTANT_FOR_ACCESSIBILITY_YES`);
      }
      break;
    }
    case 'no': {
      viewCompat.setImportantForAccessibility(androidView, viewCompat.IMPORTANT_FOR_ACCESSIBILITY_NO);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to IMPORTANT_FOR_ACCESSIBILITY_NO`);
      }
      break;
    }
    default: {
      viewCompat.setImportantForAccessibility(androidView, viewCompat.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
      }
    }
  }
};

View.prototype[common.accessibilityComponentTypeProperty.getDefault] = function accessibilityComponentTypeGetDefault(this: View) {
  return null;
};

View.prototype[common.accessibilityComponentTypeProperty.setNative] = function accessibilityComponentTypeSetNative(this: View, value: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  AccessibilityHelper.updateAccessibilityComponentType(this, androidView, value);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityComponentType - value: ${value}.`);
  }
};

View.prototype[common.accessibilityLiveRegionProperty.getDefault] = function accessibilityLiveRegionGetDefault(this: View) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return null;
  }

  const viewCompat = getViewCompat();

  const value = viewCompat.getAccessibilityLiveRegion(androidView);
  if (!value) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'none'`);
    }
    return 'none';
  }

  if (value === viewCompat.ACCESSIBILITY_LIVE_REGION_ASSERTIVE) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'assertive'`);
    }
    return 'assertive';
  }

  if (value === viewCompat.ACCESSIBILITY_LIVE_REGION_POLITE) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'polite'`);
    }
    return 'polite';
  }

  return null;
};

View.prototype[common.accessibilityLiveRegionProperty.setNative] = function accessibilityLiveRegionSetNative(this: View, value: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }
  const viewCompat = getViewCompat();

  switch (value.toLowerCase()) {
    case 'assertive': {
      viewCompat.setAccessibilityLiveRegion(androidView, viewCompat.ACCESSIBILITY_LIVE_REGION_ASSERTIVE);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to ACCESSIBILITY_LIVE_REGION_ASSERTIVE`);
      }
      break;
    }
    case 'polite': {
      viewCompat.setAccessibilityLiveRegion(androidView, viewCompat.ACCESSIBILITY_LIVE_REGION_POLITE);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to ACCESSIBILITY_LIVE_REGION_POLITE`);
      }
      break;
    }
    default: {
      viewCompat.setAccessibilityLiveRegion(androidView, viewCompat.ACCESSIBILITY_LIVE_REGION_NONE);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to ACCESSIBILITY_LIVE_REGION_NONE`);
      }
      break;
    }
  }
};

View.prototype[common.accessibleProperty.getDefault] = function accessibleGetDefault(this: View) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessible - default = nativeView is missing`);
    }
    return false;
  }

  const isAccessible = !!androidView.isFocusable();

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessible - default = ${isAccessible}`);
  }
  return isAccessible;
};

View.prototype[common.accessibleProperty.setNative] = function accessibleSetNative(this: View, isAccessible: boolean) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  if (typeof isAccessible === 'string') {
    isAccessible = `${isAccessible}`.toLowerCase() === 'true';
  }

  androidView.setFocusable(!!isAccessible);

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessible = ${isAccessible}`);
  }

  if (isAccessible) {
    const accessibilityComponentType = this.accessibilityComponentType || AccessibilityHelper.ACCESSIBLE;

    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessible = ${isAccessible} -> accessibilityComponentType=${accessibilityComponentType}`);
    }

    AccessibilityHelper.updateAccessibilityComponentType(this, androidView, accessibilityComponentType);
    return;
  }

  AccessibilityHelper.removeAccessibilityComponentType(androidView);
};

setViewFunction(View, common.androidFunctions.sendAccessibilityEvent, function sendAccessibilityEvent(this: View, eventName: string, msg?: string) {
  const cls = `View<${this}.android>.sendAccessibilityEvent(${eventName} -> ${msg})`;

  let androidView = getAndroidView(this);
  if (androidView) {
    if (isTraceEnabled()) {
      writeTrace(`${cls}`);
    }
    AccessibilityHelper.sendAccessibilityEvent(androidView, eventName, msg);
    return;
  }

  androidView = null;

  if (isTraceEnabled()) {
    writeTrace(`${cls} -> waiting for view to be loaded`);
  }

  this.once(View.loadedEvent, () => {
    androidView = getAndroidView(this);
    if (!androidView) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} -> view not loaded -> ${eventName} -> ${msg}`);
      }
      return;
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls} -> view loaded -> ${eventName} -> ${msg}`);
    }
    AccessibilityHelper.sendAccessibilityEvent(androidView, eventName, msg);
  });
});

setViewFunction(View, common.commonFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  const cls = `View<${this}.android>.accessibilityAnnouncement(${JSON.stringify(msg)})`;

  if (isTraceEnabled()) {
    writeTrace(cls);
  }

  if (!msg) {
    msg = this.accessibilityLabel;

    if (isTraceEnabled()) {
      writeTrace(`${cls} - no msg sending accessibilityLabel = ${JSON.stringify(this.accessibilityLabel)} instead`);
    }
  }

  this.sendAccessibilityEvent('announcement', msg);
});

View.prototype[common.accessibilityLabelProperty.setNative] = function accessibilityLabelSetNative(this: View, label: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  const newValue = AccessibilityHelper.updateContentDescription(this, androidView);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityLabel = "${label}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[common.accessibilityValueProperty.setNative] = function accessibilityLabelSetNative(this: View, value: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  const newValue = AccessibilityHelper.updateContentDescription(this, androidView);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityValue = "${value}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[common.accessibilityHintProperty.setNative] = function accessibilityLabelSetNative(this: View, hint: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  const newValue = AccessibilityHelper.updateContentDescription(this, androidView);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityHint = "${hint}" - contentDesc = "${newValue}"`);
  }
};

setViewFunction(View, common.commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: View) {
  this.sendAccessibilityEvent('window_state_changed');
});

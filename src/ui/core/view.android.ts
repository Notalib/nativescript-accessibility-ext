import { View } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeTrace } from '../../trace';
import { AccessibilityHelper, getAndroidView, getViewCompat } from '../../utils/AccessibilityHelper';
import { setViewFunction } from '../../utils/helpers';
import {
  accessibilityHiddenCssProperty,
  accessibilityHintProperty,
  accessibilityLabelProperty,
  accessibilityLiveRegionCssProperty,
  accessibilityRoleCssProperty,
  accessibilityStateCssProperty,
  accessibilityValueProperty,
  accessibleCssProperty,
  androidFunctions,
  commonFunctions,
} from './view-common';

View.prototype[accessibilityHiddenCssProperty.getDefault] = function accessibilityElementsHiddenGetDefault(this: View) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityElementsHidden - default = nativeView is missing`);
    }

    return 'auto';
  }

  const viewCompat = getViewCompat();

  const value = viewCompat.getImportantForAccessibility(androidView);
  if (!value) {
    return false;
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityElementsHidden - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS => true`);
    }

    return true;
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_YES) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityElementsHidden - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES => false`);
    }

    return false;
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_NO) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityElementsHidden - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO => true`);
    }

    return true;
  }

  if (value === viewCompat.IMPORTANT_FOR_ACCESSIBILITY_AUTO) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityElementsHidden - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO => false`);
    }

    return false;
  }

  return false;
};

View.prototype[accessibilityHiddenCssProperty.setNative] = function accessibilityElementsHiddenSetNative(this: View, isHidden: boolean) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  const viewCompat = getViewCompat();

  if (isHidden) {
    writeTrace(`View<${this}.android>.accessibilityElementsHidden - hide element`);
    viewCompat.setImportantForAccessibility(androidView, viewCompat.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
  } else {
    writeTrace(`View<${this}.android>.accessibilityElementsHidden - show element`);
    viewCompat.setImportantForAccessibility(androidView, viewCompat.IMPORTANT_FOR_ACCESSIBILITY_YES);
  }
};

View.prototype[accessibilityRoleCssProperty.getDefault] = function accessibilityComponentTypeGetDefault(this: View) {
  return null;
};

View.prototype[accessibilityRoleCssProperty.setNative] = function accessibilityComponentTypeSetNative(this: View, value: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  AccessibilityHelper.updateAccessibilityProperties(this);
};

View.prototype[accessibilityStateCssProperty.setNative] = function accessibilityStateSetNative(this: View) {
  AccessibilityHelper.updateAccessibilityProperties(this);
};

View.prototype[accessibilityLiveRegionCssProperty.getDefault] = function accessibilityLiveRegionGetDefault(this: View) {
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

View.prototype[accessibilityLiveRegionCssProperty.setNative] = function accessibilityLiveRegionSetNative(this: View, value: string) {
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

View.prototype[accessibleCssProperty.getDefault] = function accessibleGetDefault(this: View) {
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

View.prototype[accessibleCssProperty.setNative] = function accessibleSetNative(this: View, isAccessible: boolean) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  androidView.setFocusable(!!isAccessible);

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessible = ${isAccessible}`);
  }

  AccessibilityHelper.updateAccessibilityProperties(this);
};

setViewFunction(View, androidFunctions.androidSendAccessibilityEvent, function sendAccessibilityEvent(this: View, eventName: string, msg?: string) {
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

  this.once(View.loadedEvent, (args) => {
    androidView = getAndroidView(args.object as View);
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

setViewFunction(View, commonFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
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

  this.androidSendAccessibilityEvent('announcement', msg);
});

View.prototype[accessibilityLabelProperty.setNative] = function accessibilityLabelSetNative(this: View, label: string) {
  const newValue = AccessibilityHelper.updateContentDescription(this);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityLabel = "${label}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[accessibilityValueProperty.setNative] = function accessibilityLabelSetNative(this: View, value: string) {
  const newValue = AccessibilityHelper.updateContentDescription(this);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityValue = "${value}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[accessibilityHintProperty.setNative] = function accessibilityLabelSetNative(this: View, hint: string) {
  const newValue = AccessibilityHelper.updateContentDescription(this);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityHint = "${hint}" - contentDesc = "${newValue}"`);
  }
};

setViewFunction(View, commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: View) {
  this.androidSendAccessibilityEvent('window_state_changed');
});

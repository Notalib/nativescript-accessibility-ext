import { View } from '@nativescript/core';
import { isTraceEnabled, writeTrace } from '../../trace';
import { AccessibilityHelper, getAndroidView } from '../../utils/accessibility-helper';
import { setViewFunction } from '../../utils/helpers';
import {
  accessibilityHiddenCssProperty,
  accessibilityHintProperty,
  accessibilityLabelProperty,
  accessibilityLiveRegionCssProperty,
  AccessibilityRole,
  accessibilityRoleCssProperty,
  accessibilityStateCssProperty,
  accessibilityValueProperty,
  accessibleCssProperty,
  androidFunctions,
  commonFunctions,
} from './view-common';

View.prototype[accessibilityHiddenCssProperty.setNative] = function accessibilityHiddenSetNative(this: View, value: boolean) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  if (value) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityHidden - hide element`);
    }

    androidView.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
  } else {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityHidden - show element`);
    }

    androidView.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);
  }
};

View.prototype[accessibilityRoleCssProperty.setNative] = function accessibilityComponentTypeSetNative(this: View, value: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  AccessibilityHelper.updateAccessibilityProperties(this);

  if (android.os.Build.VERSION.SDK_INT >= 28) {
    androidView.setAccessibilityHeading(value === AccessibilityRole.Header);
  }
};

View.prototype[accessibilityStateCssProperty.setNative] = function accessibilityStateSetNative(this: View) {
  AccessibilityHelper.updateAccessibilityProperties(this);
};

View.prototype[accessibilityLiveRegionCssProperty.setNative] = function accessibilityLiveRegionSetNative(this: View, value: string) {
  const androidView = getAndroidView(this);
  if (!androidView) {
    return;
  }

  switch (value.toLowerCase()) {
    case 'assertive': {
      androidView.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to ACCESSIBILITY_LIVE_REGION_ASSERTIVE`);
      }
      break;
    }
    case 'polite': {
      androidView.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to ACCESSIBILITY_LIVE_REGION_POLITE`);
      }
      break;
    }
    default: {
      androidView.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_NONE);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to ACCESSIBILITY_LIVE_REGION_NONE`);
      }
      break;
    }
  }
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
    AccessibilityHelper.sendAccessibilityEvent(this, eventName, msg);

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
    AccessibilityHelper.sendAccessibilityEvent(this, eventName, msg);
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
  this._androidContentDescriptionUpdated = true;
  const newValue = AccessibilityHelper.updateContentDescription(this);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityLabel = "${label}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[accessibilityValueProperty.setNative] = function accessibilityLabelSetNative(this: View, value: string) {
  this._androidContentDescriptionUpdated = true;
  const newValue = AccessibilityHelper.updateContentDescription(this);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityValue = "${value}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[accessibilityHintProperty.setNative] = function accessibilityLabelSetNative(this: View, hint: string) {
  this._androidContentDescriptionUpdated = true;
  const newValue = AccessibilityHelper.updateContentDescription(this);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityHint = "${hint}" - contentDesc = "${newValue}"`);
  }
};

setViewFunction(View, commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: View) {
  this.androidSendAccessibilityEvent('window_state_changed');
});

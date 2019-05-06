import { View } from 'tns-core-modules/ui/core/view';
import { AccessibilityHelper } from '../../utils/AccessibilityHelper';
import { isTraceEnabled, setViewFunction, writeTrace } from '../../utils/helpers';
import * as common from './view-common';

function getNativeView(view: View): android.view.View {
  return view.nativeView || view.nativeViewProtected;
}

View.prototype[common.importantForAccessibilityProperty.getDefault] = function importantForAccessibilityGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = nativeView is missing`);
    }
    return 'auto';
  }

  const value = view.getImportantForAccessibility();
  if (!value) {
    return 'auto';
  }

  if (android.os.Build.VERSION.SDK_INT >= 19 && value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS`);
    }
    return 'no-hide-descendants';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES`);
    }
    return 'yes';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO`);
    }
    return 'no';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
    }
    return 'auto';
  }

  return 'auto';
};

View.prototype[common.importantForAccessibilityProperty.setNative] = function importantForAccessibilitySetNative(this: View, value: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (!value) {
    view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value} is falsy setting to 'auto'`);
    }
    return;
  }

  switch (value.toLowerCase()) {
    case 'no-hide-descendants': {
      if (android.os.Build.VERSION.SDK_INT >= 19) {
        view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        if (isTraceEnabled()) {
          writeTrace(
            `View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS`,
          );
        }
      } else {
        if (isTraceEnabled()) {
          writeTrace(
            `View<${this}.android>.importantForAccessibility - value: ${value}, but sdk is ${
              android.os.Build.VERSION.SDK_INT
            } < 19. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`,
          );
        }
        view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      }
      break;
    }
    case 'yes': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES`);
      }
      break;
    }
    case 'no': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO`);
      }
      break;
    }
    default: {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
      }
    }
  }
};

View.prototype[common.accessibilityComponentTypeProperty.getDefault] = function accessibilityComponentTypeGetDefault(this: View) {
  return null;
};

View.prototype[common.accessibilityComponentTypeProperty.setNative] = function accessibilityComponentTypeSetNative(this: View, value: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  AccessibilityHelper.updateAccessibilityComponentType(this, view, value);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityComponentType - value: ${value}.`);
  }
};

View.prototype[common.accessibilityLiveRegionProperty.getDefault] = function accessibilityLiveRegionGetDefault(this: View) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = getNativeView(this);
    if (!view) {
      return null;
    }

    const value = view.getAccessibilityLiveRegion();
    if (!value) {
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'none'`);
      }
      return 'none';
    }

    if (value === android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE) {
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'assertive'`);
      }
      return 'assertive';
    }

    if (value === android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE) {
      if (isTraceEnabled()) {
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'polite'`);
      }
      return 'polite';
    }
  } else {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - not supported`);
    }
  }

  return null;
};

View.prototype[common.accessibilityLiveRegionProperty.setNative] = function accessibilityLiveRegionSetNative(this: View, value: string) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = getNativeView(this);
    if (!view) {
      return;
    }

    switch (value.toLowerCase()) {
      case 'assertive': {
        view.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE);
        if (isTraceEnabled()) {
          writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE`);
        }
        break;
      }
      case 'polite': {
        view.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE);
        if (isTraceEnabled()) {
          writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE`);
        }
        break;
      }
      default: {
        view.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_NONE);
        if (isTraceEnabled()) {
          writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_NONE`);
        }
        break;
      }
    }
  } else {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - not support on SDK < 19`);
    }
  }
};

View.prototype[common.accessibleProperty.getDefault] = function accessibleGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessible - default = nativeView is missing`);
    }
    return false;
  }

  const isAccessible = !!view.isFocusable();

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessible - default = ${isAccessible}`);
  }
  return isAccessible;
};

View.prototype[common.accessibleProperty.setNative] = function accessibleSetNative(this: View, isAccessible: boolean) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (typeof isAccessible === 'string') {
    isAccessible = `${isAccessible}`.toLowerCase() === 'true';
  }

  view.setFocusable(!!isAccessible);

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessible = ${isAccessible}`);
  }

  if (isAccessible) {
    const accessibilityComponentType = this.accessibilityComponentType || AccessibilityHelper.ACCESSIBLE;

    if (isTraceEnabled()) {
      writeTrace(`View<${this}.android>.accessible = ${isAccessible} -> accessibilityComponentType=${accessibilityComponentType}`);
    }

    AccessibilityHelper.updateAccessibilityComponentType(this, view, accessibilityComponentType);
    return;
  }

  AccessibilityHelper.removeAccessibilityComponentType(view);
};

setViewFunction(View, common.androidFunctions.sendAccessibilityEvent, function sendAccessibilityEvent(this: View, eventName: string, msg?: string) {
  const cls = `View<${this}.android>.sendAccessibilityEvent(${eventName} -> ${msg})`;

  const view = getNativeView(this);
  if (view) {
    if (isTraceEnabled()) {
      writeTrace(`${cls}`);
    }
    AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
    return;
  }

  if (isTraceEnabled()) {
    writeTrace(`${cls} -> waiting for view to be loaded`);
  }

  this.once(View.loadedEvent, () => {
    const view = getNativeView(this);
    if (!view) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} -> view not loaded -> ${eventName} -> ${msg}`);
      }
      return;
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls} -> view loaded -> ${eventName} -> ${msg}`);
    }
    AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
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
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  const newValue = AccessibilityHelper.updateContentDescription(this, view);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityLabel = "${label}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[common.accessibilityValueProperty.setNative] = function accessibilityLabelSetNative(this: View, value: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  const newValue = AccessibilityHelper.updateContentDescription(this, view);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityValue = "${value}" - contentDesc = "${newValue}"`);
  }
};

View.prototype[common.accessibilityHintProperty.setNative] = function accessibilityLabelSetNative(this: View, hint: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  const newValue = AccessibilityHelper.updateContentDescription(this, view);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.android>.accessibilityHint = "${hint}" - contentDesc = "${newValue}"`);
  }
};

setViewFunction(View, common.commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: View) {
  this.sendAccessibilityEvent('window_state_changed');
});

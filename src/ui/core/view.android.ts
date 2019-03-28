import { View } from 'tns-core-modules/ui/core/view';
import { AccessibilityHelper } from '../../utils/AccessibilityHelper';
import { setViewFunction, writeTrace } from '../../utils/helpers';
import * as common from './view-common';

function getNativeView(view: View): android.view.View {
  return view.nativeView || view.nativeViewProtected;
}

View.prototype[common.importantForAccessibilityProperty.getDefault] = function importantForAccessibilityGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    writeTrace(`View<${this}.android>.importantForAccessibility - default = nativeView is missing`);
    return 'auto';
  }

  const value = view.getImportantForAccessibility();
  if (!value) {
    return 'auto';
  }

  if (android.os.Build.VERSION.SDK_INT >= 19 && value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS) {
    writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS`);
    return 'no-hide-descendants';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES) {
    writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES`);
    return 'yes';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO) {
    writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO`);
    return 'no';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO) {
    writeTrace(`View<${this}.android>.importantForAccessibility - default = android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
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
    writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value} is falsy setting to 'auto'`);
    return;
  }

  switch (value.toLowerCase()) {
    case 'no-hide-descendants': {
      if (android.os.Build.VERSION.SDK_INT >= 19) {
        view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        writeTrace(
          `View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS`,
        );
      } else {
        writeTrace(
          `View<${this}.android>.importantForAccessibility - value: ${value}, but sdk is ${
            android.os.Build.VERSION.SDK_INT
          } < 19. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`,
        );
        view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      }
      break;
    }
    case 'yes': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);
      writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES`);
      break;
    }
    case 'no': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);
      writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO`);
      break;
    }
    default: {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
      writeTrace(`View<${this}.android>.importantForAccessibility - value: ${value}. Sets to android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO`);
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
  writeTrace(`View<${this}.android>.accessibilityComponentType - value: ${value}.`);
};

View.prototype[common.accessibilityLiveRegionProperty.getDefault] = function accessibilityLiveRegionGetDefault(this: View) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = getNativeView(this);
    if (!view) {
      return null;
    }

    const value = view.getAccessibilityLiveRegion();
    if (!value) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'none'`);
      return 'none';
    }

    if (value === android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'assertive'`);
      return 'assertive';
    }

    if (value === android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE) {
      writeTrace(`View<${this}.android>.accessibilityLiveRegion - default - 'polite'`);
      return 'polite';
    }
  } else {
    writeTrace(`View<${this}.android>.accessibilityLiveRegion - not supported`);
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
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE`);
        break;
      }
      case 'polite': {
        view.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE);
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE`);
        break;
      }
      default: {
        view.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_NONE);
        writeTrace(`View<${this}.android>.accessibilityLiveRegion - value: ${value}. Sets to android.view.View.ACCESSIBILITY_LIVE_REGION_NONE`);
        break;
      }
    }
  } else {
    writeTrace(`View<${this}.android>.accessibilityLiveRegion - not support on SDK < 19`);
  }
};

View.prototype[common.accessibleProperty.getDefault] = function accessibleGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    writeTrace(`View<${this}.android>.accessible - default = nativeView is missing`);
    return false;
  }

  const isAccessible = !!view.isFocusable();

  writeTrace(`View<${this}.android>.accessible - default = ${isAccessible}`);
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
  writeTrace(`View<${this}.android>.accessible = ${isAccessible}`);

  if (isAccessible) {
    const accessibilityComponentType = this.accessibilityComponentType || AccessibilityHelper.ACCESSIBLE;
    writeTrace(`View<${this}.android>.accessible = ${isAccessible} -> accessibilityComponentType=${accessibilityComponentType}`);

    AccessibilityHelper.updateAccessibilityComponentType(this, view, accessibilityComponentType);
    return;
  }

  AccessibilityHelper.removeAccessibilityComponentType(view);
};

setViewFunction(View, common.androidFunctions.sendAccessibilityEvent, function sendAccessibilityEvent(this: View, eventName: string, msg?: string) {
  const cls = `View<${this}.android>.sendAccessibilityEvent(${eventName} -> ${msg})`;

  const view = getNativeView(this);
  if (view) {
    writeTrace(`${cls}`);
    AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
    return;
  }

  writeTrace(`${cls} -> waiting for view to be loaded`);

  this.once(View.loadedEvent, () => {
    const view = getNativeView(this);
    if (!view) {
      writeTrace(`${cls} -> view not loaded -> ${eventName} -> ${msg}`);
      return;
    }

    writeTrace(`${cls} -> view loaded -> ${eventName} -> ${msg}`);
    AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
  });
});

setViewFunction(View, common.commonFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  writeTrace(`View<${this}.android>.accessibilityAnnouncement(..) -> ${msg}`);
  if (!msg) {
    msg = this.accessibilityLabel;
    writeTrace(`View<${this}.android>.accessibilityAnnouncement(..) - no msg, sending view.accessibilityLabel = '${msg}' instead`);
  }

  this.sendAccessibilityEvent('announcement', msg);
});

View.prototype[common.accessibilityLabelProperty.getDefault] = function accessibilityLabelGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    writeTrace(`View<${this}.android>.accessibilityLabel - default = nativeView is missing`);
    return null;
  }
  writeTrace(`View<${this}.android>.accessibilityLabel - default`);

  const label = view.getContentDescription();
  writeTrace(`View<${this}.android>.accessibilityLabel - default = ${label}`);
  return label;
};

View.prototype[common.accessibilityLabelProperty.setNative] = function accessibilityLabelSetNative(this: View, label: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (label) {
    writeTrace(`View<${this}.android>.accessibilityLabel - ${label}`);
    view.setContentDescription(`${label}`);
  } else {
    writeTrace(`View<${this}.android>.accessibilityLabel - empty string`);
    view.setContentDescription('');
  }
};

setViewFunction(View, common.commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: View) {
  this.sendAccessibilityEvent('window_state_changed');
});

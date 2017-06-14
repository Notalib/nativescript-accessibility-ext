import { View } from 'tns-core-modules/ui/core/view';

import * as common from './view-common';
import { setViewFunction } from '../../utils/helpers';
import { AccessibilityHelper } from '../../utils/AccessibilityHelper';

for (const fnName of Object.keys(common.iosFunctions)) {
  setViewFunction(View, fnName);
}

View.prototype[common.importantForAccessibilityProperty.getDefault] = function(this: View) {
  const view = <android.view.View>this.nativeView;

  const value = view.getImportantForAccessibility();
  if (!value) {
    return 'auto';
  }

  if (android.os.Build.VERSION.SDK_INT >= 19 && value === (<any>android.view.View).IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS) {
    return 'no-hide-descendants';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES) {
    return 'yes';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO) {
    return 'no';
  }

  if (value === android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO) {
    return 'auto';
  }

  return 'auto';
};

View.prototype[common.importantForAccessibilityProperty.setNative] = function(this: View, value: string) {
  const view = <android.view.View>this.nativeView;

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
};

View.prototype[common.accessibilityComponentTypeProperty.getDefault] = function(this: View) {
  return null;
};

View.prototype[common.accessibilityComponentTypeProperty.setNative] = function(this: View, value: string) {
  const view = <android.view.View>this.nativeView;

  AccessibilityHelper.updateAccessibilityComponentType(view, value);
}

View.prototype[common.accessibilityLiveRegionProperty.getDefault] = function(this: View) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = <any>this.nativeView;

    const value = view.getAccessibilityLiveRegion();
    if (!value) {
      return 'none';
    }

    if (value === (<any>android.view.View).ACCESSIBILITY_LIVE_REGION_ASSERTIVE) {
      return 'assertive';
    }

    if (value === (<any>android.view.View).ACCESSIBILITY_LIVE_REGION_POLITE) {
      return 'polite';
    }
  }

  return null;
};

View.prototype[common.accessibilityComponentTypeProperty.setNative] = function(this: View, value: string) {
  if (android.os.Build.VERSION.SDK_INT >= 19) {
    const view = <any>this.nativeView;

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
};

View.prototype[common.accessibleProperty.getDefault] = function(this: View) {
  const view = <android.view.View>this.nativeView;
  return !!view.isFocusable();
}

View.prototype[common.accessibleProperty.setNative] = function(this: View, value: boolean) {
  const view = <android.view.View>this.nativeView;

  view.setFocusable(!!value);
};

setViewFunction(View, common.androidFunctions.sendAccessibilityEvent, function sendAccessibilityEvent(this: View, eventName: string, msg?: string) {
  const view = this.nativeView;
  if (view) {
    AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
  } else {
    const loadedFn = () => {
      const view = this.nativeView;

      if (view) {
        AccessibilityHelper.sendAccessibilityEvent(view, eventName, msg);
      }

      this.off(View.loadedEvent, loadedFn);
    };

    this.on(View.loadedEvent, loadedFn);
  }
});

setViewFunction(View, common.commenFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  (<any>this).sendAccessibilityEvent('announcement', msg);
});

View.prototype[common.accessibilityLabelProperty.getDefault] = function getDefaultAccessibilityLabel(this: View) {
  return this.nativeView.getContentDescription();
};

View.prototype[common.accessibilityLabelProperty.setNative] = function setNativeAccessibilityLabel(this: View, label: string) {
  this.nativeView.setContentDescription(`${label || ''}`);
};

/// <reference path="./view.d.ts" />

import { profile } from '@nativescript/core/profiling';
import { PostAccessibilityNotificationType, View } from '@nativescript/core/ui/core/view';
import { isTraceEnabled, writeTrace } from '../../trace';
import { AccessibilityHelper, getUIView } from '../../utils/AccessibilityHelper';
import { setViewFunction } from '../../utils/helpers';
import {
  accessibilityHiddenCssProperty,
  accessibilityHintProperty,
  accessibilityIdProperty,
  accessibilityLabelProperty,
  accessibilityLanguageProperty,
  accessibilityLiveRegionCssProperty,
  accessibilityMediaSessionCssProperty,
  accessibilityRoleCssProperty,
  accessibilityStateCssProperty,
  accessibilityTraitsProperty,
  accessibilityValueProperty,
  accessibleCssProperty,
  commonFunctions,
  iosFunctions,
} from './view-common';

const updateA11YProperty = profile('updateA11YProperty', function updateA11YPropertyImpl(tnsView: View, propName: string, value: string | null) {
  const cls = `View<${tnsView}.ios>.${propName} = ${value}`;
  const uiView = getUIView(tnsView);
  if (!uiView) {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - no nativeView`);
    }

    return;
  }

  value = value != null ? `${value}` : null;
  if (isTraceEnabled()) {
    writeTrace(`${cls}`);
  }

  uiView[propName] = value;
});

View.prototype[accessibleCssProperty.setNative] = profile('View<A11Y>.accessibleSetNative', function accessibleSetNative(this: View, isAccessible: boolean) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  uiView.isAccessibilityElement = !!isAccessible;

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessible = ${uiView.isAccessibilityElement}`);
  }

  AccessibilityHelper.updateAccessibilityProperties(this);
});

View.prototype[accessibilityRoleCssProperty.setNative] = profile('View<A11Y>.accessibilityComponentTypeSetNative', function accessibilityComponentTypeSetNative(
  this: View,
) {
  AccessibilityHelper.updateAccessibilityProperties(this);
});

View.prototype[accessibilityTraitsProperty.setNative] = profile('View<A11Y>.accessibilityTraitsSetNative', function accessibilityTraitsSetNative(this: View) {
  AccessibilityHelper.updateAccessibilityProperties(this);
});

View.prototype[accessibilityValueProperty.setNative] = profile('View<A11Y>.accessibilityValueSetNative', function accessibilityValueSetNative(
  this: View,
  value: string,
) {
  updateA11YProperty(this, 'accessibilityValue', value);
});

View.prototype[accessibilityHiddenCssProperty.setNative] = profile(
  'View<A11Y>.accessibilityElementsHiddenSetNative',
  function accessibilityElementsHiddenSetNative(this: View, isHidden: boolean) {
    const uiView = getUIView(this);
    if (!uiView) {
      return;
    }

    uiView.accessibilityElementsHidden = !!isHidden;
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.ios>.accessibilityElementsHidden - ${!!isHidden}`);
    }

    AccessibilityHelper.updateAccessibilityProperties(this);
  },
);

View.prototype[accessibilityLiveRegionCssProperty.setNative] = profile('View<A11Y>.accessibilityLiveRegionSetNative', function accessibilityLiveRegionSetNative(
  this: View,
) {
  AccessibilityHelper.updateAccessibilityProperties(this);
});

View.prototype[accessibilityStateCssProperty.setNative] = profile('View<A11Y>.accessibilityStateSetNative', function accessibilityStateSetNative(this: View) {
  AccessibilityHelper.updateAccessibilityProperties(this);
});

setViewFunction(
  View,
  iosFunctions.iosPostAccessibilityNotification,
  profile('View<A11Y>.iosPostAccessibilityNotification', function postAccessibilityNotification(
    this: View,
    notificationType: PostAccessibilityNotificationType,
    msg?: string,
  ) {
    const cls = `View<${this}.ios>.postAccessibilityNotification("${notificationType}", "${msg}")`;
    if (!notificationType) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - falsy notificationType`);
      }

      return;
    }

    let notification: number;
    let args: string | UIView | null = getUIView(this);
    if (typeof msg === 'string' && msg) {
      args = msg;
    }

    switch (notificationType.toLowerCase()) {
      case 'announcement': {
        notification = UIAccessibilityAnnouncementNotification;
        break;
      }
      case 'layout': {
        notification = UIAccessibilityLayoutChangedNotification;
        break;
      }
      case 'screen': {
        notification = UIAccessibilityScreenChangedNotification;
        break;
      }
      default: {
        if (isTraceEnabled()) {
          writeTrace(`${cls} - unknown notificationType`);
        }

        return;
      }
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls} - send ${notification} with ${args || null}`);
    }

    UIAccessibilityPostNotification(notification, args || null);
  }),
);

setViewFunction(
  View,
  commonFunctions.accessibilityAnnouncement,
  profile('View<A11Y>.accessibilityAnnouncement', function accessibilityAnnouncement(this: View, msg?: string) {
    const cls = `View<${this}.ios>.accessibilityAnnouncement("${msg}")`;
    if (!msg) {
      if (isTraceEnabled()) {
        writeTrace(`${cls} - no msg, sending view.accessibilityLabel = ${this.accessibilityLabel} instead`);
      }

      msg = this.accessibilityLabel;
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls} - sending ${msg}`);
    }

    this.iosPostAccessibilityNotification('announcement', msg);
  }),
);

View.prototype[accessibilityLabelProperty.setNative] = profile('View<A11Y>.accessibilityLabelSetNative', function accessibilityLabelSetNative(
  this: View,
  label: string,
) {
  updateA11YProperty(this, 'accessibilityLabel', label);
});

View.prototype[accessibilityIdProperty.setNative] = profile('View<A11Y>.accessibilityIdentifierSetNative', function accessibilityIdentifierSetNative(
  this: View,
  identifier: string,
) {
  updateA11YProperty(this, 'accessibilityIdentifier', identifier);
});

View.prototype[accessibilityLanguageProperty.setNative] = profile('View<A11Y>.accessibilityLanguageSetNative', function accessibilityLanguageSetNative(
  this: View,
  lang: string,
) {
  updateA11YProperty(this, 'accessibilityLanguage', lang);
});

View.prototype[accessibilityHintProperty.setNative] = profile('View<A11Y>.accessibilityHintSetNative', function accessibilityHintSetNative(
  this: View,
  hint: string,
) {
  updateA11YProperty(this, 'accessibilityHint', hint);
});

View.prototype[accessibilityMediaSessionCssProperty.setNative] = profile(
  'View<A11Y>.accessibilityMediaSessionSetNative',
  function accessibilityMediaSessionSetNative(this: View) {
    AccessibilityHelper.updateAccessibilityProperties(this);
  },
);

setViewFunction(
  View,
  commonFunctions.accessibilityScreenChanged,
  profile('View<A11Y>..accessibilityScreenChanged', function accessibilityScreenChanged(this: View) {
    this.iosPostAccessibilityNotification('screen');
  }),
);

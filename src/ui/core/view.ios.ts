/// <reference path="./view.d.ts" />

import { PostAccessibilityNotificationType, View } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeTrace } from '../../trace';
import { AccessibilityHelper, getUIView } from '../../utils/AccessibilityHelper';
import { addCssPropertyToView, addPropertyToView, setViewFunction } from '../../utils/helpers';
import {
  accessibilityHiddenCssProperty,
  accessibilityHintProperty,
  accessibilityIdProperty,
  accessibilityLabelProperty,
  accessibilityLiveRegionCssProperty,
  accessibilityRoleCssProperty,
  accessibilityValueProperty,
  accessibleCssProperty,
  commonFunctions,
  iosFunctions,
  ViewCommon,
} from './view-common';

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<View, string | string[] | null>(ViewCommon, 'accessibilityTraits');
export const accessibilityLanguageProperty = addCssPropertyToView<View, string>(ViewCommon, 'accessibilityLanguage', 'a11y-lang', false);

View.prototype[accessibleCssProperty.setNative] = function accessibleSetNative(this: View, isAccessible: boolean) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  uiView.isAccessibilityElement = !!isAccessible;

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessible = ${uiView.isAccessibilityElement}`);
  }

  AccessibilityHelper.updateAccessibilityProperties(this);
};

View.prototype[accessibilityRoleCssProperty.setNative] = function accessibilityComponentTypeSetNative(this: View) {
  AccessibilityHelper.updateAccessibilityProperties(this);
};

View.prototype[accessibilityTraitsProperty.setNative] = function accessibilityTraitsSetNative(this: View) {
  AccessibilityHelper.updateAccessibilityProperties(this);
};

View.prototype[accessibilityValueProperty.getDefault] = function accessibilityValueGetDefault(this: View) {
  const uiView = getUIView(this);
  if (!uiView) {
    return null;
  }

  const value = uiView.accessibilityValue;
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityValue - default - ${value}`);
  }
  return value;
};

View.prototype[accessibilityValueProperty.setNative] = function accessibilityValueSetNative(this: View, value: string) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  if (value) {
    if (isTraceEnabled()) {
      writeTrace(`View<${this}.ios>.accessibilityValue - ${value}`);
    }
    uiView.accessibilityValue = `${value}`;
    return;
  }

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityValue - ${JSON.stringify(value)} is falsy, set to null to remove value`);
  }

  uiView.accessibilityValue = null;
};

View.prototype[accessibilityHiddenCssProperty.getDefault] = function accessibilityElementsHiddenGetDefault(this: View) {
  const uiView = getUIView(this);
  if (!uiView) {
    return false;
  }

  const isHidden = !!uiView.accessibilityElementsHidden;
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityElementsHidden - default - ${isHidden}`);
  }

  return isHidden;
};

View.prototype[accessibilityHiddenCssProperty.setNative] = function accessibilityElementsHiddenSetNative(this: View, isHidden: boolean) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  uiView.accessibilityElementsHidden = !!isHidden;
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityElementsHidden - ${!!isHidden}`);
  }
};

View.prototype[accessibilityLiveRegionCssProperty.setNative] = function accessibilityLiveRegionSetNative(this: View) {
  AccessibilityHelper.updateAccessibilityProperties(this);
};

setViewFunction(View, iosFunctions.postAccessibilityNotification, function postAccessibilityNotification(
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
});

setViewFunction(View, commonFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
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
  this.postAccessibilityNotification('announcement', msg);
});

View.prototype[accessibilityLabelProperty.getDefault] = function accessibilityLabelGetDefault(this: View) {
  const uiView = getUIView(this);
  if (!uiView) {
    return null;
  }

  const label = uiView.accessibilityLabel;
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityLabel - default = ${label}`);
  }
  return label;
};

View.prototype[accessibilityLabelProperty.setNative] = function accessibilityLabelSetNative(this: View, label: string) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  const cls = `View<${this}.ios>.accessibilityLabel = ${label}`;
  if (label) {
    if (isTraceEnabled()) {
      writeTrace(`${cls}`);
    }
    uiView.accessibilityLabel = `${label}`;
  } else {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - falsy value setting null`);
    }
    uiView.accessibilityLabel = null;
  }
};

View.prototype[accessibilityIdProperty.getDefault] = function accessibilityIdentifierGetDefault(this: View) {
  const uiView = getUIView(this);
  if (!uiView) {
    return null;
  }

  const identifier = uiView.accessibilityIdentifier;
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityIdentifier - default = ${identifier}`);
  }
  return identifier;
};

View.prototype[accessibilityIdProperty.setNative] = function accessibilityIdentifierSetNative(this: View, identifier: string) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }
  const cls = `View<${this}.ios>.accessibilityIdentifier = ${identifier}`;

  if (identifier) {
    if (isTraceEnabled()) {
      writeTrace(`${cls}`);
    }
    uiView.accessibilityIdentifier = `${identifier}`;
  } else {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - falsy value setting null`);
    }
    uiView.accessibilityIdentifier = null;
  }
};

View.prototype[accessibilityLanguageProperty.getDefault] = function accessibilityLanguageGetDefault(this: View) {
  const uiView = getUIView(this);
  if (!uiView) {
    return null;
  }

  const lang = uiView.accessibilityLanguage;
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityLanguage - default - ${lang}`);
  }
  return lang;
};

View.prototype[accessibilityLanguageProperty.setNative] = function accessibilityLanguageSetNative(this: View, lang: string) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  const cls = `View<${this}.ios>.accessibilityIdentifier = ${lang}`;
  if (lang) {
    writeTrace(`${cls}`);
    uiView.accessibilityLanguage = lang;
  } else {
    writeTrace(`${cls} - falsy value setting null`);
    uiView.accessibilityLanguage = null;
  }
};

View.prototype[accessibilityHintProperty.getDefault] = function accessibilityHintGetDefault() {
  const uiView = getUIView(this);
  if (!uiView) {
    return null;
  }

  return uiView.accessibilityHint;
};

View.prototype[accessibilityHintProperty.setNative] = function accessibilityHintSetNative(value: string) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  uiView.accessibilityHint = value;
};

setViewFunction(View, commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: View) {
  this.postAccessibilityNotification('screen');
});

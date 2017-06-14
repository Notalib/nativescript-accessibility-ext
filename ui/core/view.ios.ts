import { View } from 'tns-core-modules/ui/core/view';

import * as common from './view-common';
import { setViewFunction, inputArrayToBitMask } from '../../utils/helpers';

for (const fnName of Object.keys(common.androidFunctions)) {
  setViewFunction(View, fnName);
}

View.prototype[common.accessibleProperty.getDefault] = function getDefaultAccessible(this: View) {
  return !!this.nativeView.isAccessibilityElement;
};

View.prototype[common.accessibleProperty.setNative] = function setNativeAccessible(this: View, value: boolean) {
  this.nativeView.isAccessibilityElement = !!value;
};

let traits: Map<string, number>;
function ensureTraits() {
  if (traits) {
    return;
  }

  traits = new Map<string, number>([
    ['none', UIAccessibilityTraitNone],
    ['button', UIAccessibilityTraitButton],
    ['link', UIAccessibilityTraitLink],
    ['header', UIAccessibilityTraitHeader],
    ['search', UIAccessibilityTraitSearchField],
    ['image', UIAccessibilityTraitImage],
    ['selected', UIAccessibilityTraitSelected],
    ['plays', UIAccessibilityTraitPlaysSound],
    ['key', UIAccessibilityTraitKeyboardKey],
    ['text', UIAccessibilityTraitStaticText],
    ['summary', UIAccessibilityTraitSummaryElement],
    ['disabled', UIAccessibilityTraitNotEnabled],
    ['frequentUpdates', UIAccessibilityTraitUpdatesFrequently],
    ['startsMedia', UIAccessibilityTraitStartsMediaSession],
    ['adjustable', UIAccessibilityTraitAdjustable],
    ['allowsDirectInteraction', UIAccessibilityTraitAllowsDirectInteraction],
    ['pageTurn', UIAccessibilityTraitCausesPageTurn],
  ]);
}

View.prototype[common.accessibilityTraitsProperty.getDefault] = function getDefaultAccessibilityTraits(this: View) {
  const res: string[] = [];

  if (!this.nativeView.accessibilityTraits) {
    return res;
  }

  ensureTraits();
  for (const [name, trait] of traits) {
    if (this.nativeView.accessibilityTraits & trait) {
      res.push(name);
    }
  }

  return res;
}

View.prototype[common.accessibilityTraitsProperty.setNative] = function setNativeAccessibilityTraits(this: View, value: string | string[]) {
  ensureTraits();

  this.nativeView.accessibilityTraits = inputArrayToBitMask(value, traits);
}

View.prototype[common.accessibilityValueProperty.getDefault] = function getDefaultAccessibilityValue(this: View) {
  return this.nativeView.accessibilityValue;
}

View.prototype[common.accessibilityValueProperty.setNative] = function setNativeAccessibilityValue(this: View, value: string) {
  if (value) {
    this.nativeView.accessibilityValue = `${value}`;
  } else {
    this.nativeView.accessibilityValue = null;
  }
}

View.prototype[common.accessibilityElementsHidden.getDefault] = function getDefaultAccessibilityElementHidden(this: View) {
  return !!this.nativeView.accessibilityElementsHidden;
}

View.prototype[common.accessibilityElementsHidden.setNative] = function setNativeAccessibilityElementHidden(this: View, value: boolean) {
  this.nativeView.accessibilityElementsHidden = !!value;
}

let postNotificationMap: Map<string, number>;
function ensurePostNotificationMap() {
  if (postNotificationMap) {
    return;
  }

  postNotificationMap = new Map<string, number>([
    ['announcement', UIAccessibilityAnnouncementNotification],
    ['layout', UIAccessibilityLayoutChangedNotification],
    ['screen', UIAccessibilityScreenChangedNotification],
  ]);
}

setViewFunction(View, common.iosFunctions.postAccessibilityNotification, function postAccessibilityNotification(this: View, notificationType: string, msg?: string) {
  if (!notificationType) {
    return;
  }

  ensurePostNotificationMap();

  const notificationInt = postNotificationMap.get(notificationType.toLocaleLowerCase());
  if (notificationInt !== undefined) {
    let args: any;
    if (typeof msg === 'string') {
      args = msg;
    } else {
      args = this.nativeView;
    }

    UIAccessibilityPostNotification(notificationInt, args || null);
  }
});

setViewFunction(View, common.commenFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  if (!msg) {
    const view = this.nativeView;

    msg = view.accessibilityLabel;
  }

  (<any>this).postAccessibilityNotification('announcement', msg);
});

View.prototype[common.accessibilityLabelProperty.getDefault] = function getDefaultAccessibilityLabel(this: View) {
  return this.nativeView.accessibilityLabel;
};

View.prototype[common.accessibilityLabelProperty.setNative] = function setNativeAccessibilityLabel(this: View, label: string) {
  if (label) {
    this.nativeView.accessibilityLabel = `${label}`;
  } else {
    this.nativeView.accessibilityLabel = null;
  }
};

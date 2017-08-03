import { View } from './view-common';
import * as nsApp from 'tns-core-modules/application';

import * as common from './view-common';
import { setViewFunction, inputArrayToBitMask, writeTrace, notityAccessibilityFocusState } from '../../utils/helpers';

for (const fnName of Object.keys(common.androidFunctions)) {
  setViewFunction(View, fnName);
}

View.prototype[common.accessibleProperty.getDefault] = function getDefaultAccessible(this: View) {
  const view = <UIView>this.nativeView;
  const isAccessble = !!view.isAccessibilityElement;
  writeTrace(`View<${this}.android>.accessible - default = ${isAccessble}`);
  return isAccessble;
};

const accessibilityFocusObserverSymbol = Symbol('ios:accessibilityFocusObserver');
const accessibilityHadFocusSymbol = Symbol('ios:accessibilityHadFocusSymbol');
View.prototype[common.accessibleProperty.setNative] = function setNativeAccessible(this: View, value: boolean) {
  const view = <UIView>this.nativeView;
  const tnsView = this;

  view.isAccessibilityElement = !!value;
  writeTrace(`View<${this}.ios>.accessible = ${value}`);

  if (tnsView[accessibilityFocusObserverSymbol]) {
    if (value) {
      return;
    }

    nsApp.ios.removeNotificationObserver(tnsView[accessibilityFocusObserverSymbol], UIAccessibilityElementFocusedNotification);

    delete tnsView[accessibilityFocusObserverSymbol];
    return;
  }

  const selfView = new WeakRef<UIView>(view);
  const selfTnsView = new WeakRef<View>(tnsView);

  const observer = nsApp.ios.addNotificationObserver(UIAccessibilityElementFocusedNotification, (args) => {
    const localTnsView = selfTnsView.get();
    const localView = selfView.get();
    if (!localTnsView || !localView) {
      nsApp.ios.removeNotificationObserver(observer, UIAccessibilityElementFocusedNotification);
      if (localTnsView) {
        delete localTnsView[accessibilityFocusObserverSymbol];
      }
      return;
    }

    const object = args.userInfo.objectForKey(UIAccessibilityFocusedElementKey);

    const receivedFocus = object === localView;
    const lostFocus = localView[accessibilityHadFocusSymbol] && !receivedFocus;

    writeTrace(`View<${this}.ios>.accessible: observer<${UIAccessibilityElementFocusedNotification}>, view: ${localTnsView}, receivedFocus: ${receivedFocus}, lostFocus: ${lostFocus}`);

    if (receivedFocus || lostFocus) {
      notityAccessibilityFocusState(localTnsView, receivedFocus, lostFocus);

      if (receivedFocus) {
        localView[accessibilityHadFocusSymbol] = true;
      } else if (lostFocus) {
        localView[accessibilityHadFocusSymbol] = false;
      }
    }
  });

  tnsView[accessibilityFocusObserverSymbol] = observer;
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

  const view = <UIView>this.nativeView;
  if (!view.accessibilityTraits) {
    return res;
  }

  ensureTraits();
  for (const [name, trait] of Array.from(traits)) {
    if (view.accessibilityTraits & trait) {
      res.push(name);
    }
  }

  writeTrace(`View<${this}.ios>.accessibilityTraits - default -> ${res.join(',')}`);
  return res;
};

View.prototype[common.accessibilityTraitsProperty.setNative] = function setNativeAccessibilityTraits(this: View, value: string | string[]) {
  ensureTraits();

  const view = <UIView>this.nativeView;
  view.accessibilityTraits = inputArrayToBitMask(value, traits);
  writeTrace(`View<${this}.ios>.accessibilityTraits -> got ${value} -> result: ${view.accessibilityTraits}`);
}

View.prototype[common.accessibilityValueProperty.getDefault] = function getDefaultAccessibilityValue(this: View) {
  const view = <UIView>this.nativeView;
  const value = view.accessibilityValue;
  writeTrace(`View<${this}.ios>.accessibilityValue - default - ${value}`);
  return value;
}

View.prototype[common.accessibilityValueProperty.setNative] = function setNativeAccessibilityValue(this: View, value: string) {
  const view = <UIView>this.nativeView;
  if (value) {
    writeTrace(`View<${this}.ios>.accessibilityValue - ${value}`);
    view.accessibilityValue = `${value}`;
  } else {
    writeTrace(`View<${this}.ios>.accessibilityValue - ${value} is falsy, set to null to remove value`);
    view.accessibilityValue = null;
  }
}

View.prototype[common.accessibilityElementsHidden.getDefault] = function getDefaultAccessibilityElementHidden(this: View) {
  const view = <UIView>this.nativeView;
  const isHidden = !!view.accessibilityElementsHidden;
  writeTrace(`View<${this}.ios>.accessibilityElementsHidden - default - ${isHidden}`);
  return isHidden;
}

View.prototype[common.accessibilityElementsHidden.setNative] = function setNativeAccessibilityElementHidden(this: View, isHidden: boolean) {
  const view = <UIView>this.nativeView;
  view.accessibilityElementsHidden = !!isHidden;
  writeTrace(`View<${this}.ios>.accessibilityElementsHidden - ${!!isHidden}`);
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
    writeTrace(`View<${this}.ios>.postAccessibilityNotification(..) - falsy notificationType`);
    return;
  }

  ensurePostNotificationMap();

  const notificationInt = postNotificationMap.get(notificationType.toLocaleLowerCase());
  if (notificationInt !== undefined) {
    let args: string | UIView;
    if (typeof msg === 'string' && msg) {
      args = msg;
    } else {
      args = <UIView>this.nativeView;
    }

    UIAccessibilityPostNotification(notificationInt, args || null);
    writeTrace(`View<${this}.ios>.postAccessibilityNotification(..) - send ${notificationType} with ${args || null}`);
  } else {
    writeTrace(`View<${this}.ios>.postAccessibilityNotification(..) - ${notificationType} is known notificationType`);
  }
});

setViewFunction(View, common.commenFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  if (!msg) {
    msg = (<any>this).accessibilityLabel;
    writeTrace(`View<${this}.ios>.accessibilityAnnouncement(..) - no msg, sending view.accessibilityLabel = ${msg} instead`);
  }

  (<any>this).postAccessibilityNotification('announcement', msg);
  writeTrace(`View<${this}.ios>.accessibilityAnnouncement(..) - sending ${msg}`);
});

View.prototype[common.accessibilityLabelProperty.getDefault] = function getDefaultAccessibilityLabel(this: View) {
  const view = <UIView>this.nativeView;
  const label = view.accessibilityLabel;
  writeTrace(`View<${this}.ios>.accessibilityLabel - default = ${label}`);
  return label;
};

View.prototype[common.accessibilityLabelProperty.setNative] = function setNativeAccessibilityLabel(this: View, label: string) {
  const view = <UIView>this.nativeView;
  if (label) {
    writeTrace(`View<${this}.ios>.accessibilityLabel - ${label}`);
    view.accessibilityLabel = `${label}`;
  } else {
    writeTrace(`View<${this}.ios>.accessibilityLabel - null`);
    view.accessibilityLabel = null;
  }
};

View.prototype[common.accessibilityIdentidierProperty.getDefault] = function getDefaultAccessibilityIdentifier(this: View) {
  const view = <UIView>this.nativeView;
  const identifier = view.accessibilityIdentifier;
  writeTrace(`View<${this}.ios>.accessibilityIdentifier - default = ${identifier}`);
  return identifier;
};

View.prototype[common.accessibilityIdentidierProperty.setNative] = function setNativeAccessibilityIdentifier(this: View, identifier: string) {
  const view = <UIView>this.nativeView;
  if (identifier) {
    writeTrace(`View<${this}.ios>.accessibilityIdentifier - ${identifier}`);
    view.accessibilityIdentifier = `${identifier}`;
  } else {
    writeTrace(`View<${this}.ios>.accessibilityIdentifier - null`);
    view.accessibilityIdentifier = null;
  }
};

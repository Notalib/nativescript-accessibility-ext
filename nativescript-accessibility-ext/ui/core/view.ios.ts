import { View } from './view-common';
import * as nsApp from 'tns-core-modules/application';

import * as common from './view-common';
import { setViewFunction, inputArrayToBitMask, writeTrace, notityAccessibilityFocusState } from '../../utils/helpers';

for (const fnName of Object.keys(common.androidFunctions)) {
  setViewFunction(View, fnName);
}

View.prototype[common.accessibleProperty.getDefault] = function getDefaultAccessible(this: View) {
  return !!this.nativeView.isAccessibilityElement;
};

const accessibilityFocusObserverSymbol = Symbol('ios:accessibilityFocusObserver');
const accessibilityHadFocusSymbol = Symbol('ios:accessibilityHadFocusSymbol');
View.prototype[common.accessibleProperty.setNative] = function setNativeAccessible(this: View, value: boolean) {
  const view = this.nativeView;
  const tnsView = this;

  view.isAccessibilityElement = !!value;
  writeTrace(`View<ios>.accessible = ${value}`);

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

    writeTrace(`View<ios>.accessible: observer<${UIAccessibilityElementFocusedNotification}>, view: ${localTnsView}, receivedFocus: ${receivedFocus}, lostFocus: ${lostFocus}`);

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

  if (!this.nativeView.accessibilityTraits) {
    return res;
  }

  ensureTraits();
  for (const [name, trait] of Array.from(traits)) {
    if (this.nativeView.accessibilityTraits & trait) {
      res.push(name);
    }
  }

  writeTrace(`View<ios>.accessibilityTraits - default -> ${res.join(',')}`);
  return res;
};

View.prototype[common.accessibilityTraitsProperty.setNative] = function setNativeAccessibilityTraits(this: View, value: string | string[]) {
  ensureTraits();

  const view = this.nativeView;

  view.accessibilityTraits = inputArrayToBitMask(value, traits);
  writeTrace(`View<ios>.accessibilityTraits -> got ${value} -> result: ${view.accessibilityTraits}`);
}

View.prototype[common.accessibilityValueProperty.getDefault] = function getDefaultAccessibilityValue(this: View) {
  const view = this.nativeView;
  const value = view.accessibilityValue;
  writeTrace(`View<ios>.accessibilityValue - default - ${value}`);
  return value;
}

View.prototype[common.accessibilityValueProperty.setNative] = function setNativeAccessibilityValue(this: View, value: string) {
  const view = this.nativeView;
  if (value) {
    view.accessibilityValue = `${value}`;
    writeTrace(`View<ios>.accessibilityValue - ${value}`);
  } else {
    view.accessibilityValue = null;
    writeTrace(`View<ios>.accessibilityValue - ${value} is falsy, set to null to remove value`);
  }
}

View.prototype[common.accessibilityElementsHidden.getDefault] = function getDefaultAccessibilityElementHidden(this: View) {
  const view = this.nativeView;
  const value = !!view.accessibilityElementsHidden;
  writeTrace(`View<ios>.accessibilityElementsHidden - default - ${value}`);

  return value;
}

View.prototype[common.accessibilityElementsHidden.setNative] = function setNativeAccessibilityElementHidden(this: View, value: boolean) {
  const view = this.nativeView;
  view.accessibilityElementsHidden = !!value;
  writeTrace(`View<ios>.accessibilityElementsHidden - ${!!value}`);
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
    writeTrace(`View<ios>.postAccessibilityNotification(..) - falsy notificationType`);
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
    writeTrace(`View<ios>.postAccessibilityNotification(..) - send ${notificationType} with ${args || null}`);
  } else {
    writeTrace(`View<ios>.postAccessibilityNotification(..) - ${notificationType} is known notificationType`);
  }
});

setViewFunction(View, common.commenFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  if (!msg) {
    const view = this.nativeView;

    msg = view.accessibilityLabel;
    writeTrace(`View<ios>.accessibilityAnnouncement(..) - no msg, sending view.accessibilityLabel = ${view.accessibilityLabel} instead`);
  }

  (<any>this).postAccessibilityNotification('announcement', msg);
  writeTrace(`View<ios>.accessibilityAnnouncement(..) - sending ${msg}`);
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

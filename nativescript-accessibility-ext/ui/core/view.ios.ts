import { View } from './view-common';
import * as nsApp from 'tns-core-modules/application';

import * as common from './view-common';
import { setViewFunction, inputArrayToBitMask, writeTrace, notityAccessibilityFocusState } from '../../utils/helpers';

for (const fnName of Object.keys(common.androidFunctions)) {
  setViewFunction(View, fnName);
}

function getNativeView(view: View): UIView {
  if (view.nativeViewProtected) {
    return view.nativeViewProtected;
  }

  if (view.nativeView) {
    return view.nativeView;
  }

  return null;
}

View.prototype[common.accessibleProperty.getDefault] = function accessibleGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return false;
  }

  const isAccessible = !!view.isAccessibilityElement;
  writeTrace(`View<${this}.android>.accessible - default = ${isAccessible}`);
  return isAccessible;
};

const accessibilityFocusObserverSymbol = Symbol('ios:accessibilityFocusObserver');
const accessibilityHadFocusSymbol = Symbol('ios:accessibilityHadFocusSymbol');

/**
 * Wrapper for setting up accessibility focus events for iOS9+
 * NOTE: This isn't supported on iOS8
 *
 * If the UIView changes from accessible = true to accessible = true, event will be remove
 *
 * @param {UIView} view         Native iOS UIView
 * @param {View} tnsView        NativeScript View
 * @param {boolean} isAccessible  is element marked as accessible
 */
function handleUIAccessibilityElementFocusedNotification(view: UIView, tnsView: View, isAccessible: boolean) {
  if (typeof UIAccessibilityElementFocusedNotification === 'undefined') {
    writeTrace(`handleUIAccessibilityElementFocusedNotification(${view}, ${tnsView}, ${isAccessible}): UIAccessibilityElementFocusedNotification is not supported by this iOS version`);
    return;
  }

  if (tnsView[accessibilityFocusObserverSymbol]) {
    if (isAccessible) {
      writeTrace(`handleUIAccessibilityElementFocusedNotification(${view}, ${tnsView}, ${isAccessible}): Already configured no need to do so again`);
      return;
    }

    writeTrace(`handleUIAccessibilityElementFocusedNotification(${view}, ${tnsView}, ${isAccessible}) - view no longer accessible, don't configure this again`);
    nsApp.ios.removeNotificationObserver(tnsView[accessibilityFocusObserverSymbol], UIAccessibilityElementFocusedNotification);

    delete tnsView[accessibilityFocusObserverSymbol];
    return;
  }

  if (!isAccessible) {
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
}

View.prototype[common.accessibleProperty.setNative] = function accessibleSetNative(this: View, isAccessible: boolean) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (typeof isAccessible === 'string') {
    isAccessible = `${isAccessible}`.toLowerCase() === 'true';
  }

  view.isAccessibilityElement = !!isAccessible;
  writeTrace(`View<${this}.ios>.accessible = ${isAccessible}`);

  handleUIAccessibilityElementFocusedNotification(view, this, isAccessible);
};

let traits: Map<string, number>;
function ensureTraits() {
  if (traits) {
    return;
  }

  traits = new Map<string, number>([
    // The accessibility element has no traits.
    ['none', UIAccessibilityTraitNone],

    // The accessibility element should be treated as a button.
    ['button', UIAccessibilityTraitButton],

    // The accessibility element should be treated as a link.
    ['link', UIAccessibilityTraitLink],

    // The accessibility element should be treated as a search field.
    ['search', UIAccessibilityTraitSearchField],

    // The accessibility element should be treated as an image.
    ['image', UIAccessibilityTraitImage],

    // The accessibility element is currently selected.
    ['selected', UIAccessibilityTraitSelected],

    // The accessibility element plays its own sound when activated.
    ['plays', UIAccessibilityTraitPlaysSound],

    // The accessibility element behaves as a keyboard key.
    ['key', UIAccessibilityTraitKeyboardKey],

    // The accessibility element should be treated as static text that cannot change.
    ['text', UIAccessibilityTraitStaticText],

    // The accessibility element provides summary information when the application starts.
    ['summary', UIAccessibilityTraitSummaryElement],

    // The accessibility element is not enabled and does not respond to user interaction.
    ['disabled', UIAccessibilityTraitNotEnabled],

    // The accessibility element frequently updates its label or value.
    ['frequentUpdates', UIAccessibilityTraitUpdatesFrequently],

    // The accessibility element starts a media session when it is activated.
    ['startsMedia', UIAccessibilityTraitStartsMediaSession],

    // The accessibility element allows continuous adjustment through a range of values.
    ['adjustable', UIAccessibilityTraitAdjustable],

    // The accessibility element allows direct touch interaction for VoiceOver users.
    ['allowsDirectInteraction', UIAccessibilityTraitAllowsDirectInteraction],

    // The accessibility element should cause an automatic page turn when VoiceOver finishes reading the text within it.
    ['pageTurn', UIAccessibilityTraitCausesPageTurn],

    // The accessibility element is a header that divides content into sections, such as the title of a navigation bar.
    ['header', UIAccessibilityTraitHeader],
  ]);
}

function geAccessibilityTraitsFromBitmash(accessibilityTraits: number) {
  const res: string[] = [];
  if (!accessibilityTraits) {
    return res;
  }

  ensureTraits();
  for (const [name, trait] of Array.from(traits)) {
    if (accessibilityTraits & trait) {
      res.push(name);
    }
  }

  return res;
}

View.prototype[common.accessibilityTraitsProperty.getDefault] = function accessibilityTraitsGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return '';
  }

  const accessibilityTraits = geAccessibilityTraitsFromBitmash(view.accessibilityTraits);
  writeTrace(`View<${this}.ios>.accessibilityTraits - default -> '${view.accessibilityTraits}' = '${accessibilityTraits.join(',')}'`);
  return accessibilityTraits;
};

View.prototype[common.accessibilityTraitsProperty.setNative] = function accessibilityTraitsSetNative(this: View, value: string | string[]) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  ensureTraits();

  view.accessibilityTraits = inputArrayToBitMask(value, traits);

  const newAccessibilityTraits = geAccessibilityTraitsFromBitmash(view.accessibilityTraits);
  writeTrace(`View<${this}.ios>.accessibilityTraits -> got ${value} -> result: '${view.accessibilityTraits}' = '${newAccessibilityTraits}'`);
};

View.prototype[common.accessibilityValueProperty.getDefault] = function accessibilityValueGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return null;
  }

  const value = view.accessibilityValue;
  writeTrace(`View<${this}.ios>.accessibilityValue - default - ${value}`);
  return value;
};

View.prototype[common.accessibilityValueProperty.setNative] = function accessibilityValueSetNative(this: View, value: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (value) {
    writeTrace(`View<${this}.ios>.accessibilityValue - ${value}`);
    view.accessibilityValue = `${value}`;
  } else {
    writeTrace(`View<${this}.ios>.accessibilityValue - ${value} is falsy, set to null to remove value`);
    view.accessibilityValue = null;
  }
};

View.prototype[common.accessibilityElementsHidden.getDefault] = function accessibilityElementHiddenGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return false;
  }

  const isHidden = !!view.accessibilityElementsHidden;
  writeTrace(`View<${this}.ios>.accessibilityElementsHidden - default - ${isHidden}`);
  return isHidden;
};

View.prototype[common.accessibilityElementsHidden.setNative] = function accessibilityElementHiddenSetNative(this: View, isHidden: boolean) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (typeof isHidden === 'string') {
    isHidden = `${isHidden}`.toLowerCase() === 'true';
  }

  view.accessibilityElementsHidden = !!isHidden;
  writeTrace(`View<${this}.ios>.accessibilityElementsHidden - ${!!isHidden}`);
};

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
      args = <UIView>this.ios;
    }

    UIAccessibilityPostNotification(notificationInt, args || null);
    writeTrace(`View<${this}.ios>.postAccessibilityNotification(..) - send ${notificationType} with ${args || null}`);
  } else {
    writeTrace(`View<${this}.ios>.postAccessibilityNotification(..) - ${notificationType} is known notificationType`);
  }
});

setViewFunction(View, common.commonFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  if (!msg) {
    msg = this.accessibilityLabel;
    writeTrace(`View<${this}.ios>.accessibilityAnnouncement(..) - no msg, sending view.accessibilityLabel = ${msg} instead`);
  }

  this.postAccessibilityNotification('announcement', msg);
  writeTrace(`View<${this}.ios>.accessibilityAnnouncement(..) - sending ${msg}`);
});

View.prototype[common.accessibilityLabelProperty.getDefault] = function accessibilityLabelGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return null;
  }

  const label = view.accessibilityLabel;
  writeTrace(`View<${this}.ios>.accessibilityLabel - default = ${label}`);
  return label;
};

View.prototype[common.accessibilityLabelProperty.setNative] = function accessibilityLabelSetNative(this: View, label: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (label) {
    writeTrace(`View<${this}.ios>.accessibilityLabel - ${label}`);
    view.accessibilityLabel = `${label}`;
  } else {
    writeTrace(`View<${this}.ios>.accessibilityLabel - null`);
    view.accessibilityLabel = null;
  }
};

View.prototype[common.accessibilityIdentifierProperty.getDefault] = function accessibilityIdentifierGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return null;
  }

  const identifier = view.accessibilityIdentifier;
  writeTrace(`View<${this}.ios>.accessibilityIdentifier - default = ${identifier}`);
  return identifier;
};

View.prototype[common.accessibilityIdentifierProperty.setNative] = function accessibilityIdentifierSetNative(this: View, identifier: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (identifier) {
    writeTrace(`View<${this}.ios>.accessibilityIdentifier - ${identifier}`);
    view.accessibilityIdentifier = `${identifier}`;
  } else {
    writeTrace(`View<${this}.ios>.accessibilityIdentifier - null`);
    view.accessibilityIdentifier = null;
  }
};

View.prototype[common.accessibilityLanguageProperty.getDefault] = function accessibilityLanguageGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return null;
  }

  const lang = view.accessibilityLanguage;
  writeTrace(`View<${this}.ios>.accessibilityLanguage - default - ${lang}`);
  return lang;
};

View.prototype[common.accessibilityLanguageProperty.setNative] = function accessibilityLanguageSetNative(this: View, lang: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  if (lang) {
    writeTrace(`View<${this}.ios>.accessibilityLanguage - ${lang}`);
    view.accessibilityLanguage = lang;
  } else {
    writeTrace(`View<${this}.ios>.accessibilityLanguage - null`);
    view.accessibilityLanguage = null;
  }
};

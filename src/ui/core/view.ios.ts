import * as nsApp from 'tns-core-modules/application';
import { View } from 'tns-core-modules/ui/core/view';
import { inputArrayToBitMask, notifyAccessibilityFocusState, setViewFunction, writeTrace } from '../../utils/helpers';
import * as common from './view-common';

function getNativeView(view: View): UIView {
  return view.ios;
}

View.prototype[common.accessibleProperty.getDefault] = function accessibleGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return false;
  }

  const isAccessible = !!view.isAccessibilityElement;
  writeTrace(`View<${this}.ios>.accessible - default = ${isAccessible}`);
  return isAccessible;
};

const accessibilityFocusObserverSymbol = Symbol.for('ios:accessibilityFocusObserver');
const accessibilityHadFocusSymbol = Symbol.for('ios:accessibilityHadFocusSymbol');

/**
 * Wrapper for setting up accessibility focus events for iOS9+
 * NOTE: This isn't supported on iOS8
 *
 * If the UIView changes from accessible = true to accessible = false, event will be remove
 *
 * @param {View} tnsView        NativeScript View
 * @param {boolean} isAccessible  is element marked as accessible
 */
function handleUIAccessibilityElementFocusedNotification(tnsView: View, isAccessible: boolean) {
  const cls = `handleUIAccessibilityElementFocusedNotification(${tnsView}, ${isAccessible})`;
  if (typeof UIAccessibilityElementFocusedNotification === 'undefined') {
    writeTrace(`${cls}: not supported by this iOS version`);
    return;
  }

  if (tnsView[accessibilityFocusObserverSymbol]) {
    if (isAccessible) {
      writeTrace(`${cls}: Already configured no need to do so again`);
      return;
    }

    writeTrace(`${cls}: view no longer accessible, remove listener`);
    nsApp.ios.removeNotificationObserver(tnsView[accessibilityFocusObserverSymbol], UIAccessibilityElementFocusedNotification);

    delete tnsView[accessibilityFocusObserverSymbol];
    return;
  }

  if (!isAccessible) {
    return;
  }

  const selfTnsView = new WeakRef<View>(tnsView);

  let observer = nsApp.ios.addNotificationObserver(UIAccessibilityElementFocusedNotification, (args: NSNotification) => {
    const localTnsView = selfTnsView.get();
    if (!localTnsView || !localTnsView.ios) {
      nsApp.ios.removeNotificationObserver(observer, UIAccessibilityElementFocusedNotification);
      observer = null;
      if (localTnsView) {
        delete localTnsView[accessibilityFocusObserverSymbol];
      }
      return;
    }

    const localView = localTnsView.ios as UIView;

    const object = args.userInfo.objectForKey(UIAccessibilityFocusedElementKey) as UIView;

    const receivedFocus = object === localView;
    const lostFocus = localView[accessibilityHadFocusSymbol] && !receivedFocus;

    if (!receivedFocus && !lostFocus) {
      return;
    }

    writeTrace(`${cls}, view: ${localTnsView}, receivedFocus: ${receivedFocus}, lostFocus: ${lostFocus}`);

    notifyAccessibilityFocusState(localTnsView, receivedFocus, lostFocus);

    if (receivedFocus) {
      localView[accessibilityHadFocusSymbol] = true;
    } else if (lostFocus) {
      localView[accessibilityHadFocusSymbol] = false;
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
  writeTrace(`View<${this}.ios>.accessible = ${view.isAccessibilityElement}`);

  handleUIAccessibilityElementFocusedNotification(this, isAccessible);
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

function getAccessibilityTraitsFromBitmask(accessibilityTraits: number) {
  const res: string[] = [];
  if (!accessibilityTraits) {
    return res;
  }

  ensureTraits();

  for (const [name, trait] of traits) {
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

  const accessibilityTraits = getAccessibilityTraitsFromBitmask(view.accessibilityTraits);
  writeTrace(`View<${this}.ios>.accessibilityTraits - default -> '${view.accessibilityTraits}' = '${accessibilityTraits.join(',')}'`);
  return accessibilityTraits;
};

View.prototype[common.accessibilityTraitsProperty.setNative] = function accessibilityTraitsSetNative(
  this: View,
  value: View.AccessibilityTrait | View.AccessibilityTrait[],
) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  ensureTraits();

  view.accessibilityTraits = inputArrayToBitMask(value, traits);

  const newAccessibilityTraits = getAccessibilityTraitsFromBitmask(view.accessibilityTraits);
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
    writeTrace(`View<${this}.ios>.accessibilityValue - ${JSON.stringify(value)} is falsy, set to null to remove value`);
    view.accessibilityValue = null;
  }
};

View.prototype[common.accessibilityElementsHidden.getDefault] = function accessibilityElementsHiddenGetDefault(this: View) {
  const view = getNativeView(this);
  if (!view) {
    return false;
  }

  const isHidden = !!view.accessibilityElementsHidden;
  writeTrace(`View<${this}.ios>.accessibilityElementsHidden - default - ${isHidden}`);
  return isHidden;
};

View.prototype[common.accessibilityElementsHidden.setNative] = function accessibilityElementsHiddenSetNative(this: View, isHidden: boolean) {
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

setViewFunction(View, common.iosFunctions.postAccessibilityNotification, function postAccessibilityNotification(
  this: View,
  notificationType: string,
  msg?: string,
) {
  const cls = `View<${this}.ios>.postAccessibilityNotification("${notificationType}", "${msg}")`;
  if (!notificationType) {
    writeTrace(`${cls} - falsy notificationType`);
    return;
  }

  ensurePostNotificationMap();

  notificationType = notificationType.toLowerCase();
  if (!postNotificationMap.has(notificationType)) {
    writeTrace(`${cls} - unknown notificationType`);
    return;
  }

  const notificationInt = postNotificationMap.get(notificationType);
  let args: string | UIView | null;
  if (typeof msg === 'string' && msg) {
    args = msg;
  } else {
    args = getNativeView(this);
  }

  UIAccessibilityPostNotification(notificationInt, args || null);
  writeTrace(`${cls} - send ${notificationInt} with ${args || null}`);
});

setViewFunction(View, common.commonFunctions.accessibilityAnnouncement, function accessibilityAnnouncement(this: View, msg?: string) {
  const cls = `View<${this}.ios>.accessibilityAnnouncement("${msg}")`;
  if (!msg) {
    writeTrace(`${cls} - no msg, sending view.accessibilityLabel = ${this.accessibilityLabel} instead`);
    msg = this.accessibilityLabel;
  }

  writeTrace(`${cls} - sending ${msg}`);
  this.postAccessibilityNotification('announcement', msg);
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

  const cls = `View<${this}.ios>.accessibilityLabel = ${label}`;
  if (label) {
    writeTrace(`${cls}`);
    view.accessibilityLabel = `${label}`;
  } else {
    writeTrace(`${cls} - falsy value setting null`);
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
  const cls = `View<${this}.ios>.accessibilityIdentifier = ${identifier}`;

  if (identifier) {
    writeTrace(`${cls}`);
    view.accessibilityIdentifier = `${identifier}`;
  } else {
    writeTrace(`${cls} - falsy value setting null`);
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

  const cls = `View<${this}.ios>.accessibilityIdentifier = ${lang}`;
  if (lang) {
    writeTrace(`${cls}`);
    view.accessibilityLanguage = lang;
  } else {
    writeTrace(`${cls} - falsy value setting null`);
    view.accessibilityLanguage = null;
  }
};

View.prototype[common.accessibilityHintProperty.getDefault] = function accessibilityHintGetDefault() {
  const view = getNativeView(this);
  if (!view) {
    return null;
  }

  return view.accessibilityHint;
};

View.prototype[common.accessibilityHintProperty.setNative] = function accessibilityHintSetNative(value: string) {
  const view = getNativeView(this);
  if (!view) {
    return;
  }

  view.accessibilityHint = value;
};

setViewFunction(View, common.commonFunctions.accessibilityScreenChanged, function accessibilityScreenChanged(this: View) {
  this.postAccessibilityNotification('screen');
});

import * as nsApp from 'tns-core-modules/application';
import { PostAccessibilityNotificationType, View } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeTrace } from '../../trace';
import { addCssPropertyToView, addPropertyToView, inputArrayToBitMask, notifyAccessibilityFocusState, setViewFunction } from '../../utils/helpers';
import {
  accessibilityHiddenCssProperty,
  accessibilityHintProperty,
  accessibilityIdCssProperty,
  accessibilityLabelProperty,
  accessibilityValueProperty,
  accessibleCssProperty,
  commonFunctions,
  iosFunctions,
  ViewCommon,
} from './view-common';

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<View, string | string[] | null>(ViewCommon, 'accessibilityTraits');
export const accessibilityLanguageProperty = addCssPropertyToView<View, string>(ViewCommon, 'accessibilityLanguage', 'a11y-lang', false);

function getUIView(view: View): UIView {
  return view.ios;
}

View.prototype[accessibleCssProperty.getDefault] = function accessibleGetDefault(this: View) {
  const uiView = getUIView(this);
  if (!uiView) {
    return false;
  }

  const isAccessible = !!uiView.isAccessibilityElement;
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessible - default = ${isAccessible}`);
  }
  return isAccessible;
};

const accessibilityFocusObserverSymbol = Symbol.for('ios:accessibilityFocusObserver');
const accessibilityHadFocusSymbol = Symbol.for('ios:accessibilityHadFocusSymbol');

/**
 * Wrapper for setting up accessibility focus events for iOS9+
 * NOTE: This isn't supported on iOS8
 *
 * If the UIView changes from accessible = true to accessible = false, event will be removed
 *
 * @param {View} tnsView        NativeScript View
 * @param {boolean} isAccessible  is element marked as accessible
 */
function setupAccessibilityFocusEvents(tnsView: View, isAccessible: boolean) {
  const cls = `setupAccessibilityFocusEvents(${tnsView}, ${isAccessible})`;
  if (typeof UIAccessibilityElementFocusedNotification === 'undefined') {
    if (isTraceEnabled()) {
      writeTrace(`${cls}: not supported by this iOS version`);
    }
    return;
  }

  if (tnsView[accessibilityFocusObserverSymbol]) {
    if (isAccessible) {
      if (isTraceEnabled()) {
        writeTrace(`${cls}: Already configured no need to do so again`);
      }
      return;
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls}: view no longer accessible, remove listener`);
    }
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

    if (isTraceEnabled()) {
      writeTrace(`${cls}, view: ${localTnsView}, receivedFocus: ${receivedFocus}, lostFocus: ${lostFocus}`);
    }

    notifyAccessibilityFocusState(localTnsView, receivedFocus, lostFocus);

    if (receivedFocus) {
      localView[accessibilityHadFocusSymbol] = true;
    } else if (lostFocus) {
      localView[accessibilityHadFocusSymbol] = false;
    }
  });

  tnsView[accessibilityFocusObserverSymbol] = observer;
}

View.prototype[accessibleCssProperty.setNative] = function accessibleSetNative(this: View, isAccessible: boolean) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  uiView.isAccessibilityElement = !!isAccessible;

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessible = ${uiView.isAccessibilityElement}`);
  }

  setupAccessibilityFocusEvents(this, isAccessible);
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

View.prototype[accessibilityTraitsProperty.getDefault] = function accessibilityTraitsGetDefault(this: View) {
  const uiView = getUIView(this);
  if (!uiView) {
    return '';
  }

  const accessibilityTraits = getAccessibilityTraitsFromBitmask(uiView.accessibilityTraits);
  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityTraits - default -> '${uiView.accessibilityTraits}' = '${accessibilityTraits.join(',')}'`);
  }
  return accessibilityTraits;
};

View.prototype[accessibilityTraitsProperty.setNative] = function accessibilityTraitsSetNative(
  this: View,
  value: View.AccessibilityTrait | View.AccessibilityTrait[],
) {
  const uiView = getUIView(this);
  if (!uiView) {
    return;
  }

  ensureTraits();

  uiView.accessibilityTraits = inputArrayToBitMask(value, traits);

  const newAccessibilityTraits = getAccessibilityTraitsFromBitmask(uiView.accessibilityTraits);

  if (isTraceEnabled()) {
    writeTrace(`View<${this}.ios>.accessibilityTraits -> got ${value} -> result: '${uiView.accessibilityTraits}' = '${newAccessibilityTraits}'`);
  }
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

View.prototype[accessibilityIdCssProperty.getDefault] = function accessibilityIdentifierGetDefault(this: View) {
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

View.prototype[accessibilityIdCssProperty.setNative] = function accessibilityIdentifierSetNative(this: View, identifier: string) {
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

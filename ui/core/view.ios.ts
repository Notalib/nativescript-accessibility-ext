import { PropertyChangeData } from 'ui/core/dependency-observable';

import * as common from './view-common';
import { setNativeValueFn, setViewFunction, inputArrayToBitMask, writeTrace } from '../../utils/helpers';

// Define the android specific properties with a noop function
for (const propertyName of common.androidProperties) {
  setNativeValueFn(common.View, propertyName);
}

for (const fnName of common.androidFunctions) {
  setViewFunction(common.View, fnName);
}

function tnsViewToUIView(view: any): UIView {
  return <UIView>view._nativeView;
}

setNativeValueFn(common.View, 'accessible', function onAccessibleChanged(data: PropertyChangeData) {
  const view = tnsViewToUIView(data.object);
  const value = !!data.newValue;

  view.isAccessibilityElement = value;
  writeTrace(`View<ios>.accessible = ${value}`);
});

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

setNativeValueFn(common.View, 'accessibilityTraits', function onAccessibilityTraitsChanged(data: PropertyChangeData) {
  ensureTraits();

  const view = tnsViewToUIView(data.object);
  view.accessibilityTraits = inputArrayToBitMask(data.newValue, traits);
  writeTrace(`View<ios>.accessibilityTraits -> got ${data.newValue} -> result: ${view.accessibilityTraits}`);
});

setNativeValueFn(common.View, 'accessibilityValue', function onAccessibilityValueChanged(data: PropertyChangeData) {
  const view = tnsViewToUIView(data.object);
  const value = data.newValue;

  if (!value) {
    view.accessibilityValue = null;
    writeTrace(`View<ios>.accessibilityValue - ${value} is falsy, set to null to remove value`);
  } else {
    view.accessibilityValue = `${value}`;
    writeTrace(`View<ios>.accessibilityValue - ${value}`);
  }
});

setNativeValueFn(common.View, 'accessibilityElementsHidden', function onAccessibilityValueChanged(data: PropertyChangeData) {
  const view = tnsViewToUIView(data.object);
  const value = !!data.newValue;

  view.accessibilityElementsHidden = value;
  writeTrace(`View<ios>.accessibilityElementsHidden - ${value}`);
});

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

setViewFunction(common.View, 'postAccessibilityNotification', function postAccessibilityNotification(this: common.View, notificationType: string, msg?: string) {
  const view = tnsViewToUIView(this);

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
      args = view;
    }

    UIAccessibilityPostNotification(notificationInt, args || null);
    writeTrace(`View<ios>.postAccessibilityNotification(..) - send ${notificationType} with ${args || null}`);
  } else {
    writeTrace(`View<ios>.postAccessibilityNotification(..) - ${notificationType} is known notificationType`);
  }
});

setViewFunction(common.View, 'accessibilityAnnouncement', function accessibilityAnnouncement(this: common.View, msg?: string) {
  if (!msg) {
    const view = tnsViewToUIView(this);

    msg = view.accessibilityLabel;
    writeTrace(`View<ios>.accessibilityAnnouncement(..) - no msg, sending view.accessibilityLabel = ${view.accessibilityLabel} instead`);
  }

  this.postAccessibilityNotification('announcement', msg);
  writeTrace(`View<ios>.accessibilityAnnouncement(..) - sending ${msg}`);
});

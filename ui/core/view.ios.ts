import { View } from 'ui/core/view';
import * as proxy from 'ui/core/proxy';
import { PropertyChangeData } from 'ui/core/dependency-observable';

import * as common from './view-common';
import { setNativeValueFn, setViewFunction, inputArrayToBitMask } from '../../utils/helpers';

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
  const value = data.newValue;

  view.isAccessibilityElement = !!value;
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
});

setNativeValueFn(common.View, 'accessibilityValue', function onAccessibilityValueChanged(data: PropertyChangeData) {
  const view = tnsViewToUIView(data.object);
  const value = data.newValue;

  if (!value) {
    view.accessibilityValue = null;
  } else {
    view.accessibilityValue = `${value}`;
  }
});

setNativeValueFn(common.View, 'accessibilityElementsHidden', function onAccessibilityValueChanged(data: PropertyChangeData) {
  const view = tnsViewToUIView(data.object);
  const value = data.newValue;

  view.accessibilityElementsHidden = !!value;
});

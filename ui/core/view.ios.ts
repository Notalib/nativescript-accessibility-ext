import {View} from 'ui/core/view';
import * as proxy from 'ui/core/proxy';
import {PropertyChangeData} from 'ui/core/dependency-observable';

import * as common from './view-common';
import {setNativeValueFn} from '../../utils/helpers';

// Define the android specific properties with a noop function
for (const propertyName of common.androidProperties) {
  setNativeValueFn(common.View, propertyName);
}

setNativeValueFn(common.View, 'accessible', function onAccessibleChanged(data: PropertyChangeData) {
  const view = <UIView>(<any>data.object)._nativeView;
  const value = data.newValue;

  if (value == void 0) {
    return;
  }

  view.isAccessibilityElement = !!value;
});

const traits = new Map<string, number>([
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

function enforceArray(val: string | string[]): string[] {
  if (Array.isArray(val)) {
    return val;
  }

  if (typeof val === 'string') {
    return val.split(/[, ]/g).filter((v: string) => !!v);
  }

  console.log(`val is of unsupported type: ${val} -> ${typeof val}`);
  return [];
}

setNativeValueFn(common.View, 'accessibilityTraits', function onAccessibilityTraitsChanged(data: PropertyChangeData) {
  const view = <UIView>(<any>data.object)._nativeView;
  const value = enforceArray(data.newValue)
    .filter((val) => traits.has(val))
    .reduce((c, val) => c | traits.get(val), 0);

  if (!value) {
    return;
  }

  view.accessibilityTraits = value;
});

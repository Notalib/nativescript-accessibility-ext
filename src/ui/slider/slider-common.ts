/// <reference path="./slider.d.ts" />

import { AccessibilityDecrementEventData, AccessibilityIncrementEventData, Slider } from 'tns-core-modules/ui/slider';
import { addCssPropertyToView, setViewFunction } from '../../utils/helpers';

Slider.accessibilityDecrementEvent = 'accessibilityDecrement';
Slider.accessibilityIncrementEvent = 'accessibilityIncrement';

const accessibilityStepsPropertyName = 'accessibilityStep';
const accessibilityStepsCssName = 'a11y-steps';

export const accessibilityStepsCssProperty = addCssPropertyToView(Slider, accessibilityStepsPropertyName, accessibilityStepsCssName, false, 10, parseInt);

setViewFunction(Slider, '_handlerAccessibilityIncrementEvent', function _handlerAccessibilityIncrementEvent(this: Slider) {
  const args: AccessibilityIncrementEventData = {
    object: this,
    eventName: Slider.accessibilityIncrementEvent,
    value: this.value + (this.accessibilityStep || 10),
  };

  this.notify(args);

  return args.value;
});

setViewFunction(Slider, '_handlerAccessibilityDecrementEvent', function _handlerAccessibilityDecrementEvent(this: Slider) {
  const args: AccessibilityDecrementEventData = {
    object: this,
    eventName: Slider.accessibilityIncrementEvent,
    value: this.value - (this.accessibilityStep || 10),
  };

  this.notify(args);

  return args.value;
});

export { Slider };

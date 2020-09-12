import '@nativescript/core/ui/slider';
import { EventData } from '@nativescript/core/data/observable';

declare module '@nativescript/core/ui/slider' {
  interface Slider {
    accessibilityStep: number;
    _handlerAccessibilityIncrementEvent(): number;
    _handlerAccessibilityDecrementEvent(): number;
  }

  namespace Slider {
    let accessibilityIncrementEvent: string;
    let accessibilityDecrementEvent: string;
  }

  interface AccessibilityIncrementEventData extends EventData {
    object: Slider;
    value?: number;
  }

  interface AccessibilityDecrementEventData extends EventData {
    object: Slider;
    value?: number;
  }
}

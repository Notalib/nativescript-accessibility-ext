import 'tns-core-modules/ui/slider';
import { EventData } from 'tns-core-modules/ui/page';

declare module 'tns-core-modules/ui/slider' {
    interface Slider {
        accessibilitySteps: number;
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
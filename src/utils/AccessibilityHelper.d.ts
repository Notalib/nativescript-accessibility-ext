import { View } from 'tns-core-modules/ui/core/view';
export declare class AccessibilityHelper {
    static readonly BUTTON: string;
    static readonly RADIOBUTTON_CHECKED: string;
    static readonly RADIOBUTTON_UNCHECKED: string;
    static readonly ACCESSIBLE: string;
    static updateAccessibilityComponentType(tnsView: View, androidView: android.view.View, componentType: string): void;
    static removeAccessibilityComponentType(androidView: android.view.View): void;
    static sendAccessibilityEvent(androidView: android.view.View, eventName: string, text?: string): void;
}

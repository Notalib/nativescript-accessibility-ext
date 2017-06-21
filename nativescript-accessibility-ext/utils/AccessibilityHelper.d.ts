export declare class AccessibilityHelper {
    static BUTTON: string;
    static RADIOBUTTON_CHECKED: string;
    static RADIOBUTTON_UNCHECKED: string;
    static updateAccessibilityComponentType(view: android.view.View, componentType: string): void;
    static sendAccessibilityEvent(view: android.view.View, eventName: string, text?: string): void;
}

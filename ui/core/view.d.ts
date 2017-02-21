declare module 'ui/core/view' {
  interface View {
    // Common for both platforms
    accessible?: boolean;
    accessibilityAnnouncement(msg?: string);

    // Android Specific
    importantForAccessibility?: 'yes' | 'no' | 'auto' | 'no-hide-descendants';
    accessibilityComponentType?: 'button' | 'radiobutton_checked' | 'radiobutton_unchecked';
    accessibilityLiveRegion?: 'none'  | 'polite' | 'assertive';
    sendAccessibilityEvent(eventName: string, text?: string);

    // iOS Specific
    accessibilityTraits?: string | string[];
    accessibilityValue?: string;
    accessibilityElementsHidden?: boolean;
    postAccessibilityNotification(notificationType: string, args?: string);
  }
}

import { View } from 'tns-core-modules/ui/core/view';
declare module 'tns-core-modules/ui/core/view' {
  interface View {
    // Common for both platforms

    /**
     * If `true` the element is an accessibility element and all the children will be treated as a single selectable component.
     */
    accessible?: boolean;

    /**
     * Make an announcement to the screen reader.
     */
    accessibilityAnnouncement(msg?: string);

    /**
     * Set the accessibility label on the element, this will be read by the screen reader inplace in any 'text' value the element has.
     */
    accessibilityLabel?: string;

    /**
     * Set the elements unique accessibilityIdentifier.
     */
    accessibilityIdentifier?: string;

    // Android Specific
    importantForAccessibility?: 'yes' | 'no' | 'auto' | 'no-hide-descendants';
    accessibilityComponentType?: 'button' | 'radiobutton_checked' | 'radiobutton_unchecked';
    accessibilityLiveRegion?: 'none'  | 'polite' | 'assertive';
    sendAccessibilityEvent(eventName: string, text?: string);

    // iOS Specific
    accessibilityTraits?: string | string[];
    accessibilityValue?: string;
    accessibilityElementsHidden?: boolean;
    /**
     * Sets the language in which to speak the element's label and value.
     * Accepts language ID tags that follows the "BCP 47" specification.
     */
    accessibilityLanguage?: string;
    postAccessibilityNotification(notificationType: string, args?: string);
  }
}

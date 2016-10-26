declare module 'ui/core/view' {
  interface View {
    // Common for both platforms
    accessible?: boolean;

    // Android Specific
    importantForAccessibility?: 'yes' | 'no' | 'auto' | 'no-hide-descendants';
    accessibilityComponentType?: 'button' | 'radiobutton_checked' | 'radiobutton_unchecked';
    accessibilityLiveRegion?: 'none'  | 'polite' | 'assertive';

    // iOS Specific
    accessibilityTraits?: string | string[];
  }
}

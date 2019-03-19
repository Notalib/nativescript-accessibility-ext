import { EventData } from 'tns-core-modules/ui/core/view';

declare module 'tns-core-modules/ui/core/view' {
  enum AccessibilityTrait {
    // The accessibility element has no traits.
    None = 'none',

    // The accessibility element should be treated as a button.
    Button = 'button',

    // The accessibility element should be treated as a link.
    Link = 'link',

    // The accessibility element should be treated as a search field.
    SearchField = 'search',

    // The accessibility element should be treated as an image.
    Image = 'image',

    // The accessibility element is currently selected.
    Selected = 'selected',

    // The accessibility element plays its own sound when activated.
    PlaysSound = 'plays',

    // The accessibility element behaves as a keyboard key.
    KeybordKey = 'key',

    // The accessibility element should be treated as static text that cannot change.
    StaticText = 'text',

    // The accessibility element provides summary information when the application starts.
    SummaryElement = 'summary',

    // The accessibility element is not enabled and does not respond to user interaction.
    NotEnabled = 'disabled',

    // The accessibility element frequently updates its label or value.
    UpdatesFrequently = 'frequentUpdates',

    // The accessibility element starts a media session when it is activated.
    StartsMediaSession = 'startsMedia',

    // The accessibility element allows continuous adjustment through a range of values.
    Adjustable = 'adjustable',

    // The accessibility element allows direct touch interaction for VoiceOver users.
    AllowsDirectInteraction = 'allowsDirectInteraction',

    // The accessibility element should cause an automatic page turn when VoiceOver finishes reading the text within it.
    CausesPageTurn = 'pageTurn',

    // The accessibility element is a header that divides content into sections, such as the title of a navigation bar.
    Header = 'header',
  }

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
    accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
    sendAccessibilityEvent(eventName: string, text?: string);

    // iOS Specific
    accessibilityTraits?: AccessibilityTrait | AccessibilityTrait[];
    accessibilityValue?: string;
    accessibilityElementsHidden?: boolean;
    accessibilityHint?: string;

    /**
     * Sets the language in which to speak the element's label and value.
     * Accepts language ID tags that follows the "BCP 47" specification.
     */
    accessibilityLanguage?: string;
    postAccessibilityNotification(notificationType: string, args?: string);
  }

  // Adding static properties
  namespace View {
    /**
     * Event triggered than the view receives the accessibility focus
     */
    let accessibilityFocusEvent: string;

    /**
     * Event triggered than the view looses the accessibility focus
     */
    let accessibilityBlurEvent: string;
  
    /**
     * Event triggered than the view looses or receives the accessibility focus
     */
    let accessibilityFocusChangedEvent: string;
  }

  interface AccessibilityFocusEventData extends EventData {
    object: View;
  }
  
  interface AccessibilityBlurEventData extends AccessibilityFocusEventData {}

  interface AccessibilityFocusChangedEventData extends AccessibilityFocusEventData {
    value: boolean;
  }
}

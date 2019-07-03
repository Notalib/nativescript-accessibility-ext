// @ts-ignore
import { EventData } from 'tns-core-modules/data/observable';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

// @ts-ignore
declare module 'tns-core-modules/ui/core/view' {
  // @ts-ignore
  type PostAccessibilityNotificationType = 'announcement' | 'screen' | 'layout';

  interface View {
    fontScaleObservable?: FontScaleObservable | void;
    // Common for both platforms

    /**
     * If `true` the element is an accessibility element and all the children will be treated as a single selectable component.
     */
    accessible?: boolean;

    /**
     * Make an announcement to the screen reader.
     */
    accessibilityAnnouncement(msg?: string): void;

    /**
     * Announce screen changed. Used on Page.navigatedToEvent
     */
    accessibilityScreenChanged(): void;

    /**
     * Short description of the element, ideally one word.
     */
    accessibilityLabel?: string;

    /**
     * Current value of the element in a localized string.
     */
    accessibilityValue?: string;

    /**
     * A hint describes the elements behavior. Example: 'Tap change playback speed'
     */
    accessibilityHint?: string;

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
    accessibilityTraits?: View.AccessibilityTrait | View.AccessibilityTrait[] | string | string[];
    accessibilityElementsHidden?: boolean;

    /**
     * Sets the language in which to speak the element's label and value.
     * Accepts language ID tags that follows the "BCP 47" specification.
     */
    accessibilityLanguage?: string;

    /**
     * iOS: post accessibility notification.
     * type = 'announcement' will announce `args` via VoiceOver. If no args element will be announced instead.
     * type = 'layout' used when the layout of a screen changes.
     * type = 'screen' large change made to the screen.
     */
    postAccessibilityNotification(type: PostAccessibilityNotificationType, args?: string);
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

    function on(event: string, callback: (data: EventData) => void, thisArg?: any);
    function once(event: string, callback: (data: EventData) => void, thisArg?: any);
    function off(eventNames: string, callback?: any, thisArg?: any);
    function addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    function removeEventListener(eventNames: string, callback?: any, thisArg?: any);

    // @ts-ignore
    enum AccessibilityTrait {
      /**
       * The accessibility element has no traits.
       */
      None = 'none',

      /**
       * The accessibility element should be treated as a button.
       */
      Button = 'button',

      /**
       * The accessibility element should be treated as a link.
       */
      Link = 'link',

      /**
       * The accessibility element should be treated as a search field.
       */
      SearchField = 'search',

      /**
       * The accessibility element should be treated as an image.
       */
      Image = 'image',

      /**
       * The accessibility element is currently selected.
       */
      Selected = 'selected',

      /**
       * The accessibility element plays its own sound when activated.
       */
      PlaysSound = 'plays',

      /**
       * The accessibility element behaves as a keyboard key.
       */
      KeyboardKey = 'key',

      /**
       * The accessibility element should be treated as static text that cannot change.
       */
      StaticText = 'text',

      /**
       * The accessibility element provides summary information when the application starts.
       */
      SummaryElement = 'summary',

      /**
       * The accessibility element is not enabled and does not respond to user interaction.
       */
      NotEnabled = 'disabled',

      /**
       * The accessibility element frequently updates its label or value.
       */
      UpdatesFrequently = 'frequentUpdates',

      /**
       * The accessibility element starts a media session when it is activated.
       */
      StartsMediaSession = 'startsMedia',

      /**
       * The accessibility element allows continuous adjustment through a range of values.
       */
      Adjustable = 'adjustable',

      /**
       * The accessibility element allows direct touch interaction for VoiceOver users.
       */
      AllowsDirectInteraction = 'allowsDirectInteraction',

      /**
       * The accessibility element should cause an automatic page turn when VoiceOver finishes reading the text within it.
       * Note: Requires custom view with accessibilityScroll(...)
       */
      CausesPageTurn = 'pageTurn',

      /**
       * The accessibility element is a header that divides content into sections, such as the title of a navigation bar.
       */
      Header = 'header',
    }
  }

  interface AccessibilityFocusEventData extends EventData {
    object: View;
  }

  interface AccessibilityBlurEventData extends AccessibilityFocusEventData {}

  interface AccessibilityFocusChangedEventData extends AccessibilityFocusEventData {
    value: boolean;
  }
}

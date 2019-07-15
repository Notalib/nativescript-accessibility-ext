import { EventData } from 'tns-core-modules/data/observable';
import { FontScaleObservable } from '../../utils/FontScaleObservable';
import { AccessibilityLiveRegion as _AccessibilityLiveRegion, AccessibilityRole as _AccessibilityComponentType, AccessibilityState as _AccessibilityState, AccessibilityTrait as _AccessibilityTrait } from './view-common';


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

    /**
     * Hide the element from the a11y service
     */
    accessibilityHidden?: boolean;

    accessibilityRole?: _AccessibilityComponentType | string;
    accessibilityState?: _AccessibilityState | string;

    accessibilityLiveRegion?: _AccessibilityLiveRegion | string;
    sendAccessibilityEvent(eventName: string, text?: string);

    // iOS Specific
    accessibilityTraits?: _AccessibilityTrait | _AccessibilityTrait[] | string | string[];

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

    const AccessibilityTrait: typeof _AccessibilityTrait;
    const AccessibilityState: typeof _AccessibilityState;
    const AccessibilityComponentType: typeof _AccessibilityComponentType;
  }

  interface AccessibilityFocusEventData extends EventData {
    object: View;
  }

  interface AccessibilityBlurEventData extends AccessibilityFocusEventData {}

  interface AccessibilityFocusChangedEventData extends AccessibilityFocusEventData {
    value: boolean;
  }
}

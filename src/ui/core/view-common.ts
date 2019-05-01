/// <reference path="./view.d.ts" />

import { View } from 'tns-core-modules/ui/core/view';
import { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';
import { addBooleanPropertyToView, addPropertyToView, setViewFunction } from '../../utils/helpers';

// Common properties
export const accessibleProperty = addBooleanPropertyToView<View>(ViewCommon, 'accessible', false);
export const accessibilityLabelProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityLabel');
export const accessibilityIdentifierProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityIdentifier');
export const accessibilityValueProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityValue');
export const accessibilityHintProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityHint');

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<View, string | string[] | null>(ViewCommon, 'accessibilityTraits');
export const accessibilityLanguageProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLanguage');
export const accessibilityElementsHidden = addBooleanPropertyToView<View>(ViewCommon, 'accessibilityElementsHidden', false);

// Android properties
export const importantForAccessibilityProperty = addPropertyToView<View, string>(ViewCommon, 'importantForAccessibility');
export const accessibilityComponentTypeProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityComponentType');
export const accessibilityLiveRegionProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLiveRegion');

export enum AccessibilityTrait {
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

export const commonFunctions = {
  accessibilityAnnouncement: 'accessibilityAnnouncement',
  accessibilityScreenChanged: 'accessibilityScreenChanged',
};
export const iosFunctions = {
  postAccessibilityNotification: 'postAccessibilityNotification',
};
export const androidFunctions = {
  sendAccessibilityEvent: 'sendAccessibilityEvent',
};
export const allFunctions = {
  ...commonFunctions,
  ...iosFunctions,
  ...androidFunctions,
};

for (const fnName of Object.keys(allFunctions)) {
  setViewFunction(ViewCommon, fnName);
}

View.accessibilityFocusEvent = 'accessibilityFocus';
View.accessibilityBlurEvent = 'accessibilityBlur';
View.accessibilityFocusChangedEvent = 'accessibilityFocusChanged';
View.AccessibilityTrait = AccessibilityTrait;

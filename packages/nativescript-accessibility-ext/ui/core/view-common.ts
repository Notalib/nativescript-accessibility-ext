/// <reference path="./view.d.ts" />

import { isIOS, View } from '@nativescript/core';
import { PostAccessibilityNotificationType } from '@nativescript/core/ui/core/view';
import { addBooleanCssPropertyToView, addCssPropertyToView, addPropertyToView, makePropertyEnumConverter, setViewFunction } from '../../utils/helpers';

export enum AccessibilityTrait {
  /**
   * The element has no traits.
   */
  None = 'none',

  /**
   * The element should be treated as a button.
   */
  Button = 'button',

  /**
   * The element should be treated as a link.
   */
  Link = 'link',

  /**
   * The element should be treated as a search field.
   */
  SearchField = 'search',

  /**
   * The element should be treated as an image.
   */
  Image = 'image',

  /**
   * The element is currently selected.
   */
  Selected = 'selected',

  /**
   * The element plays its own sound when activated.
   */
  PlaysSound = 'plays',

  /**
   * The element behaves as a keyboard key.
   */
  KeyboardKey = 'key',

  /**
   * The element should be treated as static text that cannot change.
   */
  StaticText = 'text',

  /**
   * The element provides summary information when the application starts.
   */
  SummaryElement = 'summary',

  /**
   * The element is not enabled and does not respond to user interaction.
   */
  NotEnabled = 'disabled',

  /**
   * The element frequently updates its label or value.
   */
  UpdatesFrequently = 'frequentUpdates',

  /**
   * The element starts a media session when it is activated.
   */
  StartsMediaSession = 'startsMedia',

  /**
   * The element allows continuous adjustment through a range of values.
   */
  Adjustable = 'adjustable',

  /**
   * The element allows direct touch interaction for VoiceOver users.
   */
  AllowsDirectInteraction = 'allowsDirectInteraction',

  /**
   * The element should cause an automatic page turn when VoiceOver finishes reading the text within it.
   * Note: Requires custom view with accessibilityScroll(...)
   */
  CausesPageTurn = 'pageTurn',

  /**
   * The element is a header that divides content into sections, such as the title of a navigation bar.
   */
  Header = 'header',
}

export enum AccessibilityRole {
  /**
   * The element has no traits.
   */
  None = 'none',

  /**
   * The element should be treated as a button.
   */
  Button = 'button',

  /**
   * The element should be treated as a link.
   */
  Link = 'link',

  /**
   * The element should be treated as a search field.
   */
  Search = 'search',

  /**
   * The element should be treated as an image.
   */
  Image = 'image',

  /**
   * The element should be treated as a image button.
   */
  ImageButton = 'image_button',

  /**
   * The element behaves as a keyboard key.
   */
  KeyboardKey = 'keyboard_key',

  /**
   * The element should be treated as static text that cannot change.
   */
  StaticText = 'text_field',

  /**
   * The element allows continuous adjustment through a range of values.
   */
  Adjustable = 'adjustable',

  /**
   * The element provides summary information when the application starts.
   */
  Summary = 'summery',

  /**
   * The element is a header that divides content into sections, such as the title of a navigation bar.
   */
  Header = 'header',
  Checkbox = 'checkbox',
  ProgressBar = 'progress_bar',
  RadioButton = 'radiobutton',
  SpinButton = 'spin_button',
  Switch = 'switch',
}

export enum AccessibilityState {
  Selected = 'selected',
  Checked = 'checked',
  Unchecked = 'unchecked',
  Disabled = 'disabled',
}

export enum AccessibilityLiveRegion {
  None = 'none',
  Polite = 'polite',
  Assertive = 'assertive',
}

export const commonFunctions = {
  accessibilityAnnouncement: 'accessibilityAnnouncement',
  accessibilityScreenChanged: 'accessibilityScreenChanged',
};

export const iosFunctions = {
  iosPostAccessibilityNotification: 'iosPostAccessibilityNotification',
};
export const androidFunctions = {
  androidSendAccessibilityEvent: 'androidSendAccessibilityEvent',
};
export const allFunctions = {
  ...commonFunctions,
  ...iosFunctions,
  ...androidFunctions,
};

for (const fnName of Object.keys(allFunctions)) {
  setViewFunction(View, fnName);
}

setViewFunction(View, 'postAccessibilityNotification', function (notificationType: PostAccessibilityNotificationType, msg?: string) {
  console.warn(`DEPRECATED: ${this}.postAccessibilityNotification is no longer supported. Please use "${iosFunctions.iosPostAccessibilityNotification}"`);

  this[iosFunctions.iosPostAccessibilityNotification](notificationType, msg);
});

setViewFunction(View, 'sendAccessibilityEvent', function (eventName: string, text?: string) {
  console.warn(`DEPRECATED: ${this}.sendAccessibilityEvent is no longer supported. Please use "${androidFunctions.androidSendAccessibilityEvent}"`);

  this[androidFunctions.androidSendAccessibilityEvent](eventName, text);
});

const accessiblePropertyName = 'accessible';
const accessibleCssName = 'a11y-enabled';
const accessibilityHiddenPropertyName = 'accessibilityHidden';
const accessibilityHiddenCssName = 'a11y-hidden';
const accessibilityIdPropertyName = 'accessibilityIdentifier';
const accessibilityRolePropertyName = 'accessibilityRole';
const accessibilityRoleCssName = 'a11y-role';
const accessibilityStatePropertyName = 'accessibilityState';
const accessibilityStateCssName = 'a11y-state';
const accessibilityLabelPropertyName = 'accessibilityLabel';
const accessibilityValuePropertyName = 'accessibilityValue';
const accessibilityHintPropertyName = 'accessibilityHint';
const accessibilityLiveRegionPropertyName = 'accessibilityLiveRegion';
const accessibilityLiveRegionCssName = 'a11y-live-region';
const accessibilityTraitsPropertyName = 'accessibilityTraits';
const accessibilityLanguagePropertyName = 'accessibilityLanguage';
const accessibilityLanguageCssName = 'a11y-lang';
const accessibilityMediaSessionPropertyName = 'accessibilityMediaSession';
const accessibilityMediaSessionCssName = 'a11y-media-session';

// Common properties
export const accessibleCssProperty = addBooleanCssPropertyToView(View, accessiblePropertyName, accessibleCssName);
export const accessibilityIdProperty = addPropertyToView<string | null>(View, accessibilityIdPropertyName);
export const accessibilityRoleCssProperty = addCssPropertyToView<string>(
  View,
  accessibilityRolePropertyName,
  accessibilityRoleCssName,
  false,
  undefined,
  makePropertyEnumConverter<AccessibilityRole>(AccessibilityRole),
);
export const accessibilityStateCssProperty = addCssPropertyToView<string>(
  View,
  accessibilityStatePropertyName,
  accessibilityStateCssName,
  false,
  undefined,
  makePropertyEnumConverter<AccessibilityState>(AccessibilityState),
);
export const accessibilityLabelProperty = addPropertyToView<string | null>(View, accessibilityLabelPropertyName);
export const accessibilityValueProperty = addPropertyToView<string | null>(View, accessibilityValuePropertyName);
export const accessibilityHintProperty = addPropertyToView<string | null>(View, accessibilityHintPropertyName);
export const accessibilityHiddenCssProperty = addBooleanCssPropertyToView(View, accessibilityHiddenPropertyName, accessibilityHiddenCssName, !!isIOS);
export const accessibilityLiveRegionCssProperty = addCssPropertyToView<'none' | 'polite' | 'assertive'>(
  View,
  accessibilityLiveRegionPropertyName,
  accessibilityLiveRegionCssName,
  false,
  'none',
  (value: string): 'none' | 'polite' | 'assertive' => {
    switch (`${value}`.toLowerCase()) {
      case 'none': {
        return 'none';
      }
      case 'polite': {
        return 'polite';
      }
      case 'assertive': {
        return 'assertive';
      }
    }

    return 'none';
  },
);

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<string | string[] | null>(View, accessibilityTraitsPropertyName);
export const accessibilityLanguageProperty = addCssPropertyToView<string>(View, accessibilityLanguagePropertyName, accessibilityLanguageCssName);
export const accessibilityMediaSessionCssProperty = addBooleanCssPropertyToView(
  View,
  accessibilityMediaSessionPropertyName,
  accessibilityMediaSessionCssName,
  false,
);

Object.defineProperties(View, {
  accessibilityFocusEvent: {
    configurable: true,
    get() {
      return 'accessibilityFocus';
    },
  },
  accessibilityBlurEvent: {
    configurable: true,
    get() {
      return 'accessibilityBlur';
    },
  },
  accessibilityFocusChangedEvent: {
    configurable: true,
    get() {
      return 'accessibilityFocusChanged';
    },
  },
  AccessibilityTrait: {
    configurable: true,
    get() {
      return AccessibilityTrait;
    },
  },
  AccessibilityComponentType: {
    configurable: true,
    get() {
      return AccessibilityRole;
    },
  },
  AccessibilityState: {
    configurable: true,
    get() {
      return AccessibilityState;
    },
  },
});

Object.defineProperties(View.prototype, {
  importantForAccessibility: {
    configurable: true,
    get() {
      return null;
    },
    set(this: View, value) {
      console.warn(`DEPRECATED: ${this}.importantForAccessibility = "${value}" is no longer supported. Please use "${accessibilityHiddenPropertyName}"`);
      if (value && value !== 'yes') {
        this[accessibilityHiddenPropertyName] = true;
      }
    },
  },
  accessibilityElementsHidden: {
    configurable: true,
    get() {
      return null;
    },
    set(this: View, value) {
      console.warn(`DEPRECATED: ${this}.accessibilityElementsHidden = "${value}" is no longer supported. Please use "${accessibilityHiddenPropertyName}"`);

      this[accessibilityHiddenPropertyName] = !!value;
    },
  },
  accessibilityComponentType: {
    configurable: true,
    get(this: View) {
      return this[accessibilityRolePropertyName];
    },
    set(this: View, value) {
      console.warn(`DEPRECATED: ${this}.accessibilityComponentType = "${value}" is no longer supported. Please use "${accessibilityRolePropertyName}"`);

      if (value === 'radiobutton_checked') {
        this[accessibilityRolePropertyName] = AccessibilityRole.RadioButton;
        this[accessibilityStatePropertyName] = AccessibilityState.Checked;
      } else if (value === 'radiobutton_unchecked') {
        this[accessibilityRolePropertyName] = AccessibilityRole.RadioButton;
        this[accessibilityStatePropertyName] = AccessibilityState.Unchecked;
      } else {
        this[accessibilityRolePropertyName] = value;
      }
    },
  },
});

export { View };

/// <reference path="./view.d.ts" />

import { isIOS } from 'tns-core-modules/platform';
import { PostAccessibilityNotificationType, View } from 'tns-core-modules/ui/core/view';
import { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';
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
  setViewFunction(ViewCommon, fnName);
}

setViewFunction(ViewCommon, 'postAccessibilityNotification', function(notificationType: PostAccessibilityNotificationType, msg?: string) {
  console.warn(`DEPRECATED: ${this}.postAccessibilityNotification  is no longer supported. Please use "${iosFunctions.iosPostAccessibilityNotification}"`);

  this[iosFunctions.iosPostAccessibilityNotification](notificationType, msg);
});

setViewFunction(ViewCommon, 'sendAccessibilityEvent', function(eventName: string, text?: string) {
  console.warn(`DEPRECATED: ${this}.sendAccessibilityEvent  is no longer supported. Please use "${androidFunctions.androidSendAccessibilityEvent}"`);

  this[androidFunctions.androidSendAccessibilityEvent](eventName, text);
});

export const accessiblePropertyName = 'accessible';
export const accessibleCssName = 'a11y-enabled';
export const accessibilityHiddenPropertyName = 'accessibilityHidden';
export const accessibilityHiddenCssName = 'a11y-hidden';
export const accessibilityIdPropertyName = 'accessibilityIdentifier';
export const accessibilityRolePropertyName = 'accessibilityRole';
export const accessibilityRoleCssName = 'a11y-role';
export const accessibilityStatePropertyName = 'accessibilityState';
export const accessibilityStateCssName = 'a11y-state';
export const accessibilityLabelPropertyName = 'accessibilityLabel';
export const accessibilityValuePropertyName = 'accessibilityValue';
export const accessibilityHintPropertyName = 'accessibilityHint';
export const accessibilityLiveRegionPropertyName = 'accessibilityLiveRegion';
export const accessibilityLiveRegionCssName = 'a11y-live-region';
export const accessibilityTraitsPropertyName = 'accessibilityTraits';
export const accessibilityLanguagePropertyName = 'accessibilityLanguage';
export const accessibilityLanguageCssName = 'a11y-lang';

// Common properties
export const accessibleCssProperty = addBooleanCssPropertyToView(ViewCommon, accessiblePropertyName, accessibleCssName);
export const accessibilityIdProperty = addPropertyToView<View, string | null>(ViewCommon, accessibilityIdPropertyName);
export const accessibilityRoleCssProperty = addCssPropertyToView<View, string>(
  ViewCommon,
  accessibilityRolePropertyName,
  accessibilityRoleCssName,
  false,
  undefined,
  makePropertyEnumConverter<AccessibilityRole>(AccessibilityRole),
);
export const accessibilityStateCssProperty = addCssPropertyToView<View, string>(
  ViewCommon,
  accessibilityStatePropertyName,
  accessibilityStateCssName,
  false,
  undefined,
  makePropertyEnumConverter<AccessibilityState>(AccessibilityState),
);

export const accessibilityLabelProperty = addPropertyToView<View, string | null>(ViewCommon, accessibilityLabelPropertyName);
export const accessibilityValueProperty = addPropertyToView<View, string | null>(ViewCommon, accessibilityValuePropertyName);
export const accessibilityHintProperty = addPropertyToView<View, string | null>(ViewCommon, accessibilityHintPropertyName);
export const accessibilityHiddenCssProperty = addBooleanCssPropertyToView(ViewCommon, accessibilityHiddenPropertyName, accessibilityHiddenCssName, !!isIOS);
export const accessibilityLiveRegionCssProperty = addCssPropertyToView<View, 'none' | 'polite' | 'assertive'>(
  ViewCommon,
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
export const accessibilityTraitsProperty = addPropertyToView<View, string | string[] | null>(ViewCommon, accessibilityTraitsPropertyName);
export const accessibilityLanguageProperty = addCssPropertyToView<View, string>(ViewCommon, accessibilityLanguagePropertyName, accessibilityLanguageCssName);

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

export { ViewCommon };

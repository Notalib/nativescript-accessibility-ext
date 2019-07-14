/// <reference path="./view.d.ts" />

import { isIOS } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui/core/view';
import { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';
import { addBooleanCssPropertyToView, addCssPropertyToView, addPropertyToView, setViewFunction } from '../../utils/helpers';

export const accessiblePropertyName = 'accessible';
export const accessibleCssName = 'a11y';
export const accessibilityHiddenPropertyName = 'accessibilityHidden';
export const accessibilityHiddenCssName = 'a11y-hidden';
export const accessibilityIdPropertyName = 'accessibilityIdentifier';
export const accessibilityIdCssName = 'a11y-id';
export const accessibilityComponentTypePropertyName = 'accessibilityComponentType';
export const accessibilityComponentCssName = 'a11y-type';
export const accessibilityStatePropertyName = 'accessibilityState';
export const accessibilityStateCssName = 'a11y-state';

// Common properties
export const accessibleCssProperty = addBooleanCssPropertyToView(ViewCommon, accessiblePropertyName, accessibleCssName);
export const accessibilityIdCssProperty = addCssPropertyToView<View, string | null>(ViewCommon, accessibilityIdPropertyName, accessibilityIdCssName);
export const accessibilityComponentTypeCssProperty = addCssPropertyToView<View, string>(
  ViewCommon,
  accessibilityComponentTypePropertyName,
  accessibilityComponentCssName,
);

export const accessibilityStateCssProperty = addCssPropertyToView<View, string>(
  ViewCommon,
  accessibilityStatePropertyName,
  accessibilityStateCssName,
  false,
  undefined,
  (value): AccessibilityState | null => {
    if (!value) {
      return null;
    }

    for (const [key, v] of Object.entries(AccessibilityState)) {
      if (key === value || v === `${value}`.toLowerCase()) {
        return v;
      }
    }

    return null;
  },
);

export const accessibilityLabelProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityLabel');
export const accessibilityValueProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityValue');
export const accessibilityHintProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityHint');

export const accessibilityHiddenCssProperty = addBooleanCssPropertyToView(ViewCommon, accessibilityHiddenPropertyName, accessibilityHiddenCssName, !!isIOS);

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

export enum AccessibilityComponentType {
  None = 'none',
  Button = 'button',
  Link = 'link',
  Search = 'search',
  Image = 'image',
  ImageButton = 'image_button',
  KeyboardKey = 'keyboard_key',
  Text = 'text_field',
  Adjustable = 'adjustable',
  Summary = 'summery',
  Header = 'header',
  Alert = 'alert',
  Checkbox = 'checkbox',
  ProgressBar = 'progress_bar',
  RadioButton = 'radiobutton',
  SpinButton = 'spin_button',
  Switch = 'switch',
  Tab = 'tab',
  TabList = 'tab_list',
  Timer = 'timer',
  ToolBar = 'toolbar',
}

export enum AccessibilityState {
  Selected = 'selected',
  Checked = 'checked',
  Unchecked = 'unchecked',
  Disabled = 'disabled',
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
      return AccessibilityComponentType;
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
    set(value) {
      console.warn(`${this}.importantForAccessibility = "${value}" is no longer supported. Please use "${accessibilityHiddenPropertyName}"`);
    },
  },
});

export { ViewCommon };

import { View } from 'tns-core-modules/ui/core/view';
import { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';
import { addBooleanPropertyToView, addPropertyToView, setViewFunction } from '../../utils/helpers';

// Common properties
export const accessibleProperty = addBooleanPropertyToView<View>(ViewCommon, 'accessible', false);
export const accessibilityLabelProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityLabel');
export const accessibilityIdentifierProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityIdentifier');

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<View, string | string[] | null>(ViewCommon, 'accessibilityTraits');
export const accessibilityValueProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityValue');
export const accessibilityLanguageProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLanguage');
export const accessibilityElementsHidden = addBooleanPropertyToView<View>(ViewCommon, 'accessibilityElementsHidden', false);

// Android properties
export const importantForAccessibilityProperty = addBooleanPropertyToView<View>(ViewCommon, 'importantForAccessibility', false);
export const accessibilityComponentTypeProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityComponentType');
export const accessibilityLiveRegionProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLiveRegion');

export const commonFunctions = {
  accessibilityAnnouncement: 'accessibilityAnnouncement',
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

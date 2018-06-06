import { addPropertyToView, Property, setViewFunction, View, ViewCommon } from '../../utils/helpers';
export { Property, View, ViewCommon } from '../../utils/helpers';

// Common properties
export const accessibleProperty: Property<View, boolean> = addPropertyToView<View, boolean>(ViewCommon, 'accessible', false);
export const accessibilityLabelProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityLabel');
export const accessibilityIdentifierProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityIdentifier');

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<View, string | string[] | null>(ViewCommon, 'accessibilityTraits');
export const accessibilityValueProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityValue');
export const accessibilityLanguageProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLanguage');
export const accessibilityElementsHidden = addPropertyToView<View, string>(ViewCommon, 'accessibilityElementsHidden', 'no');

// Android properties
export const importantForAccessibilityProperty = addPropertyToView<View, boolean>(ViewCommon, 'importantForAccessibility', false);
export const accessibilityComponentTypeProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityComponentType');
export const accessibilityLiveRegionProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLiveRegion');

export const commonFunctions = {
  'accessibilityAnnouncement': 'accessibilityAnnouncement',
};
export const iosFunctions = {
  'postAccessibilityNotification': 'postAccessibilityNotification',
};
export const androidFunctions = {
  'sendAccessibilityEvent': 'sendAccessibilityEvent',
};
export const allFunctions = Object.assign({}, commonFunctions, iosFunctions, androidFunctions);

for (const fnName of Object.keys(allFunctions)) {
  setViewFunction(ViewCommon, fnName);
}

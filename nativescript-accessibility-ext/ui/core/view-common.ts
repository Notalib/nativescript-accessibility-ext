import { setViewFunction, addPropertyToView, Property, View, ViewCommon } from '../../utils/helpers';
export { Property, View, ViewCommon } from '../../utils/helpers';

// Common properties
export const accessibleProperty: Property<View, boolean> = addPropertyToView<View, boolean>(ViewCommon, 'accessible', false);
export const accessibilityLabelProperty = addPropertyToView<View, boolean>(ViewCommon, 'accessibilityLabel', false);
export const accessibilityIdentidierProperty = addPropertyToView<View, boolean>(ViewCommon, 'accessibilityIdentifier', false);

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<View, string | string[] | null>(ViewCommon, 'accessibilityTraits');
export const accessibilityValueProperty = addPropertyToView<View, string | null>(ViewCommon, 'accessibilityValue');
export const accessibilityLanguageProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLanguage');
export const accessibilityElementsHidden = addPropertyToView<View, string>(ViewCommon, 'accessibilityElementsHidden', 'no');

// Android properties
export const importantForAccessibilityProperty = addPropertyToView<View, boolean>(ViewCommon, 'importantForAccessibility', false);
export const accessibilityComponentTypeProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityComponentType');
export const accessibilityLiveRegionProperty = addPropertyToView<View, string>(ViewCommon, 'accessibilityLiveRegion');

export const commenFunctions = {
  'accessibilityAnnouncement': 'accessibilityAnnouncement',
};
export const iosFunctions = {
  'postAccessibilityNotification': 'postAccessibilityNotification',
};
export const androidFunctions = {
  'sendAccessibilityEvent': 'sendAccessibilityEvent',
};
export const allFunctions = Object.assign({}, commenFunctions, iosFunctions, androidFunctions);

for (const fnName of Object.keys(allFunctions)) {
  setViewFunction(ViewCommon, fnName);
}

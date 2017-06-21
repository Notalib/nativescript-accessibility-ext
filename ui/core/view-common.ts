import { Property } from 'tns-core-modules/ui/core/view';
import { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';
import { setViewFunction, addPropertyToView } from '../../utils/helpers';

// Common properties
export const accessibleProperty = addPropertyToView(ViewCommon, 'accessible', false);
export const accessibilityLabelProperty = addPropertyToView('accessibilityLabel', false);

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<string | string[] | null>(ViewCommon, 'accessibilityTraits');
export const accessibilityValueProperty = addPropertyToView<string | null>(ViewCommon, 'accessibilityValue');
export const accessibilityElementsHidden = addPropertyToView<string>(ViewCommon, 'accessibilityElementsHidden', 'no');

// Android properties
export const importantForAccessibilityProperty = addPropertyToView<boolean>(ViewCommon, 'importantForAccessibility', false);
export const accessibilityComponentTypeProperty = addPropertyToView<string>(ViewCommon, 'accessibilityComponentType');
export const accessibilityLiveRegionProperty = addPropertyToView(ViewCommon, 'accessibilityLiveRegion');

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

export { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';

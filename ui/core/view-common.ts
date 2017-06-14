import { Property } from 'tns-core-modules/ui/core/view';
import { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';
import { setViewFunction } from '../../utils/helpers';

function addPropertyToView<T>(name: string, defaultValue?: T) {
  const property = new Property<ViewCommon, T>({
    name,
    defaultValue,
  });
  property.register(ViewCommon);

  return property;
}

// Common properties
export const accessibleProperty = addPropertyToView('accessible', false);
export const accessibilityLabelProperty = addPropertyToView('accessibilityLabel', false);

// iOS properties:
export const accessibilityTraitsProperty = addPropertyToView<string | string[] | null>('accessibilityTraits');
export const accessibilityValueProperty = addPropertyToView<string | null>('accessibilityValue');
export const accessibilityElementsHidden = addPropertyToView<string>('accessibilityElementsHidden', 'no');

// Android properties
export const importantForAccessibilityProperty = addPropertyToView<boolean>('importantForAccessibility', false);
export const accessibilityComponentTypeProperty = addPropertyToView<string>('accessibilityComponentType');
export const accessibilityLiveRegionProperty = addPropertyToView('accessibilityLiveRegion');

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

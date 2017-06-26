import { setViewFunction, addPropertyToView } from '../../utils/helpers';

import { View } from 'ui/core/view';

export const commonProperties = [
  'accessible',
];
export const iosProperties = [
  'accessibilityTraits',
  'accessibilityValue',
  'accessibilityElementsHidden',
];
export const androidProperties = [
  'importantForAccessibility',
  'accessibilityComponentType',
  'accessibilityLiveRegion',
];

for (const propertyName of [
  ...commonProperties,
  ...iosProperties,
  ...androidProperties,
]) {
  addPropertyToView(View, 'View', propertyName);
}

export const commenFunctions = [
  'accessibilityAnnouncement',
];
export const iosFunctions = [
  'postAccessibilityNotification',
];
export const androidFunctions = [
  'sendAccessibilityEvent',
];

for (const fnName of [
  ...commenFunctions,
  ...iosFunctions,
  ...androidFunctions,
]) {
  setViewFunction(View, fnName);
}

export { View } from 'ui/core/view';

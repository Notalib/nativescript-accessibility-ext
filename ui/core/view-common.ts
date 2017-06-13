import { Property } from 'ui/core/dependency-observable';
import { PropertyMetadata } from 'ui/core/proxy';
import { setViewFunction } from '../../utils/helpers';

import { View } from 'ui/core/view';

function addPropertyToView(name: string, defaultValue?: any) {
  const property = new Property(name, 'View', new PropertyMetadata(defaultValue));
  (<any>View)[`${name}Property`] = property;

  Object.defineProperty(View.prototype, name, {
    get() {
      this._getValue(property);
    },
    set(value: any) {
      this._setValue(property, value);
    },
    enumerable: true,
    configurable: true
  });
}

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
  addPropertyToView(propertyName);
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

import { View, Property } from 'tns-core-modules/ui/core/view';
import { setViewFunction } from '../../utils/helpers';

function addPropertyToView(name: string, defaultValue?: any) {
  const property = new Property({
    name,
    defaultValue,
  });
  property.register(View);

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

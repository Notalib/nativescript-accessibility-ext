import {Property, PropertyMetadataSettings} from 'ui/core/dependency-observable';
import {PropertyMetadata} from 'ui/core/proxy';

import {View} from 'ui/core/view';

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

export {View} from 'ui/core/view';

import {Property, PropertyMetadataSettings} from 'ui/core/dependency-observable';
import {PropertyMetadata} from 'ui/core/proxy';

const importantForAccessibilityProperty = new Property('importantForAccessibility', 'View', new PropertyMetadata(undefined));

import {View} from 'ui/core/view';

(<any>View).importantForAccessibilityProperty = importantForAccessibilityProperty;

Object.defineProperty(View.prototype, 'importantForAccessibility', {
  get() {
    this._getValue((<any>View).importantForAccessibilityProperty);
  },
  set(value: string) {
    this._setValue((<any>View).importantForAccessibilityProperty, value);
  },
  enumerable: true,
  configurable: true
});

export {View} from 'ui/core/view';

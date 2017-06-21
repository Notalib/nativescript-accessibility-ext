import { Label } from 'tns-core-modules/ui/label/label';

import { addPropertyToView } from '../../utils/helpers';

export const commonProperties = [
];
export const iosProperties = [
  'accessibilityAdjustFontSize',
];
export const androidProperties = [
];

for (const propertyName of [
  ...commonProperties,
  ...iosProperties,
  ...androidProperties,
]) {
  addPropertyToView(Label, propertyName);
}

export { Label } from 'tns-core-modules/ui/label';

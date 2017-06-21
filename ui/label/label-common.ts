import { Label } from 'ui/label';

import { addPropertyToView } from '../../utils/helpers';

export const commonProperties = [
];
export const iosProperties = [
  'accessibilityAdjustsFontSize',
];
export const androidProperties = [
];

for (const propertyName of [
  ...commonProperties,
  ...iosProperties,
  ...androidProperties,
]) {
  addPropertyToView(Label, 'Label', propertyName);
}

export { Label } from 'ui/label';

/// <reference path="./label.d.ts" />
import { Label } from 'tns-core-modules/ui/label';
import { addBooleanCssPropertyToView } from '../../utils/helpers';
import '../core/view';

export const accessibilityAdjustsFontSizeCssProperty = addBooleanCssPropertyToView(
  Label,
  'accessibilityAdjustsFontSize',
  'a11y-adjust-font-size',
  false,
  false,
);

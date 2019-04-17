/// <reference path="./label.d.ts" />
import { Label } from 'tns-core-modules/ui/label';
import { addBooleanPropertyToView } from '../../utils/helpers';
import '../core/view';

export const accessibilityAdjustsFontSizeProperty = addBooleanPropertyToView<Label>(Label, 'accessibilityAdjustsFontSize', false);

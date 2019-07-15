/// <reference path="./label.d.ts" />

import { Label } from 'tns-core-modules/ui/label';
import '../../utils/global-events';
import { addBooleanPropertyToView } from '../../utils/helpers';
import '../core/view';

export const accessibilityAdjustsFontSizeCssProperty = addBooleanPropertyToView(Label, 'accessibilityAdjustsFontSize', false);

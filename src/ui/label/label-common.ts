import { Label } from 'tns-core-modules/ui/label';
import { addPropertyToView } from '../../utils/helpers';
import '../core/view';

export const accessibilityAdjustsFontSizeProperty = addPropertyToView<Label, boolean>(Label, 'accessibilityAdjustsFontSize');

export { Property } from 'tns-core-modules/ui/core/properties/properties';
export { Label } from 'tns-core-modules/ui/label';

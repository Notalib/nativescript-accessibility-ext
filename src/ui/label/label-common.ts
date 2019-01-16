import { Label } from 'tns-core-modules/ui/label';
import { addPropertyToView, Property } from '../../utils/helpers';
import '../core/view';

export const accessibilityAdjustsFontSizeProperty: Property<Label, boolean> = addPropertyToView<Label, boolean>(Label, 'accessibilityAdjustsFontSize');

export { Property } from 'tns-core-modules/ui/core/properties/properties';
export { Label } from 'tns-core-modules/ui/label';

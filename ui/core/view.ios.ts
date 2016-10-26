import {View} from 'ui/core/view';
import * as proxy from 'ui/core/proxy';

import * as common from './view-common';
import {setNativeValueFn} from '../../utils/helpers';


// Define the android specific properties with a noop function
for (const propertyName of ['importantForAccessibility', 'accessibilityComponentType', 'accessibilityLiveRegion']) {
  setNativeValueFn(common.View, propertyName);
}

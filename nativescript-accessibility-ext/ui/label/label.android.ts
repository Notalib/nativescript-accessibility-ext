import * as common from './label-common';

import { setNativeValueFn } from '../../utils/helpers';

// Define the ios specific properties with a noop function
for (const propertyName of common.iosProperties) {
  setNativeValueFn(common.Label, propertyName);
}

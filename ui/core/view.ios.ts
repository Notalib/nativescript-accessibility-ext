import * as common from './view-common';
import {View} from 'ui/core/view';
import * as proxy from 'ui/core/proxy';

function noop() {
}

// Define the android specific properties with a noop function
for (const propertyName of ['importantForAccessibility', 'accessibilityComponentType', 'accessibilityLiveRegion']) {
  (<proxy.PropertyMetadata>(<any>common.View)[`${propertyName}Property`].metadata).onSetNativeValue = noop;
}

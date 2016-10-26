import * as common from './view-common';
import {View} from 'ui/core/view';
import * as proxy from 'ui/core/proxy';

(<proxy.PropertyMetadata>(<any>common.View).importantForAccessibilityProperty.metadata).onSetNativeValue = function() {};

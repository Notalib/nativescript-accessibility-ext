import {PropertyChangeData} from 'ui/core/dependency-observable';
import * as proxy from 'ui/core/proxy';

function noop() {
}

export function setNativeValueFn(viewClass: any, propertyName: string, fn?: (data: PropertyChangeData) => void) {
  (<proxy.PropertyMetadata>(<any>viewClass)[`${propertyName}Property`].metadata).onSetNativeValue = fn || noop;
}

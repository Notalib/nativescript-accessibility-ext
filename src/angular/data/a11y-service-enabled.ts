import { InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import * as nsApp from 'tns-core-modules/application';
import { isAccessibilityServiceEnabled } from '../../utils/utils';

export type A11YIsServiceEnabledObservable = Observable<boolean>;
export const a11yIsServiceEnabledToken = new InjectionToken<A11YIsServiceEnabledObservable>('A11Y-IS-SERVICE-ENABLED-TOKEN');

export function a11yIsServiceEnabledFactory(): A11YIsServiceEnabledObservable {
  const fontScaling = new BehaviorSubject<boolean>(isAccessibilityServiceEnabled());

  nsApp.on(nsApp.resumeEvent, () => fontScaling.next(isAccessibilityServiceEnabled()));

  return fontScaling.pipe(distinctUntilChanged());
}

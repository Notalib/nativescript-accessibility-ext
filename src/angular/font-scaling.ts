import { InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { FontScaleObservable } from '../utils/FontScaleObservable';

export type A11YFontScalingObservable = Observable<number>;
export const a11yFontScalingToken = new InjectionToken<A11YFontScalingObservable>('A11Y-FONT-SCALING-TOKEN');

export function a11yFontScalingFactory(): A11YFontScalingObservable {
  const fontScaling = new BehaviorSubject<number>(1);

  const tnsObs = new FontScaleObservable();
  tnsObs.on(FontScaleObservable.propertyChangeEvent, () => {
    fontScaling.next(tnsObs.get(FontScaleObservable.FONT_SCALE));
  });

  fontScaling.next(tnsObs.get(FontScaleObservable.FONT_SCALE));

  return fontScaling.pipe(distinctUntilChanged());
}

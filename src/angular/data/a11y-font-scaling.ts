import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

@Injectable({ providedIn: 'root' })
export class A11yFontScalingObservable extends BehaviorSubject<number> implements OnDestroy {
  private tnsObs = new FontScaleObservable();

  constructor() {
    super(1);

    this.tnsObs.on(FontScaleObservable.propertyChangeEvent, this.updateFontScalingValue, this);
    this.updateFontScalingValue();
  }

  public ngOnDestroy() {
    this.tnsObs.off(FontScaleObservable.propertyChangeEvent, this.updateFontScalingValue, this);
    this.tnsObs = null;
  }

  private updateFontScalingValue() {
    this.next(this.tnsObs.fontScale);
  }
}

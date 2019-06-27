import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FontScaleObservable } from '../../utils/FontScaleObservable';

@Injectable()
export class A11yFontScalingObservable extends BehaviorSubject<number> implements OnDestroy {
  private tnsObs = new FontScaleObservable();

  private propertyChangeEvent: () => void;

  constructor() {
    super(1);

    this.propertyChangeEvent = () => {
      this.next(this.tnsObs.get(FontScaleObservable.FONT_SCALE));
    };

    this.tnsObs.on(FontScaleObservable.propertyChangeEvent, this.propertyChangeEvent);
  }

  public ngOnDestroy() {
    this.tnsObs.off(FontScaleObservable.propertyChangeEvent, this.propertyChangeEvent);
    this.propertyChangeEvent = null;
    this.tnsObs = null;
  }
}

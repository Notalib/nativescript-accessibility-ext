import { Injectable, OnDestroy } from '@angular/core';
import { Application } from '@nativescript/core';
import { getCurrentFontScale } from '@nativescript/core/accessibility';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class A11yFontScalingObservable extends BehaviorSubject<number> implements OnDestroy {
  constructor() {
    super(1);

    Application.on(Application.fontScaleChangedEvent, this.updateFontScalingValue, this);
    this.updateFontScalingValue();
  }

  public ngOnDestroy() {
    Application.off(Application.fontScaleChangedEvent, this.updateFontScalingValue, this);
  }

  private updateFontScalingValue() {
    const fontScale = getCurrentFontScale();
    if (typeof fontScale === 'number' && !isNaN(fontScale)) {
      this.next(fontScale);
    } else {
      this.next(1);
    }
  }
}

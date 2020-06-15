import { Injectable, OnDestroy } from '@angular/core';
import * as nsApp from '@nativescript/core/application';
import { PropertyChangeData } from '@nativescript/core/data/observable';
import { profile } from '@nativescript/core/profiling';
import { BehaviorSubject } from 'rxjs';
import { AccessibilityServiceEnabledObservable, isAccessibilityServiceEnabled } from '../../utils/utils';

@Injectable({ providedIn: 'root' })
export class A11yServiceEnabledObservable extends BehaviorSubject<boolean> implements OnDestroy {
  private tnsObs = new AccessibilityServiceEnabledObservable();

  constructor() {
    super(isAccessibilityServiceEnabled());

    nsApp.on(nsApp.resumeEvent, this.resumeEvent, this);

    this.tnsObs.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, this.tnsPropertyValueChanged, this);
  }

  public ngOnDestroy() {
    nsApp.off(nsApp.resumeEvent, this.resumeEvent, this);
    this.tnsObs.off(AccessibilityServiceEnabledObservable.propertyChangeEvent, this.tnsPropertyValueChanged, this);
    this.resumeEvent = null;
    this.tnsObs = null;
  }

  @profile
  private resumeEvent() {
    this.next(isAccessibilityServiceEnabled());
  }

  @profile
  private tnsPropertyValueChanged(evt: PropertyChangeData) {
    this.next(!!this.tnsObs.accessibilityServiceEnabled);
  }
}

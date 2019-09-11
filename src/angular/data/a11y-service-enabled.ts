import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as nsApp from 'tns-core-modules/application';
import { PropertyChangeData } from 'tns-core-modules/data/observable';
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

  private resumeEvent() {
    this.next(isAccessibilityServiceEnabled());
  }

  private tnsPropertyValueChanged(evt: PropertyChangeData) {
    this.next(!!this.tnsObs.accessibilityServiceEnabled);
  }
}

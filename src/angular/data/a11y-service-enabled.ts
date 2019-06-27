import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as nsApp from 'tns-core-modules/application';
import { isAccessibilityServiceEnabled } from '../../utils/utils';

@Injectable()
export class A11yServiceEnabledObservable extends BehaviorSubject<boolean> implements OnDestroy {
  private removeEvent: () => void;

  constructor() {
    super(isAccessibilityServiceEnabled());

    this.removeEvent = () => {
      this.next(isAccessibilityServiceEnabled());
    };

    nsApp.on(nsApp.resumeEvent, this.removeEvent);
  }

  public ngOnDestroy() {
    nsApp.off(nsApp.resumeEvent, this.removeEvent);
    this.removeEvent = null;
  }
}

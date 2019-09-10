import { Observable } from 'tns-core-modules/data/observable';

export class CommonA11YServiceEnabledObservable extends Observable {
  readonly accessibilityServiceEnabled: boolean;
}

import { Component } from '@angular/core';
import { isAccessibilityServiceEnabled } from '@nota/nativescript-accessibility-ext/utils/utils';

@Component({
  moduleId: module.id,
  selector: 'nota-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent {
  public get screenReaderEnabled() {
    return isAccessibilityServiceEnabled();
  }
}

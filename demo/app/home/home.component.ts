import { Component } from '@angular/core';
import { isAccessibilityServiceEnabled } from '@nota/nativescript-accessibility-ext/utils/utils';

@Component({
  selector: 'nota-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  moduleId: module.id,
})
export class HomeComponent {
  public get screenReaderEnabled() {
    return isAccessibilityServiceEnabled();
  }
}

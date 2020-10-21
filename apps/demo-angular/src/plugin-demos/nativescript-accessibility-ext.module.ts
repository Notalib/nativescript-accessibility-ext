import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptAccessibilityExtComponent } from './nativescript-accessibility-ext.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptAccessibilityExtComponent }])],
  declarations: [NativescriptAccessibilityExtComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptAccessibilityExtModule {}

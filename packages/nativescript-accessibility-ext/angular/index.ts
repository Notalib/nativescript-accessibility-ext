import { NgModule } from '@angular/core';
import '@nota/nativescript-accessibility-ext';
import { A11yFontScalingObservable } from './data/a11y-font-scaling';
import { A11yServiceEnabledObservable } from './data/a11y-service-enabled';
import { A11YGridLayoutDirective } from './directives/a11y-grid-layout.directive';
import { A11YFontScalePipe } from './pipes/a11y-font-scaling.pipe';
export * from '@nota/nativescript-accessibility-ext';
export { A11YFontScalePipe, A11yFontScalingObservable, A11YGridLayoutDirective, A11yServiceEnabledObservable };

@NgModule({
  providers: [A11YFontScalePipe],
  declarations: [A11YGridLayoutDirective, A11YFontScalePipe],
  exports: [A11YGridLayoutDirective, A11YFontScalePipe],
})
export class NotaAccessibilityExtModule {}

import { NgModule } from '@angular/core';
import { A11yFontScalingObservable } from './data/a11y-font-scaling';
import { A11yServiceEnabledObservable } from './data/a11y-service-enabled';
import { A11YGridLayoutDirective } from './directives/a11y-grid-layout.directive';
import { A11YFontScalePipe } from './pipes/a11y-font-scaling.pipe';
export { A11YFontScalePipe, A11yFontScalingObservable, A11YGridLayoutDirective, A11yServiceEnabledObservable };

@NgModule({
  providers: [A11YFontScalePipe],
  declarations: [A11YGridLayoutDirective, A11YFontScalePipe],
  exports: [A11YGridLayoutDirective, A11YFontScalePipe],
})
export class NotaAccessibilityExtModule {}

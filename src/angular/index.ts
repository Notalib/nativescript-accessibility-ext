import { NgModule } from '@angular/core';
import '../index';
import { A11yServiceEnabledObservable } from './data/a11y-service-enabled';
import { A11yFontScalingObservable } from './data/font-scaling';
import { A11YGridLayoutDirective } from './directives/a11y-grid-layout.directive';
import { A11YFontScalePipe } from './pipes/a11y-font-scaling.pipe';

@NgModule({
  providers: [A11yFontScalingObservable, A11yServiceEnabledObservable, A11YFontScalePipe],
  declarations: [A11YGridLayoutDirective, A11YFontScalePipe],
  exports: [A11YGridLayoutDirective, A11YFontScalePipe],
})
export class NotaAccessibilityExtModule {}

export { A11YFontScalePipe, A11yFontScalingObservable, A11yServiceEnabledObservable };

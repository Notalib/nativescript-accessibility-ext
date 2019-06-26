import { NgModule } from '@angular/core';
import '../index';
import { a11yIsServiceEnabledFactory, A11YIsServiceEnabledObservable, a11yIsServiceEnabledToken } from './data/a11y-service-enabled';
import { a11yFontScalingFactory, A11YFontScalingObservable, a11yFontScalingToken } from './data/font-scaling';
import { A11YGridLayoutDirective } from './directives/a11y-grid-layout.directive';
import { A11YFontScalePipe } from './pipes/a11y-font-scaling.pipe';

@NgModule({
  providers: [
    {
      provide: a11yFontScalingToken,
      useFactory: a11yFontScalingFactory,
    },
    {
      provide: a11yIsServiceEnabledToken,
      useFactory: a11yIsServiceEnabledFactory,
    },
    A11YFontScalePipe,
  ],
  declarations: [A11YGridLayoutDirective, A11YFontScalePipe],
  exports: [A11YGridLayoutDirective, A11YFontScalePipe],
})
export class A11YModule {}

export {
  A11YFontScalePipe,
  A11YFontScalingObservable,
  a11yFontScalingToken,
  a11yIsServiceEnabledFactory,
  a11yIsServiceEnabledToken,
  A11YIsServiceEnabledObservable,
};

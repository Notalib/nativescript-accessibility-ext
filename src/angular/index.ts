import { NgModule } from '@angular/core';
import '../index';
import { A11YGridLayoutDirective } from './directives/a11y-grid-layout.directive';
import { a11yFontScalingFactory, A11YFontScalingObservable, a11yFontScalingToken } from './font-scaling';
import { A11YFontScalePipe } from './pipes/a11y-font-scaling.pipe';

@NgModule({
  providers: [
    {
      provide: a11yFontScalingToken,
      useFactory: a11yFontScalingFactory,
    },
    A11YFontScalePipe,
  ],
  declarations: [A11YGridLayoutDirective, A11YFontScalePipe],
  exports: [A11YGridLayoutDirective, A11YFontScalePipe],
})
export class A11YModule {}

export { A11YFontScalePipe, A11YFontScalingObservable, a11yFontScalingToken };

import { Inject, Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { A11YFontScalingObservable, a11yFontScalingToken } from '../font-scaling';

@Pipe({
  name: 'a11yFontScale',
})
export class A11YFontScalePipe implements PipeTransform {
  constructor(@Inject(a11yFontScalingToken) private readonly fontScaling$: A11YFontScalingObservable) {}
  public transform(input: number | string) {
    return this.fontScaling$.pipe(map((factor) => Number(input) * factor));
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { A11yFontScalingObservable } from '../data/a11y-font-scaling';

@Pipe({ name: 'a11yFontScale' })
export class A11YFontScalePipe implements PipeTransform {
  constructor(private readonly fontScaling$: A11yFontScalingObservable) {}

  public transform(input: number | string) {
    return this.fontScaling$.pipe(map((factor) => Number(input) * factor));
  }
}

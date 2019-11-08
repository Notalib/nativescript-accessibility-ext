import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout/grid-layout';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { A11yFontScalingObservable } from '../data/a11y-font-scaling';
import { BaseService } from '../services/base.service';

@Directive({
  selector: 'GridLayout[a11yRows], GridLayout[a11yColumns]',
})
export class A11YGridLayoutDirective extends BaseService implements OnInit {
  private readonly rows$ = new BehaviorSubject<string>(null);
  @Input('a11yRows')
  public set rows(a11yRows: string) {
    this.rows$.next(`${a11yRows}`);
  }
  public get rows() {
    return this.rows$.value;
  }

  private readonly columns$ = new BehaviorSubject<string>(null);
  @Input('a11yColumns')
  public set columns(a11yColumns: string) {
    this.columns$.next(`${a11yColumns}`);
  }
  public get columns() {
    return this.columns$.value;
  }

  constructor(private readonly el: ElementRef<GridLayout>, private readonly fontScaling$: A11yFontScalingObservable) {
    super();
  }

  public ngOnInit() {
    combineLatest(this.rows$, this.fontScaling$)
      .pipe(
        map(([rows, fontScale]) => this.fixValue(rows, fontScale)),
        filter((rows) => !!rows),
        this.takeUntilDestroy(),
      )
      .subscribe((rows) => (this.el.nativeElement['rows'] = rows));

    combineLatest(this.columns$, this.fontScaling$)
      .pipe(
        map(([columns, fontScale]) => this.fixValue(columns, fontScale)),
        filter((columns) => !!columns),
        this.takeUntilDestroy(),
      )
      .subscribe((columns) => (this.el.nativeElement['columns'] = columns));
  }

  private fixValue(str: string, fontScale: number) {
    if (!str) {
      return null;
    }

    return str
      .split(',')
      .map((part) => `${part}`.trim().toLowerCase())
      .filter((part) => !!part)
      .map((part) => {
        switch (part) {
          case '*':
          case 'auto': {
            return part;
          }
          default: {
            return Number(part) * fontScale;
          }
        }
      })
      .join(', ');
  }
}

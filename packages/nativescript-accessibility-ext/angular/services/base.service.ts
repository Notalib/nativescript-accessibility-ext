import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription, timer } from 'rxjs';

@Injectable()
export class BaseService implements OnDestroy {
  protected isDeleted = false;

  public readonly destroy$ = new ReplaySubject<boolean>(1);

  public ngOnDestroy() {
    this.destroy$.next(true);
    this.isDeleted = true;

    // Deference member variables to avoid leaks
    for (const [key, value] of Object.entries(this)) {
      if (!value) {
        continue;
      }

      if (value instanceof ElementRef) {
        delete this[key];
        continue;
      }

      if (value instanceof Subscription) {
        try {
          value.unsubscribe();
        } catch {
          // ignore
        }

        delete this[key];
        continue;
      }

      if (value instanceof Observable) {
        // Remove observables. This should help clear up 'this' references on operators.
        if (key === 'destroy$') {
          continue;
        }

        delete this[key];
        continue;
      }
    }
  }

  public takeUntilDestroy<T>() {
    const destroy$ = this.destroy$;

    // This should have been a `takeUntil(this.destroy$)` but it kept emitting after destroy...
    return function (source: Observable<T>) {
      return new Observable<T>(function (subscriber) {
        const sub = source.subscribe(subscriber);

        const destroySub = destroy$.subscribe(function () {
          // tslint:disable:no-console
          // Extra check here because HMR-mode logged errors about them missing
          if (sub) {
            sub.unsubscribe();
          }

          if (subscriber) {
            subscriber.complete();
          }

          if (destroySub) {
            destroySub.unsubscribe();
          }
        });

        return () => {
          sub.unsubscribe();
          destroySub.unsubscribe();
        };
      });
    };
  }

  /**
   * Replacement for setTimeout(...), that won't trigger after the component have been destroyed.
   */
  protected timerUnlessDestroyed(cb: () => void, delay = 0) {
    return timer(delay)
      .pipe(this.takeUntilDestroy())
      .subscribe(() => {
        try {
          cb();
        } catch {
          // ignore
        }
      });
  }
}

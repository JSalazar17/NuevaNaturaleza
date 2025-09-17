// throttle.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { Observable, Subject, switchMap, of, delay } from 'rxjs';

const requestQueue = new Subject<{ req: any, next: any }>();
let processing = false;

function processQueue() {
  if (processing) return;
  processing = true;

  requestQueue.pipe(
    switchMap(({ req, next }) =>
      next(req).pipe(
        delay(500) // espera 3s antes de dejar pasar otra petición
      )
    )
  ).subscribe({
    next: () => { processing = false; processQueue(); },
    error: () => { processing = false; processQueue(); }
  });
}

export const throttleInterceptor: HttpInterceptorFn = (req, next) => {
  return new Observable(observer => {
    requestQueue.next({
      req,
      next: (r: any) => next(r).subscribe({
        next: val => observer.next(val),
        error: err => observer.error(err),
        complete: () => observer.complete()
      })
    });

    processQueue();
  });
};

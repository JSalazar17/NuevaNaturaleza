// retry.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { catchError, retryWhen, scan, mergeMap } from 'rxjs/operators';

export const rInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 0;
  const retryDelay = 20000;

  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        scan((intentos, error) => {
          if (intentos >= maxRetries || !(error instanceof HttpErrorResponse)) {
            throw error;
          }
          if (error.status === 0) {
            console.warn(`Reintento #${intentos + 1} en ${retryDelay / 1000}s...`);
            return intentos + 1;
          }
          throw error;
        }, 0),
        mergeMap(() => timer(retryDelay))
      )
    ),
    catchError((error: HttpErrorResponse) => {
      console.error('Error definitivo en petición:', error);
      return throwError(() => error);
    })
  );
};

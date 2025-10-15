// intercep.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService); // 👈 Inyectamos el servicio

  // Clonamos la request para que siempre incluya cookies
  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        console.warn('⚠️ Sesión expirada o no autorizada, cerrando sesión...');
        auth.logout(); // 👈 Llamamos al método logout
      }
      return throwError(() => err);
    })
  );
};

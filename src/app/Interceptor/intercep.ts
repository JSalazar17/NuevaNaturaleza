import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router, NavigationStart } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { ToggleService } from '../services/toggle.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toggleSvc = inject(ToggleService);

  // Observable que emite cuando empieza una navegación
  const navigationStart$ = router.events.pipe(
    filter(event => event instanceof NavigationStart)
  );

  // Clonamos la request para que incluya cookies
  const cloned = req.clone({ withCredentials: true });

  // ⏹️ Cancelamos la solicitud automáticamente al cambiar de ruta
  return next(cloned).pipe(
    takeUntil(navigationStart$),
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        console.warn('⚠️ Sesión expirada o no autorizada, cerrando sesión...');
        toggleSvc.show('Sesión expirada o no autorizada, cerrando sesión...','warning')
        auth.logout();
      }
      if (err.status >= 500) {
        toggleSvc.show('Error en el servidor, intente nuevamente...','error')
      }
      if (err.status=== 0) {
        toggleSvc.show('Error en el servidor, intente mas tarde...','error')
      }

      return throwError(() => err);
    })
  );
};

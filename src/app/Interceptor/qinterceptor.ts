// queue.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';

type QueueMode = 'FIFO' | 'LIFO';

// Cambia esto a 'FIFO' o 'LIFO' según quieras
const mode: QueueMode = 'LIFO';
const requestQueue: { req: any, next: any, observer: Subscriber<any> }[] = [];
let isProcessing = false;

function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  isProcessing = true;

  // FIFO → .shift() | LIFO → .pop()
  const item = mode === 'FIFO' ? requestQueue.shift() : requestQueue.pop();

  if (!item) {
    isProcessing = false;
    return;
  }

  const { req, next, observer } = item;

  next(req).subscribe({
    next: (val:any) => observer.next(val),
    error: (err:any) => observer.error(err),
    complete: () => {
      observer.complete();
      // espera 3s antes de procesar la siguiente
      setTimeout(() => {
        isProcessing = false;
        processQueue();
      }, 500);
    }
  });
}

export const queueInterceptor: HttpInterceptorFn = (req, next) => {
  return new Observable(observer => {
    requestQueue.push({ req, next, observer });
    processQueue();
  });
};

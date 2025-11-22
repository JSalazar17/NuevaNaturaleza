import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationData {
  timeoutId?:any;
  id: number;
  message: string;
  type: NotificationType;
  state: 'visible' | 'hiding';
}

@Injectable({ providedIn: 'root' })
export class ToggleService {
  private notifications: NotificationData[] = [];
  private subject = new BehaviorSubject<NotificationData[]>([]);
  notifications$ = this.subject.asObservable();

  show(message: string, type: NotificationType = 'info', duration = 4000) {
    const id = Date.now();
    const data: NotificationData = { id, message, type, state: 'visible' };
    this.notifications.push(data);
    this.subject.next([...this.notifications]);

    // Cierre automático con retraso
    setTimeout(() => this.hide(id), duration);
  }

  hide(id: number) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].state = 'hiding';
      this.subject.next([...this.notifications]);
      // Eliminar realmente después de la animación
    }
  }

  clearAll() {
    this.notifications = [];
    this.subject.next([]);
  }
}

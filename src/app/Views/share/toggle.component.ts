import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleService, NotificationData } from '../../services/toggle.service';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toggle-container" aria-live="polite">
      <div *ngFor="let n of notifications"
        class="notification"
        [ngClass]="[getClasses(n), n.state]"
        (animationend)="onAnimationEnd(n, $event)">

        <div *ngIf="n.type === 'loading'" class="spinner" aria-hidden="true"></div>
        <span class="message">{{ n.message }}</span>
        <button class="close-btn" (click)="close(n.id)" aria-label="Cerrar notificación">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toggle-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      pointer-events: none;
    }

    .notification {
      pointer-events: auto;
      padding: 12px 16px;
      border-radius: 10px;
      color: #fff;
      font-weight: 500;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 240px;
      overflow: hidden;
      transform-origin: right center;
      animation: fadeIn 260ms ease forwards;
    }

    .success { background: linear-gradient(90deg,#4caf50,#3da243); }
    .error   { background: linear-gradient(90deg,#ef6c63,#e04c3c); }
    .warning { background: linear-gradient(90deg,#ffb74d,#ff9f1a); color:#222; }
    .info    { background: linear-gradient(90deg,#64b5f6,#2196f3); }
    .loading { background: linear-gradient(90deg,#90a4ae,#607d8b); }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.45);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .message { flex: 1; font-size: 0.95rem; line-height: 1.2; }

    .close-btn {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      padding: 2px 6px;
      margin-left: 6px;
      border-radius: 6px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(30px) scale(0.97); max-height: 0; }
      to   { opacity: 1; transform: translateX(0) scale(1); max-height: 120px; }
    }

    @keyframes fadeOut {
      from { opacity: 1; transform: scale(1); max-height: 120px; margin: 0; padding: 12px 16px; }
      to   { opacity: 0; transform: scale(0.92); max-height: 0; margin: 0; padding: 0 0; }
    }

    .hiding {
      animation: fadeOut 380ms ease forwards;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ToggleComponent implements OnInit {
  notifications: (NotificationData & { state?: 'visible' | 'hiding'; timeoutId?: any })[] = [];

  constructor(private notify: ToggleService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.notify.notifications$.subscribe(next => {
      const currentIds = this.notifications.map(x => x.id);
      const nextIds = next.map(x => x.id);

      // Marcar como hiding las que desaparecieron del servicio
      this.notifications.forEach(n => {
        if (!nextIds.includes(n.id) && n.state !== 'hiding') {
          n.state = 'hiding';
        }
      });

      // Agregar nuevas notificaciones
      const toAdd = next
        .filter(n => !currentIds.includes(n.id))
        .map(n => ({ ...n, state: 'visible' as const }));

      // Activar temporizador de cierre automático
      toAdd.forEach(n => {
          n.timeoutId = setTimeout(() => this.close(n.id), 3500);
        
      });

      this.notifications = [...this.notifications, ...toAdd];
      this.cdr.detectChanges();
    });
  }

  getClasses(n: NotificationData): string {
    return n.type ? n.type : 'info';
  }

  close(id: number) {
    const notif = this.notifications.find(x => x.id === id);
    if (notif && notif.state !== 'hiding') {
      notif.state = 'hiding';
      if (notif.timeoutId) clearTimeout(notif.timeoutId); // cancelar temporizador si existía
      this.cdr.detectChanges();
    }
  }

  onAnimationEnd(n: any, event: AnimationEvent) {
    if (event.animationName === 'fadeOut') {
      this.notifications = this.notifications.filter(x => x.id !== n.id);
      this.notify.hide(n.id);
      this.cdr.detectChanges();
    }
  }
}

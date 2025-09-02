import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notificacion } from '../models/notificacion';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'https://localhost:44330/api/Notificacions';

  constructor(private http: HttpClient) { }

  getNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl);
  }

  getNotificacion(id: string): Observable<Notificacion> {
    return this.http.get<Notificacion>(`${this.apiUrl}/${id}`);
  }

  addNotificacion(notificacion: Notificacion): Observable<Notificacion> {
    return this.http.post<Notificacion>(this.apiUrl, notificacion);
  }

  updateNotificacion(id: string, notificacion: Notificacion): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}`, notificacion);
  }

  deleteNotificacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

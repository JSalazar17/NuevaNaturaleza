import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { Notificacion } from '../models/notificacion';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  
  private hubConnection!: signalR.HubConnection;
  private apiUrl = environment+'/api/Notificacions';

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

  marcarComoLeida(id: string): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}`, { leido: true });
  }  
  public iniciarConexion(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment}/hubs/notificaciones`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('Conectado a SignalR'))
      .catch(err => console.log('Error al conectar:', err));

  }
  public hubNotifications():signalR.HubConnection{
    return this.hubConnection;
  }
  //envie toda la notificacion 
}

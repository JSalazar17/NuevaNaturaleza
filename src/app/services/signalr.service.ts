import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  // Observable global para eventos
  private eventoGeneral = new BehaviorSubject<any>(null);
  public eventoGeneral$ = this.eventoGeneral.asObservable();

  constructor() {
     this.iniciarConexion()
    }

  iniciarConexion(): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment}/hubs/generalr`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() =>{
        console.log('Conectado al servidor SignalR')})
      .catch(err => console.error('Error al conectar con SignalR:', err));

    // Escucha los mensajes del backend
    this.hubConnection.on('ReceiveUpdate', (data) => {
      console.log('Evento recibido desde SignalR:', data);
      this.eventoGeneral.next(data);
    });
  }

  detenerConexion(): void {
    this.hubConnection?.stop();
  }
}

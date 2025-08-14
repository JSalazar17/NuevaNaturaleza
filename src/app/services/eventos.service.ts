import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Evento } from '../models/eventos.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'https://localhost:44330/api/Eventoes'; // tu URL real

  constructor(private http: HttpClient) {}

  obtenerEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  agregarEvento(evento: Evento): Observable<any> {
    return this.http.post(this.apiUrl, evento);
  }

  modificarEvento(IdEvento: string, evento: Evento): Observable<any> {
    return this.http.put(`${this.apiUrl}/${evento.IdEvento}`, evento);
  }

  eliminarEvento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

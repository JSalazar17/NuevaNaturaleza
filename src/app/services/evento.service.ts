import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class EventoService {
  // Verifica si tu API es plural. Si usas singular, deja 'Evento'
  private apiUrl = environment+'/api/Eventoes';

  constructor(private http: HttpClient) {}

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  getEventoPorId(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  createEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  updateEvento(id: string, evento: Evento): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, evento);
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

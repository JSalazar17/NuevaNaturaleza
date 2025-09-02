import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actuador } from '../models/actuador.model';

@Injectable({
  providedIn: 'root'
})
export class ActuadorService {
  private apiUrl = 'https://localhost:44330/api/Actuador'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los actuadores
  getActuadores(): Observable<Actuador[]> {
    return this.http.get<Actuador[]>(this.apiUrl);
  }

  // Obtener un actuador por ID
  getActuador(id: string): Observable<Actuador> {
    return this.http.get<Actuador>(`${this.apiUrl}/${id}`);
  }

  // Crear un actuador
  addActuador(actuador: Actuador): Observable<Actuador> {
    return this.http.post<Actuador>(this.apiUrl, actuador);
  }

  // Actualizar un actuador
  updateActuador(id: string, actuador: Actuador): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, actuador);
  }

  // Eliminar un actuador
  deleteActuador(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

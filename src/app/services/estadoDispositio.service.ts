import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoDispositivo } from '../models/estadoDispositivo.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadoDispositivoService {
  private apiUrl = environment+'/api/EstadoDispositivoes'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los EstadoDispositivoes
  getEstadoDispositivoes(): Observable<EstadoDispositivo[]> {
    return this.http.get<EstadoDispositivo[]>(this.apiUrl);
  }

  // Obtener un EstadoDispositivo por ID
  getEstadoDispositivo(id: string): Observable<EstadoDispositivo> {
    return this.http.get<EstadoDispositivo>(`${this.apiUrl}/${id}`);
  }

  // Crear un EstadoDispositivo
  addEstadoDispositivo(EstadoDispositivo: EstadoDispositivo): Observable<EstadoDispositivo> {
    return this.http.post<EstadoDispositivo>(this.apiUrl, EstadoDispositivo);
  }

  // Actualizar un EstadoDispositivo
  updateEstadoDispositivo(id: string, EstadoDispositivo: EstadoDispositivo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, EstadoDispositivo);
  }

  // Eliminar un EstadoDispositivo
  deleteEstadoDispositivo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

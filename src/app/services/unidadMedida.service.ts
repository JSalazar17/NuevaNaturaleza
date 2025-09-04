import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { UnidadMedida } from '../models/unidadMedida.model';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {
  private apiUrl = environment+'/api/UnidadMedida'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los UnidadMedidaes
  getUnidadMedidaes(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(this.apiUrl);
  }

  // Obtener un UnidadMedida por ID
  getUnidadMedida(id: string): Observable<UnidadMedida> {
    return this.http.get<UnidadMedida>(`${this.apiUrl}/${id}`);
  }

  // Crear un UnidadMedida
  addUnidadMedida(UnidadMedida: UnidadMedida): Observable<UnidadMedida> {
    return this.http.post<UnidadMedida>(this.apiUrl, UnidadMedida);
  }

  // Actualizar un UnidadMedida
  updateUnidadMedida(id: string, UnidadMedida: UnidadMedida): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, UnidadMedida);
  }

  // Eliminar un UnidadMedida
  deleteUnidadMedida(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

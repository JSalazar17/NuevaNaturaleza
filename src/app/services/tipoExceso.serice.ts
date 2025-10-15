import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoExceso } from '../models/tipoExceso.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoExcesoService {
  private apiUrl = environment+'/api/TipoExceso'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los TipoExcesoes
  getTipoExcesoes(): Observable<TipoExceso[]> {
    return this.http.get<TipoExceso[]>(this.apiUrl);
  }

  // Obtener un TipoExceso por ID
  getTipoExceso(id: string): Observable<TipoExceso> {
    return this.http.get<TipoExceso>(`${this.apiUrl}/${id}`);
  }

  // Crear un TipoExceso
  addTipoExceso(TipoExceso: TipoExceso): Observable<TipoExceso> {
    return this.http.post<TipoExceso>(this.apiUrl, TipoExceso);
  }

  // Actualizar un TipoExceso
  updateTipoExceso(id: string, TipoExceso: TipoExceso): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, TipoExceso);
  }

  // Eliminar un TipoExceso
  deleteTipoExceso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

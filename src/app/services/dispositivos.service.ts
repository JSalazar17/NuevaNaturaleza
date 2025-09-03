import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dispositivo } from '../models/dispositivo.model';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class DispositivoService {
  // Ajusta si tu API usa otro plural/ruta
  private url = environment+'/api/Dispositivoes';

  constructor(private http: HttpClient) {}

  // Lista de dispositivos (para pre-cargar y resolver nombres en la tabla)
  getDispositivos(): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(this.url);
  }

  // Útil si quieres cargar el detalle de un dispositivo por ID al seleccionar la fila
  getDispositivoPorId(id: string): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${this.url}/${id}`);
  }

  createDispositivo(dispositivo: Dispositivo): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(this.url, dispositivo);
  }

  updateDispositivo(dispositivo: Dispositivo): Observable<void> {
    return this.http.put<void>(`${this.url}/${dispositivo.idDispositivo}`, dispositivo);
  }

  deleteDispositivo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dispositivo } from '../models/dispositivo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DispositivoService {
  private url = 'https://localhost:44330/api/Dispositivoes';

  constructor(private http: HttpClient) {}

  obtenerDispositivos(): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(this.url);
  }

  guardarDispositivo(dispositivo: Dispositivo): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(this.url, dispositivo);
  }

  actualizarDispositivo(dispositivo: Dispositivo): Observable<any> {
    return this.http.put(`${this.url}/${dispositivo.idDispositivo}`, dispositivo);
  }

  eliminarDispositivo(id: string): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}

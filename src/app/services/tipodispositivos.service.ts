import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TipoDispositivo } from '../models/tipodispositivo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoDispositivoService {
  private url = 'https://localhost:44330/api/TipoDispositivoes';

  constructor(private http: HttpClient) {}

  obtenerTiposDispositivo(): Observable<TipoDispositivo[]> {
    return this.http.get<TipoDispositivo[]>(this.url);
  }
}

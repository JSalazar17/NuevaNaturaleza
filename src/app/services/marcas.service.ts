import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Marca } from '../models/marca.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private url = 'https://localhost:44330/api/Marcas';

  constructor(private http: HttpClient) {}

  obtenerMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.url);
  }
}

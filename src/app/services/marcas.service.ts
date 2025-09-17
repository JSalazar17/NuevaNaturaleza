import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Marca } from '../models/marca.model';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private url = environment+'/api/Marcas';

  constructor(private http: HttpClient) {}

  obtenerMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.url);
  }
  obtenerMarcasById(id:string): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.url}/${id}`);
  }
}

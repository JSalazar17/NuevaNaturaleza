import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Sugerencia } from "../models/sugerencia.model";
import { Observable } from "rxjs";
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class SugerenciasService {
  private url = environment+'/api/Sugerencias';

  constructor(private http: HttpClient) {}

  agregarSugerencia(sugerencia: Sugerencia): Observable<Sugerencia> {
    return this.http.post<Sugerencia>(this.url, sugerencia);
  }

  obtenerSugerencias(): Observable<Sugerencia[]> {
    return this.http.get<Sugerencia[]>(this.url);
  }

  deleteSugerencias(id: string): Observable<any> {
    return this.http.delete<Sugerencia[]>(this.url);
  }
}

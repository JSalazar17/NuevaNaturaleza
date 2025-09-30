import { Injectable } from "@angular/core";
import { Sugerencia } from "../models/sugerencia.model";
import { Observable } from "rxjs";
import { environment } from '../environment/environment';
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class SugerenciasService {
  private apiUrl = environment+'api/sugerencias';

  constructor(private http: HttpClient) {}

  agregarSugerencia(sugerencia: Sugerencia): Observable<Sugerencia> {
    return this.http.post<Sugerencia>(this.apiUrl, sugerencia);
  }

  obtenerSugerencias(): Observable<Sugerencia[]> {
    return this.http.get<Sugerencia[]>(this.apiUrl);
  }
  

}

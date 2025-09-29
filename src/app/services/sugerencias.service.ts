import { Injectable } from "@angular/core";
import { HttpClient } from "@microsoft/signalr";
import { Sugerencia } from "../models/sugerencia.model";
import { Observable } from "rxjs";
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class SugerenciasService {
  private apiUrl = 'http://localhost:5000/api/sugerencias';

  constructor(private http: HttpClient) {}

  agregarSugerencia(sugerencia: Sugerencia): Observable<Sugerencia> {
    return this.http.post<Sugerencia>(this.apiUrl, sugerencia);
  }

  obtenerSugerencias(): Observable<Sugerencia[]> {
    return this.http.get<Sugerencia[]>(this.apiUrl);
  }
}

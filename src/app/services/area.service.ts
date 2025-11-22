import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Area } from '../models/area.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private apiUrl = environment+'/api/Area'; 

  constructor(private http: HttpClient) {}

  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.apiUrl);
  }

  getAreaPorId(id: string): Observable<Area> {
    return this.http.get<Area>(`${this.apiUrl}/${id}`);
  }
  
}

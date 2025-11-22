import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { environment } from "../environment/environment";

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  private url = `${environment}/api/Checklist`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(this.url);
  }

  getById(id: string): Observable<Checklist> {
    return this.http.get<Checklist>(`${this.url}/${id}`);
  }

  getChecklistsPorFechas(desde: string, hasta: string) {
  return this.http.get<any[]>(`${this.url}/filtrar?desde=${desde}&hasta=${hasta}`);
}


  create(checklist: Checklist): Observable<Checklist> {
    return this.http.post<Checklist>(this.url, checklist);
  }

  update(id: string, checklist: Checklist): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, checklist);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

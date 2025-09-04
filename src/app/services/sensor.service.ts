import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Sensor } from '../models/sensor.model';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private apiUrl = environment+'/api/Sensor'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los Sensores
  getSensores(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(this.apiUrl);
  }

  // Obtener un Sensor por ID
  getSensor(id: string): Observable<Sensor> {
    return this.http.get<Sensor>(`${this.apiUrl}/${id}`);
  }

  // Crear un Sensor
  addSensor(Sensor: Sensor): Observable<Sensor> {
    return this.http.post<Sensor>(this.apiUrl, Sensor);
  }

  // Actualizar un Sensor
  updateSensor(id: string, Sensor: Sensor): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, Sensor);
  }

  // Eliminar un Sensor
  deleteSensor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

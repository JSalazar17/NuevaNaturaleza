import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SugerenciasService } from '../../services/sugerencias.service';
import { Sugerencia } from '../../models/sugerencia.model';

@Component({
  selector: 'app-sugerencias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sugerencias.html',
  styleUrls: ['./sugerencias.css']
})
export class SugerenciasComponent implements OnInit {
  sugerencias: Sugerencia[] = [];
  cargando: boolean = true;

  constructor(private sugerenciasService: SugerenciasService) {}

  ngOnInit(): void {
    this.obtenerSugerencias();
  }

  obtenerSugerencias(): void {
    this.cargando = true;
    this.sugerenciasService.obtenerSugerencias().subscribe({
      next: (data) => {
        this.sugerencias = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  deleteSugerencia(id: string | undefined): void {
    if (!id) return;
    if (confirm('¿Seguro que quieres eliminar esta sugerencia?')) {
      // como en service no hay delete, lo implementamos aquí rápido
      // en el backend deberías tener DELETE /api/Sugerencias/{id}
      this.sugerenciasService['http']
        .delete(`${this.sugerenciasService['url']}/${id}`)
        .subscribe(() => this.obtenerSugerencias());
    }
  }
}

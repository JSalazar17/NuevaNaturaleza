import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SugerenciasService } from '../../services/sugerencias.service';
import { Sugerencia } from '../../models/sugerencia.model';

@Component({
  selector: 'app-sugerencias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sugerencias.html',
  styleUrls: ['./sugerencias.css']
})
export class SugerenciasComponent implements OnInit, OnDestroy {
  sugerencias: Sugerencia[] = [];
  cargando: boolean = true;
  private intervaloActualizacion: any;

  constructor(private sugerenciasService: SugerenciasService) {}

  ngOnInit(): void {
    this.obtenerSugerencias();

    // 🔄 Actualiza automáticamente la lista cada 10 segundos
    this.intervaloActualizacion = setInterval(() => {
      this.obtenerSugerencias();
    }, 10000);
  }

  ngOnDestroy(): void {
    // ✅ Limpia el intervalo al salir de la vista
    if (this.intervaloActualizacion) {
      clearInterval(this.intervaloActualizacion);
    }
  }

  obtenerSugerencias(): void {
    this.cargando = true;
    this.sugerenciasService.obtenerSugerencias().subscribe({
      next: (data) => {
        this.sugerencias = data ?? [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar sugerencias:', err);
        this.cargando = false;
      }
    });
  }

  eliminarSugerencia(id: string | undefined): void {
    if (!id) return;
    if (confirm('¿Seguro que quieres eliminar esta sugerencia?')) {
      this.sugerenciasService.eliminarSugerencia(id).subscribe({
        next: () => this.obtenerSugerencias(),
        error: (err) => console.error('Error al eliminar sugerencia:', err)
      });
    }
  }
}

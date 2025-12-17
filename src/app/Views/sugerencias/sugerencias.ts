import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SugerenciasService } from '../../services/sugerencias.service';
import { Sugerencia } from '../../models/sugerencia.model';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToggleService } from '../../services/toggle.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';

@Component({
  selector: 'app-sugerencias',
  standalone: true,
  imports: [CommonModule, FormsModule,NgxPaginationModule],
  templateUrl: './sugerencias.html',
  styleUrls: ['./sugerencias.css']
})
export class SugerenciasComponent implements OnInit, OnDestroy {
  sugerencias: Sugerencia[] = [];
  sugerenciasFiltradas: Sugerencia[] = [];
  terminoBusqueda: string = "";
    private sugerenciasSubject = new BehaviorSubject<Sugerencia[]>([]);
    sugerencias$: Observable<Sugerencia[]> = this.sugerenciasSubject.asObservable();
  paginaActual: number = 1;
  private intervaloActualizacion: any;

  constructor(
    private sugerenciasService: SugerenciasService,
    private dialog: MatDialog,
    private toggleSvc:ToggleService) {}

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
    this.sugerenciasService.obtenerSugerencias().subscribe({
      next: (data) => {
        this.sugerencias = data;
        this.sugerenciasSubject.next(data);
        this.sugerenciasFiltradas = [...data];
      },
      error: (err) => {
        console.error('Error al cargar sugerencias:', err);
      }
    });
  }

  aplicarFiltros() {
    const t = this.terminoBusqueda.toLowerCase();

    this.sugerenciasFiltradas = this.sugerencias.filter(s =>
      (s.usuario?.toLowerCase().includes(t)) ||
      (s.mensaje?.toLowerCase().includes(t)) ||
      (s.fecha && new Date(s.fecha).toLocaleDateString().includes(t))
    );
  }

  eliminarSugerencia(id: string | undefined): void {
    if (!id){ 
      return;}

      
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '800px',
            data: { message: '¿Desea borrar esta sugerencia?' }
          });
     dialogRef.afterClosed().subscribe(result => {
      if (result) { 
      this.sugerenciasService.eliminarSugerencia(id).subscribe({
        next: () => {
          this.toggleSvc.show('Sugerencia eliminada', 'info')
          this.obtenerSugerencias()
        },
        error: (err) => {
          console.error('Error al eliminar sugerencia:', err)}
      });
    }})
  }
}

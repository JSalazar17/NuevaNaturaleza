import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Auditoria } from '../../models/auditoria.model';
import { Usuario } from '../../models/usuario.model';
import { AuditoriaService } from '../../services/auditoria.service';
import { UsuarioService } from '../../services/usuario.service';
import { AccionService } from '../../services/accion.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dispositivo } from '../../models/dispositivo.model';
import { Accion } from '../../models/accion.model';
import { MatButtonModule } from '@angular/material/button';
import { pdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.html',
  imports: [CommonModule, DatePipe, FormsModule,
    MatButtonModule],
  styleUrls: ['./auditoria.css']
})
export class AuditoriaComponent implements OnInit {

  private auditoriasSubject = new BehaviorSubject<Auditoria[]>([]);
  auditorias$: Observable<Auditoria[]> = this.auditoriasSubject.asObservable();
  private usuarioSubject = new BehaviorSubject<Usuario[]>([]);
  usuarios$: Observable<Usuario[]> = this.usuarioSubject.asObservable();
  private dispositivoSubject = new BehaviorSubject<Dispositivo[]>([]);
  dispositivos$: Observable<Dispositivo[]> = this.dispositivoSubject.asObservable();
  private accionSubject = new BehaviorSubject<Accion[]>([]);
  acciones$: Observable<Accion[]> = this.accionSubject.asObservable();

  auditoriaSeleccionada?: Auditoria;
  usuarioInfo: any;
  mostrarModal = false;

  private pdfMake: any;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private pdfSvc: pdfService,
    private auditoriaService: AuditoriaService,
    private usuarioService: UsuarioService,
    private dispositivoService: DispositivoService,
    private accionService: AccionService,
  ) {

    if (isPlatformBrowser(this.platformId)) {
      // Import dinámico solo en navegador
      import('pdfmake/build/pdfmake').then(pdfMakeModule => {
        import('pdfmake/build/vfs_fonts').then(pdfFontsModule => {
          this.pdfMake = pdfMakeModule.default;

          // 👇 detectar dónde viene el vfs
          const vfs = (pdfFontsModule as any).pdfMake?.vfs || (pdfFontsModule as any).default?.pdfMake?.vfs;

          if (vfs) {
            this.pdfMake.vfs = vfs;
          }
        });
      });
    }

  }

  ngOnInit(): void {
    
  if (isPlatformBrowser(this.platformId)) {
    this.cargarAuditorias();}
  }

  cargarAuditorias(): void {
    this.auditoriaService.getAuditorias().subscribe((data: Auditoria[]) => {
      this.auditoriasSubject.next(data); console.log(data)

      this.cargarAcciones();
      this.cargarUsuarios();
      this.cargarDispositivos();
    });
  }

  cargarUsuarios(): void {
    const auditorias = this.auditoriasSubject.getValue();
    auditorias.forEach(a => {
      a.usuarioNombre = a.idUsuarioNavigation?.nombre ?? 'Desconocido';
    });
    this.auditoriasSubject.next([...auditorias]); // refresca la tabla
  }

  cargarDispositivos(): void {

    const auditorias = this.auditoriasSubject.getValue();
    auditorias.forEach(a => {
      a.dispositivoNombre = a.idDispositivoNavigation?.nombre ?? 'Sin dispositivo';
    });
    this.auditoriasSubject.next([...auditorias]);

  }

  cargarAcciones(): void {

    const auditorias = this.auditoriasSubject.getValue();
    auditorias.forEach(a => {
      a.accionNombre = a.IdAccionNavigation?.accion ?? 'N/A';
    });
    this.auditoriasSubject.next([...auditorias]);

  }

  seleccionarAuditoria(auditoria: Auditoria): void {
    this.auditoriaSeleccionada = auditoria;

    console.log(auditoria.idUsuarioNavigation)
    this.usuarioInfo = auditoria.idUsuarioNavigation;
    this.usuarioInfo.idRolNavigation = auditoria.idUsuarioNavigation?.idRolNavigation;
    this.mostrarModal = true;
    console.log(this.usuarioInfo)

  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  async generarpdfauditoria() {
    this.pdfSvc.generatePdfAuditorias(this.auditoriasSubject.value)
  }
}

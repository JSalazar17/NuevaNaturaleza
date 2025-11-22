import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Signal, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DispositivoService } from '../../services/dispositivos.service';
import { Dispositivo } from '../../models/dispositivo.model';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { MatDialog } from '@angular/material/dialog';
import { AgregarDispositivo } from '../agregar-dispositivo/agregar-dispositivo';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatSelectModule } from '@angular/material/select';
import { TipoDispositivoService } from '../../services/tipodispositivos.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { Area } from '../../models/area.model';
import { AreaService } from '../../services/area.service';
import { AuthService } from '../../services/auth.service';
import { ToggleService } from '../../services/toggle.service';
import { SistemaService } from '../../services/sistemas.service';
import { EstadoDispositivoService } from '../../services/estadoDispositio.service';
import { TipoMUnidadMService } from '../../services/tipoMUnidadM.service';
import { AccionService } from '../../services/accion.service';
import { MarcaService } from '../../services/marcas.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoDispositivo } from '../../models/estadoDispositivo.model';
import { Sistema } from '../../models/sistema.model';
import { Accion } from '../../models/accion.model';
import { TipoMUnidadM } from '../../models/tipoMUnidadM.model';
import { Marca } from '../../models/marca.model';
@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule,
    NgxPaginationModule, MatSelectModule, MatFormFieldModule,
    MatMenuModule, CommonModule,
    FormsModule
    , MatSelectModule, MatMenuModule,
    MatFormFieldModule
    ,
  ],
  templateUrl: './gestion-dispositivos.html',
  styleUrls: ['./gestion-dispositivos.css']
})
export class GestionDispositivos implements OnInit, OnDestroy {
  TipoArea = "Todos";
  dispositivos = signal<Dispositivo[]>([]);
  dispositivosFiltrados = signal<Dispositivo[]>([]);
  terminoBusqueda: string = '';
  tipoSeleccionado: string = 'Todos';
  dispositivoSeleccionado: Dispositivo | null = null;
  mostrarModal: boolean = false;
  private intervaloActualizacion: any;
  cargando: boolean = false;
  paginaActual: number = 1;
  rol: string;
  isAdmin = signal<boolean>(false);

  constructor(
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private router: Router,
    private tipoDS: TipoDispositivoService,
    private areaSvc: AreaService,
    private authService: AuthService,
    private togleSvc: ToggleService,

      private sistemaSvc :SistemaService,
  private estadoSvc :EstadoDispositivoService,
  private tipoMsvc :TipoMUnidadMService,
  private accionSvc :AccionService,
  private marcaSvc :MarcaService
  ) {

    const usuarioGuardado = this.authService.getFullUser();
    console.log("this.authService.getUserRole()")
    console.log(this.authService.getUserRole())
    this.rol = this.authService.getUserRole()
    this.isAdmin.set(this.rol?.toString() === "Administrador")
    console.log(this.isAdmin())
  }

  marcasList: Marca[];
  sistemas :Sistema[];
  estados :EstadoDispositivo[];
  Areas = signal<Area[]>([]);
  deviceTypes = signal<TipoDispositivo[]>([]);

  tipos$!: Observable<TipoDispositivo[]>;
  tipoMUnidades$!: Observable<TipoMUnidadM[]>
  
  acciones$!: Observable<Accion[]>;

  
  sistemaSubject = new BehaviorSubject<Sistema[]>([])
  estadosSubject = new BehaviorSubject<EstadoDispositivo[]>([])
  ngOnInit(): void {
    
      this.tipos$ = this.tipoDS.obtenerTiposDispositivo();
     
      this.tipos$.subscribe(x => {
      this.deviceTypes.set(x)
    })


  this.tipoMUnidades$ = this.tipoMsvc.getTipoMUnidadMs();
  this.acciones$ = this.accionSvc.getAcciones();



  this.sistemaSvc.obtenerSistemas().subscribe(xs => { this.sistemaSubject.next(xs) });

    this.areaSvc.getAreas().subscribe(x => {
      this.Areas.set(x)
    })


    setTimeout(() => {
  this.estadoSvc.getEstadoDispositivoes().subscribe(xs => { this.estadosSubject.next(xs) });


    this.sistemaSvc.obtenerSistemas().subscribe(xs => { this.sistemas=(xs) });
      
    this.estadoSvc.getEstadoDispositivoes().subscribe(xs => { this.estados=(xs) });
    // cache de tipoMUnidades para filtrados
    this.marcaSvc.obtenerMarcas().subscribe(ms => {
      this.cargarDispositivos();
      this.marcasList = ms;
    })

    }, 1000);

    //  Refresca automáticamente cada 10 segundos
    this.intervaloActualizacion = setInterval(() => {
      this.cargarDispositivos();
    }, 200000);
  }

  ngOnDestroy(): void {
    // ✅ Limpia el intervalo al salir de la vista
    if (this.intervaloActualizacion) {
      clearInterval(this.intervaloActualizacion);
    }
  }

  cargarDispositivos() {
    this.cargando = true;
    this.dispositivoService.getDispositivos().subscribe({
      next: (data) => {

        this.dispositivos.set(data);
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar dispositivos:', err);
        this.cargando = false;
      }
    });
  }

  irAHorarios() {
    this.router.navigate(['/programacion-dosificador']);
  }

  aplicarFiltros() {
    console.log("aplicarfiltros")
    console.log(this.tipoSeleccionado)
    let filtrados = [...this.dispositivos()];

    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(d =>
        d.nombre.toLowerCase().includes(termino) ||
        d.idSistemaNavigation?.nombre.toLowerCase().includes(termino) ||
        d.idEstadoDispositivoNavigation?.nombre?.toLowerCase().includes(termino)
      );
    }

    if (this.tipoSeleccionado !== 'Todos') {
      filtrados = filtrados.filter(d =>
        d.idTipoDispositivoNavigation?.idTipoDispositivo === this.tipoSeleccionado &&

        (d.idArea === this.TipoArea || this.TipoArea === "Todos")
      );
    }

    this.dispositivosFiltrados.set(filtrados);
  }

  seleccionarDispositivo(dispositivo: Dispositivo) {
    this.dispositivoSeleccionado = dispositivo;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.dispositivoSeleccionado = null;
  }

  agregarDispositivo() {
    const dialogRef = this.dialog.open(AgregarDispositivo, {
      width: '800px',
      data: { dispositivo: null,

  estadosSubject:this.estadosSubject,
  sistemaSubject:this.sistemaSubject,
  acciones$:this.acciones$,
  tipoMUnidades$:this.tipoMUnidades$,
  deviceTypes :this.tipos$
       }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarDispositivos()
      };
    });
  }

  editarDispositivo(dispositivo: Dispositivo) {
    const dialogRef = this.dialog.open(AgregarDispositivo, {
      width: '800px',
      data: { dispositivo,
   /*     
  allTipoMUnidades : this.allTipoMUnidades,
  acciones:this.acciones,
  marcasList:this.marcasList,
  areas:this.Areas(),*/
  estadosSubject:this.estadosSubject,
  sistemaSubject:this.sistemaSubject,
  acciones$:this.acciones$,
  tipoMUnidades$:this.tipoMUnidades$,
  deviceTypes :this.tipos$
       }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarDispositivos();
    });
  }

  eliminarDispositivo(d: Dispositivo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '800px',
      data: { message: 'Se borrará este dispositivo y sus datos relacionados' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dispositivoService.deleteDispositivo(d.idDispositivo as string)
          .subscribe({
            next: () => {
              this.cargarDispositivos()

              this.togleSvc.show('Dispositivo eliminado satisfactoriamente', 'success')
            },
            error: (err) => {
              console.error('Error al eliminar dispositivo:', err)
            }
          });
      }
    });
  }
}

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, signal, computed, PLATFORM_ID, HostListener, QueryList, OnInit, OnDestroy, effect } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Dispositivo } from '../../models/dispositivo.model';
import { DispositivoService } from '../../services/dispositivos.service';
import { TipoDispositivoService } from '../../services/tipodispositivos.service';
import { TipoMUnidadMService } from '../../services/tipoMUnidadM.service';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { TipoMedicion } from '../../models/tipomedicion.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AgregarDispositivo } from '../agregar-dispositivo/agregar-dispositivo';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { FiltersPanelComponent } from '../gestion-dispositivos/filtercomponent/filters-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Actuador } from '../../models/actuador.model';
import { AccionService } from '../../services/accion.service';
import { Accion } from '../../models/accion.model';
import { ActuadorService } from '../../services/actuador.service';
import { DialogSelectTipoComponent } from '../CambiarEstadoDialog/confirmDialog';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { ToggleService } from '../../services/toggle.service';
import { Response } from '../../models/response.model';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-actuadores',
  standalone: true,
  templateUrl: './actuadores.html',
  imports: [CommonModule,
    FormsModule, ReactiveFormsModule, MatSidenavModule,
    MatIconModule, MatSelectModule, MatMenuModule, MatSlideToggleModule,NgxPaginationModule],
  styleUrls: ['./actuadores.css']
})
export class ActuadoresComponent implements OnInit, OnDestroy {
  private dispositivosSubject = new BehaviorSubject<Dispositivo[]>([]);
  dispositivo$ = this.dispositivosSubject.asObservable();

  dispositivos = signal<Dispositivo[]>([]);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  deviceTypes: TipoDispositivo[] = [];
  measurementTypes: TipoMedicion[] = [];

  selectedDeviceType = signal<string>('');
  selectedMeasurementType = signal<string>('');
  isDescending = signal<boolean>(false);
  
  paginaActual: number = 1;

  tipoAcciones = signal<Accion[]>([]);


  dispositivosFiltrados = computed(() => {
    let dispositivos = [...this.dispositivos()];
    // 🔹 SOLO actuadores
    dispositivos = dispositivos.filter(d => d.idTipoDispositivoNavigation?.nombre === 'Actuador');

    const tipo = this.selectedDeviceType();
    const tipoMedicion = this.selectedMeasurementType();
    //const descendente = this.isDescending();

    if (tipo && tipo !== 'Todos') {
      dispositivos = dispositivos.filter(d => d.idTipoDispositivo === tipo);
    }

    if (tipoMedicion && tipoMedicion !== 'Todos') {
      dispositivos = dispositivos.filter(d =>
        d.sensors?.some(s =>
          s.idTipoMUnidadMNavigation?.idTipoMedicion === tipoMedicion
        )
      );
    }

    dispositivos.sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''));
    // if (descendente) dispositivos.reverse();

    return dispositivos;
  });

  private sub!: Subscription;
  rol: string;
  isAdmin = signal<boolean>(false);
  constructor(
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private tipoDS: TipoDispositivoService,
    private tipMUMS: TipoMUnidadMService,
    private accSrv: AccionService,
    private actSrv: ActuadorService,
    private matd: MatDialog,
    private signalRService: SignalRService,
    private authService: AuthService,
    private togleSvc: ToggleService
  ) {


    const usuarioGuardado = this.authService.getFullUser();
    console.log("this.authService.getUserRole()")
    console.log(this.authService.getUserRole())
    this.rol = this.authService.getUserRole()
    this.isAdmin.set(this.rol?.toString() === "Administrador")
    console.log(this.isAdmin())
    this.signalRService = inject(SignalRService)
    this.cargarTodo();
  }
  intento = 0;
  whileConected() {
    if (this.intento === 3) {

      if (this.signalRService)
        this.signalRService.iniciarConexion();
      else { this.signalRService = inject(SignalRService) }
    }
    setTimeout(() => {

      if (this.signalRService) {
        console.log('✅ SignalR listo, suscribiendo a eventos');
        this.sub = this.signalRService.eventoGeneral$.subscribe(data => {
          if (data) console.log('📢 Evento recibido en actuadores:', data);
          this.signalRLogic(data)
        });
      } else {
        console.error('❌ SignalRService no está disponible');
        this.whileConected()
        this.intento++;
      }
    }, 1000);
  }

  ngOnInit() {

    this.whileConected()
    console.log('SignalRService inyectado:', this.signalRService);



    if (!this.signalRService) {
      console.error('❌ SignalRService no está disponible');
      return;
    }



  }

  signalRLogic(data: any) {
    if (!data) return;
    console.log(data)
    // Identifica el tipo de evento recibido
    if (data.tipo === 'actuador') {
      this.dispositivos.set([...this.dispositivos().map(x => {
        if (x.actuadores && x.actuadores[0]) {
          let turste = false
          for (let audi of data.payload) {

            let act = x.actuadores[0]
            if (x.idDispositivo === audi.idDispositivo) {
              if (act.idAccionAct != audi.idAccion)
              turste = true
              act.idAccionAct = audi.idAccion
              console.log("actualizacion por signalr")
              console.log(audi)
              console.log(x)
            }
          }
            if (turste)
              this.togleSvc.show('Actuadores actualizados dinamicamente','loading')

        }
        return x;
      })])
    }
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  cargarTodo() {
    this.cargarDispositivos();
    this.tipoDS.obtenerTiposDispositivo().subscribe(data => this.deviceTypes = data);
    this.tipMUMS.getTipoMUnidadMs().subscribe(data => {
      data.forEach(i => {
        if (!this.measurementTypes.includes(i.idTipoMedicionNavigation)) {
          this.measurementTypes.push(i.idTipoMedicionNavigation);
        }
      });
    });
    this.cargarAccion()
  }
  cargarAccion() {

    this.accSrv.getAcciones().subscribe(data => {
      this.tipoAcciones.set(data)
    })
  }

  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.dispositivos.set(data);
      this.dispositivosSubject.next(data);
    });

  }

  editarDispositivo(dispositivo: Dispositivo) {
    const dialogRef = this.dialog.open(AgregarDispositivo, { width: '800px', data: { dispositivo } });
    dialogRef.afterClosed().subscribe(result => { if (result) this.cargarDispositivos(); });
  }

  eliminarDispositivo(d: Dispositivo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '800px',
      data: { message: "Se borrará este actuador y sus datos relacionados" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dispositivoService.deleteDispositivo(d.idDispositivo as string).subscribe(() => this.cargarDispositivos());
      }
    });
  }
  /*
    openFilters() {
      const dialogRef = this.dialog.open(FiltersPanelComponent, {
        panelClass: 'custom-filters-dialog',
        backdropClass: 'filters-backdrop',
        position: { right: '0', top: '60px' },
        width: '320px',
        data: {
          deviceTypes: this.deviceTypes,
          measurementTypes: this.measurementTypes,
          selectedDeviceType: this.selectedDeviceType(),
          selectedMeasurementType: this.selectedMeasurementType(),
          isDescending: this.isDescending()
        }
      });
  
      dialogRef.componentInstance.filtersChanged.subscribe(filters => {
        this.selectedDeviceType.set(filters.deviceType ?? this.selectedDeviceType());
        this.selectedMeasurementType.set(filters.measurementType ?? this.selectedMeasurementType());
        this.isDescending.set(filters.order ?? this.isDescending());
      });
    }*/

  cambiarEstado(dis: Dispositivo, estado: boolean) {
    var dialogRef = this.matd.open(DialogSelectTipoComponent, {
      width: '400px',
      height: 'auto',
      minHeight: '300px',
    });
    if (!dis || !dis.actuadores) {
      return;
    }

    let actuador = structuredClone(dis.actuadores[0]);
    let nuevoActuador = (actuador);
    if (estado) {
      actuador.idAccionAct = this.tipoAcciones().find(x => x.idAccionAct == "80b8364b-8603-42d9-b857-0db5f055c6fd")?.idAccionAct as string

    } else {
      actuador.idAccionAct = this.tipoAcciones().find(x => x.idAccionAct != "80b8364b-8603-42d9-b857-0db5f055c6fd")?.idAccionAct as string
    }
    if (!actuador.idAccionAct) {
      this.cargarAccion()
      return
    }
    console.log(actuador)
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.actSrv.ONOFFActuador(actuador.idActuador as string, actuador, dis.idSistema as string, result).subscribe((data:any) => {
          if(data.message)
            this.togleSvc.show(data.message, data.numberResponse === 0? 'success':data.numberResponse === 1?'info':'error')
          else
            this.togleSvc.show('No se recibio respuesta del servidor','error')

            console.log(data)
        })
      }
    });

    /**/
    console.log(`Actuador ${actuador.idActuador} => ${estado ? 'ON' : 'OFF'}`);
  }



  onToggleChange(event: any, dispo: Dispositivo) {
    const nuevoValor = event.checked;


    event.source.checked = !nuevoValor;


    //this.isDescending = nuevoValor;
    if (this.isAdmin())
      this.cambiarEstado(dispo, nuevoValor);
    else
      this.togleSvc.show('Usted no puede realizar estas peticiones', 'info')

  }


  puedeCambiarEstado(): boolean {
    // aquí podrías validar permisos, confirmar, etc.
    return confirm('¿Seguro que deseas cambiar el estado?');
  }
}


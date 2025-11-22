import { Component, OnInit, inject, forwardRef, Inject, Optional, PLATFORM_ID, signal, ViewChild, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { BehaviorSubject, Observable, map, startWith, switchMap } from 'rxjs';
import { Dispositivo } from '../../models/dispositivo.model';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { TipoMedicion } from '../../models/tipomedicion.model';
import { TipoDispositivoService } from '../../services/tipodispositivos.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { Actuador } from '../../models/actuador.model';
import { Sensor } from '../../models/sensor.model';
import { PuntoOptimo } from '../../models/puntoOptimo.model';
import { Accion } from '../../models/accion.model';
import { TipoMUnidadM } from '../../models/tipoMUnidadM.model';
import { AccionService } from '../../services/accion.service';
import { TipoMUnidadMService } from '../../services/tipoMUnidadM.service';
import { Marca } from '../../models/marca.model';
import { MarcaService } from '../../services/marcas.service';
import { EstadoDispositivoService } from '../../services/estadoDispositio.service';
import { SistemaService } from '../../services/sistemas.service';
import { Sistema } from '../../models/sistema.model';
import { EstadoDispositivo } from '../../models/estadoDispositivo.model';
import { SensorService } from '../../services/sensor.service';
import { ActuadorService } from '../../services/actuador.service';
import { ExcesoListComponent } from '../excesoList/excesoList';
import { ExcesoPuntoOptimo } from '../../models/excesoPuntoOptimo.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { AreaService } from '../../services/area.service';
import { Area } from '../../models/area.model';
import { ToggleService } from '../../services/toggle.service';

@Component({
  selector: 'app-agregar-dispositivo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatCardModule,
    MatDividerModule, NgSelectModule

  ],
  templateUrl: './agregar-dispositivo.html',
  styleUrl: './agregar-dispositivo.css'
})
export class AgregarDispositivo implements OnInit {
  areas = signal<Area[]>([]);


  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    @Optional() private dialogRef: MatDialogRef<AgregarDispositivo>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private togleSvc: ToggleService
  ) {

  }

  private fb = inject(FormBuilder);

  // servicios (inject)private sistemaSvc = inject(SistemaService);
  private sistemaSvc = inject(SistemaService);
  private estadoSvc = inject(EstadoDispositivoService);
  private tipoSvc = inject(TipoDispositivoService);
  private tipoMsvc = inject(TipoMUnidadMService);
  private accionSvc = inject(AccionService);
  private marcaSvc = inject(MarcaService);
  private dispSvc = inject(DispositivoService);
  private sensSvc = inject(SensorService);
  private actSvc = inject(ActuadorService);
  private areaSvc = inject(AreaService);
  // si se abre como dialog, podemos recibir ref (opcional)
  //dialogRef = inject(MatDialogRef, { optional: true });


  marcasList: Marca[];
  // datos como observables
  tipos$!: Observable<TipoDispositivo[]>;
  tiposSubject = new BehaviorSubject<TipoDispositivo[]>([])
  tipoMUnidades$!: Observable<TipoMUnidadM[]>
  tipoMUnidadesSubject = new BehaviorSubject<TipoMUnidadM[]>([])
  accionesSubject = new BehaviorSubject<Accion[]>([])
  acciones$!: Observable<Accion[]>;
  sistemaSubject = new BehaviorSubject<Sistema[]>([])
  sistemas$: Observable<Sistema[]> = this.sistemaSubject.asObservable();  // ajusta con tu modelo
  estadosSubject = new BehaviorSubject<EstadoDispositivo[]>([])
  estados$: Observable<EstadoDispositivo[]> = this.estadosSubject.asObservable();

  // autocomplete marcas
  marcasFiltered$!: Observable<Marca[]>;

  // cache local (también puedes usar async pipe en template)
  allTipoMUnidades: TipoMUnidadM[] = [];

  loading = false;
  errorMsg = '';

  //esta en modo edicion
  isEditMode = false;


  form = this.fb.group({

    idArea: ['' as string | Area | null, Validators.required],
    idDispositivo: [''],
    nombre: ['', Validators.required],
    sn: ['', Validators.required],
    descripcion: [''],
    image: [''],
    idTipoDispositivo: ['', Validators.required],
    idMarca: [null as string | Marca | null],
    sensors: this.fb.array([]),
    actuadores: this.fb.array([]),
    idSistema: ['', Validators.required],
    idEstadoDispositivo: ['', Validators.required]
  });


  @ViewChild('areaInput', { read: MatAutocompleteTrigger })
  trigger!: MatAutocompleteTrigger;
  seleccionado: any;
  control = new FormControl('');
  opciones: string[] = ['Manzana', 'Banano', 'Cereza', 'Durazno', 'Fresa'];
  opcionesFiltradas = signal<Area[]>([]);

  filtrar() {
    const valor = this.control.value?.toLowerCase() || '';
    const filtradas = this.areas().filter(op =>
      op.nombre.toLowerCase().includes(valor)
    );

    this.opcionesFiltradas.set(filtradas);
    console.log("this.control.value")
    console.log(this.control.value)
    console.log(this.opcionesFiltradas())
    console.log(this.areas())

    //this.trigger.openPanel();
  }
  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      // cargar listas como observables (sin suscribir en componente)

      if(this.data.deviceTypes)
       {
         this.tipos$=this.data.deviceTypes
       }
      else
        this.tipos$ = this.tipoSvc.obtenerTiposDispositivo(); // Observable<TipoDispositivo[]>

      if(this.data.tipoMUnidades$)
        this.tipoMUnidades$ = this.data.tipoMUnidades$;
      else
        this.tipoMUnidades$ = this.tipoMsvc.getTipoMUnidadMs();

      this.tipoMUnidades$.subscribe(xs => this.allTipoMUnidades = xs || []);
      
      if(this.data.acciones$)
        this.acciones$ = this.data.acciones$;
      else
        this.acciones$ = this.accionSvc.getAcciones();

 
      if(this.data.estadosSubject)
        this.estadosSubject.next([...this.data.estadosSubject.getValue()]);
      else
        this.estadoSvc.getEstadoDispositivoes().subscribe(xs => { this.estadosSubject.next(xs) });

  

  
      if(this.data.sistemaSubject)
        this.sistemaSubject.next([...this.data.sistemaSubject.getValue()]);
      else
        this.sistemaSvc.obtenerSistemas().subscribe(xs => { this.sistemaSubject.next(xs) });


      // cache de tipoMUnidades para filtrados
      this.marcaSvc.obtenerMarcas().subscribe(ms => {
        this.marcasList = ms
        if (this.data) {
          if (this.data.dispositivo) {
            console.log(this.marcasList)
            const l = this.marcasList.find(x => x.idMarca == this.data.dispositivo.idMarca);
            if (l)
              this.form.get('idMarca')?.setValue(l)
            console.log("marca", this.form.get('idMarca')?.value)
          }
        }
      })
    } else {
      this.tipos$ = this.tiposSubject; // Observable<TipoDispositivo[]>
      this.tipoMUnidades$ = this.tipoMUnidadesSubject;
      this.acciones$ = this.accionesSubject;

      this.sistemaSubject.next([]);
      this.estadosSubject.next([]);
      // cache de tipoMUnidades para filtrados
      this.allTipoMUnidades = [];
      this.marcasList = []
    }
    // marcas: autocomplete -> escuchamos valueChanges del control idMarca
    this.marcasFiltered$ = this.form.get('idMarca')!.valueChanges.pipe(
      startWith(''),
      map((value: null | Marca | string) => {
        const term = typeof value === 'string' ? value.toLowerCase() : value?.nombre?.toLowerCase() ?? '';
        return this.marcasList?.filter(m => m.nombre.toLowerCase().includes(term));
      })
    );





    // cuando cambia el tipo de dispositivo, limpiar arrays
    this.form.get('idTipoDispositivo')!.valueChanges.subscribe((_: any) => {
      this.clearArrays();
    });

    this.areaSvc.getAreas().subscribe(x => {
      console.log(x)
      this.areas.set(x)
      this.opcionesFiltradas.set(this.areas())

      if (this.data) {
        if (this.data.dispositivo) {
          const l1 = this.areas().find(x => x.idArea == this.data.dispositivo.idArea);
          if (l1)
            this.form.get('idArea')?.setValue(l1)
          console.log("idArea", this.form.get('idArea')?.value)
        }
      }
    })
    if (this.data && this.data.dispositivo) {
      this.cargarDatos()
    }


  }

  // ---------- FormArray getters ----------
  get sensors(): FormArray { return this.form.get('sensors') as FormArray; }
  get actuadores(): FormArray { return this.form.get('actuadores') as FormArray; }

  // ---------- agregar / eliminar ----------
  addSensor() {

    const g = this.fb.group({ // primer combobox (tipo medición)
      idSensor: [undefined],
      idTipoMedicion: [''],
      idTipoMUnidadM: ['', Validators.required],   // segundo combobox (id tipoMUnidadM)
      idPuntoOptimo: [undefined],
      valorMin: [null, Validators.required],
      valorMax: [null, Validators.required],
      excesoPuntosOptimos: [[] as ExcesoPuntoOptimo[], Validators.required]
    });
    this.sensors.push(g);
    return g;
    // visualmente los nuevos aparecerán arriba vía CSS (column-reverse)
  }


  addExcesoInSensor(sens: any, i: number) {

    const dialogRef = this.dialog.open(ExcesoListComponent, {
      width: "1100px",
      data: sens.value
    });
    dialogRef.afterClosed().subscribe((result: ExcesoPuntoOptimo) => {
      if (result) {
        sens.value.excesoPuntosOptimos = result
        console.log(this.sensors.value)
        console.log(this.sensors.at(i))

      }
    });
  }


  removeSensor(i: number) { this.sensors.removeAt(i); }

  addActuador() {
    const g = this.fb.group({
      idAccionAct: ['', Validators.required],
      on: ['', Validators.required],
      off: ['', Validators.required]
    });
    this.actuadores.push(g);
  }
  removeActuador(i: number) { this.actuadores.removeAt(i); }

  // ---------- utilidades para opciones de unidad por sensor ----------
  getUnidadOptionsForSensorIndex(i: number): TipoMUnidadM[] {
    const g = this.sensors.at(i) as FormGroup;
    const idTipoMed = g?.get('idTipoMedicion')?.value;
    if (!idTipoMed) return [];
    return this.allTipoMUnidades.filter(x => x.idTipoMedicion === idTipoMed);
  }


  isSensorMode(tiposList: TipoDispositivo[] | null): boolean {
    const id = this.form.get('idTipoDispositivo')!.value;
    if (!id || !tiposList) return false;
    const t = tiposList.find(x => x.idTipoDispositivo === id);
    return !!t && (t.nombre?.toLowerCase().includes('sensor'));
  }
  isActuatorMode(tiposList: TipoDispositivo[] | null): boolean {
    const id = this.form.get('idTipoDispositivo')!.value;
    if (!id || !tiposList) return false;
    const t = tiposList.find(x => x.idTipoDispositivo === id);
    return !!t && (t.nombre?.toLowerCase().includes('actuador'));
  }

  // ---------- Guardar ----------
  save(): void {
    console.log(this.form.value)
    if (this.form.invalid) {
      console.log('form invalid')
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const val = this.form.value;

    console.log("this.form.valueal")
    console.log(val)
    // Mapear sensores: cada sensor -> Sensor + puntoOptimo[]
    const sensorsPayload: Sensor[] = (val.sensors || []).map((s: any) => {
      const punto: PuntoOptimo = {
        idTipoMunidadM: s.idTipoMUnidadM as string,
        valorMin: +s.valorMin,
        valorMax: +s.valorMax,
        excesoPuntosOptimos: s.excesoPuntosOptimos
      };
      if (s.idPuntoOptimo) {
        punto.idPuntoOptimo = s.idPuntoOptimo;
      }
      if (s.idSensor) {
        punto.idSensor = s.idSensor;
      }
      let sen = {
        idDispositivo: val.idDispositivo,
        idTipoMUnidadM: s.idTipoMUnidadM,
        medicions: s.medicions,
        puntoOptimos: [punto]
      } as Sensor
      if (s.idSensor) {
        sen.idSensor = s.idSensor;
      }
      return sen;
    });
    console.log(sensorsPayload)
    const actuadoresPayload: Actuador[] = (val.actuadores || []).map((a: any) => ({
      idAccionAct: a.idAccionAct,
      on: a.on,
      off: a.off
    }));

    const payload: Dispositivo = {
      nombre: val.nombre!, // ⚡ aseguramos que no es null
      sn: val.sn!,
      descripcion: val.descripcion ?? undefined,
      image: val.image ?? undefined,
      idTipoDispositivo: val.idTipoDispositivo ?? undefined,
      sensors: sensorsPayload.length ? sensorsPayload : undefined,
      actuadores: actuadoresPayload.length ? actuadoresPayload : undefined,
      idSistema: val.idSistema ?? undefined,                    // 👈 nuevo
      idEstadoDispositivo: val.idEstadoDispositivo ?? undefined
    };

    // Manejo idMarca / marca: si el control idMarca tiene un objeto Marca seleccionada,
    // mandamos idMarca. Si no, si el usuario escribió texto (y no existe id), mandamos marca:{idMarca: null, nombre: texto}
    const idMarcaVal = val.idMarca;
    console.log(idMarcaVal)
    console.log(typeof idMarcaVal === 'string')

    console.log("fue string")
    if (typeof idMarcaVal === 'string') {
      // caso: escribió una marca nueva
      payload['idMarcaNavigation'] = { idMarca: undefined, nombre: idMarcaVal.trim() } as Marca;
    } else if (idMarcaVal && typeof idMarcaVal === 'object') {
      // caso: seleccionó una Marca existente
      payload['idMarca'] = idMarcaVal.idMarca;
    }

    const idArea = val.idArea;
    console.log(idArea)
    console.log(typeof idArea === 'string')

    console.log("fue string")
    if (typeof idArea === 'string') {
      // caso: escribió una marca nueva
      payload['idAreaNavigation'] = { idArea: undefined, nombre: idArea.trim() } as Area;
    } else if (idArea && typeof idArea === 'object') {
      // caso: seleccionó una Marca existente
      payload['idArea'] = idArea.idArea;
    }




    console.log(payload)
    // Llamada al servicio (sin suscribir arriba, pero aquí necesitamos ejecutar)
    // usando subscribe porque es la acción final; puedes transformar con lastValueFrom si quieres promesas.
    if (this.data) {
      if (this.data.dispositivo) {

        payload['idDispositivo'] = val.idDispositivo as string
        this.dispSvc.updateDispositivo(payload).subscribe({
          next: (data: any) => {
            if (data) {
              // Mostrar mensaje de éxito
              this.togleSvc.show('Dispositivo actualizado correctamente', 'success');

              // Cerrar el diálogo si existe
              this.dialogRef?.close(true);
              this.form.reset();
              this.clearArrays();
              console.log(data);
            } else {
              // Mostrar mensaje si no hubo respuesta válida
              this.togleSvc.show('No se pudo actualizar el dispositivo', 'warning');
            }
            this.loading = false;
          },
          error: (err) => {
            // Mostrar mensaje de error
            console.error(err);
            this.loading = false;
          }
        })

      } else {

        this.dispSvc.createDispositivo(payload).subscribe({
          next: (data) => {
            // si estamos en un dialog, cerrarlo con resultado
            this.dialogRef?.close(true);
            // si no, limpiar form
            this.form.reset();
            this.clearArrays();
            console.log(data)
            if (data) {

              this.togleSvc.show('Dispositivo almacenado correctamente', 'success');
            } else {

              this.togleSvc.show('Error al almacenar el dispositivo', 'error');
            }
            this.loading = false;

          }

        });
        this.dispSvc.createDispositivo(payload).subscribe((data) => {
          // si estamos en un dialog, cerrarlo con resultado
          this.dialogRef?.close(true);
          // si no, limpiar form
          this.form.reset();
          this.clearArrays();
          console.log(data)

          this.loading = false;

        });
      }

    }
  }



  clearArrays() {
    while (this.sensors.length) this.sensors.removeAt(0);
    while (this.actuadores.length) this.actuadores.removeAt(0);
    let d!: Dispositivo;
    if (this.data) {
      d = this.data.dispositivo;
    }
    if(d){
    if (d.sensors) {
      d.sensors.forEach((sen: Sensor) => {

        const g = this.fb.group({

          idSensor: [sen.idSensor],
          excesoPuntosOptimos: [sen.puntoOptimos ? sen.puntoOptimos.length > 0 ? sen.puntoOptimos[sen.puntoOptimos.length - 1].excesoPuntosOptimos : undefined : undefined],
          idTipoMedicion: [sen.idTipoMUnidadMNavigation?.idTipoMedicion],
          idTipoMUnidadM: [sen.idTipoMUnidadM, Validators.required],
          idPuntoOptimo: [sen.puntoOptimos ? sen.puntoOptimos.length > 0 ? sen.puntoOptimos[sen.puntoOptimos.length - 1].idPuntoOptimo : undefined : undefined],
          valorMin: [sen.puntoOptimos ? sen.puntoOptimos.length > 0 ? sen.puntoOptimos[sen.puntoOptimos.length - 1].valorMin : 0 : 0],
          valorMax: [sen.puntoOptimos ? sen.puntoOptimos.length > 0 ? sen.puntoOptimos[sen.puntoOptimos.length - 1].valorMax : 0 : 0]
        });
        this.sensors.push(g);
      });
    }
    if (d.actuadores) {
      d.actuadores.forEach((act: Actuador) => {
        const g = this.fb.group({
          idActuador: [act.idActuador],
          idAccionAct: [act.idAccionAct, Validators.required],
          on: [act.on, Validators.required],
          off: [act.off, Validators.required]
        });
        this.actuadores.push(g);
      });
    }}
  }



  cargarDatos() {

    if (this.data) {
      const d: Dispositivo = this.data.dispositivo;
      // primero los simples
      this.form.patchValue({
        idDispositivo: d.idDispositivo,
        nombre: d.nombre,
        sn: d.sn,
        descripcion: d.descripcion,
        image: d.image,
        idTipoDispositivo: d.idTipoDispositivo,
        idMarca: { idMarca: d.idMarca, nombre: '' },
        idSistema: d.idSistema,
        idEstadoDispositivo: d.idEstadoDispositivo,
        idArea: d.idAreaNavigation ?? { idArea: d.idArea, nombre: "" }
      });

      // luego arrays
      /* if (d.sensors) {
         d.sensors.forEach((sen: Sensor) => {
 
           const g = this.fb.group({
             idSensor: [sen.idSensor],
             idTipoMedicion: [sen.idTipoMUnidadMNavigation?.idTipoMedicion],
             idTipoMUnidadM: [sen.idTipoMUnidadM, Validators.required],
             idPuntoOptimo: [sen.puntoOptimos ? sen.puntoOptimos.length > 0 ? sen.puntoOptimos[sen.puntoOptimos.length - 1].idPuntoOptimo : undefined : undefined],
             valorMin: [sen.puntoOptimos ? sen.puntoOptimos.length > 0 ? sen.puntoOptimos[sen.puntoOptimos.length - 1].valorMin : 0 : 0],
             valorMax: [sen.puntoOptimos ? sen.puntoOptimos.length > 0 ? sen.puntoOptimos[sen.puntoOptimos.length - 1].valorMax : 0 : 0]
           });
           this.sensors.push(g);
         });
       }
       if (d.actuadores) {
         d.actuadores.forEach((act: Actuador) => {
           const g = this.fb.group({
             idActuador: [act.idActuador],
             idAccionAct: [act.idAccionAct, Validators.required],
             on: [act.on, Validators.required],
             off: [act.off, Validators.required]
           });
           this.actuadores.push(g);
         });
       }*/
    }

    console.log("FORM VALUE::");
    console.log(this.form.value);
  }

  // display function para el autocomplete (muestra nombre cuando se selecciona un objeto Marca)
  displayMarcaFn(m?: Marca) {
    return m ? m.nombre : '';
  }
  displayAreaFn(m?: Area) {
    return m ? m.nombre : '';
  }

  // función para cerrar (cuando se use como diálogo)
  close() {
    this.dialogRef?.close(false);
  }
}


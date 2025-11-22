import { Component, inject, Inject, Optional, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Dispositivo } from '../../models/dispositivo.model';
import { DispositivoService } from '../../services/dispositivos.service';
import { TipoExcesoService } from '../../services/tipoExceso.serice';
import { ExcesoPOService } from '../../services/excesoPOService';
import { ExcesoPuntoOptimo } from '../../models/excesoPuntoOptimo.model';
import { TipoExceso } from '../../models/tipoExceso.model';
import { Accion } from '../../models/accion.model';
import { AccionService } from '../../services/accion.service';
@Component({
  selector: 'app-exceso-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './exceso-list.html',
  styleUrl: "./exceso-list.css"

})
export class ExcesoListComponent {

  form: FormGroup;
  
  sensores = signal<Dispositivo[]>([]);
  actuadores = signal<Dispositivo[]>([]);
  ExcesoList = signal<ExcesoPuntoOptimo[]>([]);
  tiposExceso =  signal<TipoExceso[]>([]);
  acciones =  signal<Accion[]>([]);
  // Datos de prueba (sintéticos)
  /*dispositivos = [
    { id: 'd1', nombre: 'Bomba Agua', actuadores: [{ on: 'ON', off: 'OFF' }] },
    { id: 'd2', nombre: 'Oxigenador', actuadores: [{ on: '1', off: '0' }] },
    { id: 'd3', nombre: 'Sensor PH', actuadores: [] } // este no debe aparecer
  ];*/



    private dialogRef = inject(MatDialogRef<ExcesoListComponent, boolean>) 

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private devService:DispositivoService,
    private tipoExcService:TipoExcesoService,
    private accionSvc:AccionService,
    private ExcService:ExcesoPOService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
      excesos: this.fb.array([])
    });
    if (isPlatformBrowser(this.platformId)) {
      ExcService.getExcesoPuntoOptimoes().subscribe((data:ExcesoPuntoOptimo[])=>{
      devService.getDispositivos().subscribe(devi=>{
        this.sensores.set(devi.filter(d => d.sensors?.length && d.sensors?.length>0))
        this.actuadores.set(devi.filter(d => d.actuadores?.length && d.actuadores?.length>0))
        this.sensores().map(x=>x.sensors?.map(s=>s.puntoOptimos.map(po=>po.excesoPuntosOptimos=data.filter(x1=>x1.idPuntoOptimo==po.idPuntoOptimo))))
        
      })
      this.tipoExcService.getTipoExcesoes().subscribe(TipoExc=>{
        this.tiposExceso.set(TipoExc);

      })
      this.accionSvc.getAcciones().subscribe(accionesdata=>{
        this.acciones.set(accionesdata);

      })
    
    })
      if(this.data){
        console.log(this.data)
        if((this.data.excesoPuntosOptimos as ExcesoPuntoOptimo[])&& (this.data.excesoPuntosOptimos as ExcesoPuntoOptimo[]).length >0)
        for(let exc of (this.data.excesoPuntosOptimos as ExcesoPuntoOptimo[])){
          let aex = this.addExceso();
          aex.setValue(exc)
        }
      }
    }

  }

  get excesos(): FormArray {
    return this.form.get('excesos') as FormArray;
  }


  addExceso() {
    let group = this.fb.group({
      idPuntoOptimo: [null as string | null],
      idExcesoPuntoOptimo: [null as string | null],
      idDispositivo: [''],
      idTipoExceso: [''],
      idAccionAct: [''],
      idAccionActNavigation: [null as Accion | null],
      idTipoExcesoNavigation: [null as TipoExceso | null]
    });  
    if(this.excesos.length>0)
   { this.excesos.insert(0, group); }
  else
    {this.excesos.push(group); }
  
  return group
  }

  removeExceso(i: number) {
    this.excesos.removeAt(i);
  }

  // Filtra solo dispositivos con actuadores
  get dispositivosFiltrados() {
     
     return this.sensores();
  }
  onClose(sure:boolean=true){
    if(sure){
    this.dialogRef.close(this.excesos.value as ExcesoPuntoOptimo[]);
  console.log(this.excesos.value);  }
  else
    this.dialogRef.close(undefined);
  }
}

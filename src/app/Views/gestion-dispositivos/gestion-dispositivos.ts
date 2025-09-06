import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ViewChildren, QueryList, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Dispositivo } from '../../models/dispositivo.model';
import { ActuadorService } from '../../services/actuador.service';
import { SensorService } from '../../services/sensor.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { TipoMedicionService } from '../../services/tipomedicion.service';
import { MedicionService } from '../../services/medicion.service';
import { PuntoOptimoService } from '../../services/puntoOptimo.service';
import { UnidadMedidaService } from '../../services/unidadMedida.service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Sensor } from '../../models/sensor.model';
import { Medicion } from '../../models/medicion.model';

@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  templateUrl: './gestion-dispositivos.html',
  imports: [CommonModule, BaseChartDirective, FormsModule],
  styleUrls: ['./gestion-dispositivos.css']
})
export class GestionDispositivos {
  @ViewChildren(BaseChartDirective) chart: BaseChartDirective;


  
  labels = signal<string[]>(['Ene', 'Feb', 'Mar', 'Abr']);
  points = signal<number[]>([10, 20, 30, 40]);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private dispositivosSubject = new BehaviorSubject<Dispositivo[]>([]);
  dispositivo$ = this.dispositivosSubject.asObservable();

  // filtro como signal
  tipoSeleccionado = signal<string>('Todos');

  // signal auxiliar para mantener dispositivos actualizados
  dispositivos = signal<Dispositivo[]>([]);

  // filtrados con computed
  dispositivosFiltrados = computed(() => {
    const filtro = this.tipoSeleccionado();
    console.log(this.dispositivos());
    return filtro === 'Todos'
      ? this.dispositivos()
      : this.dispositivos().filter(d => d.idTipoDispositivoNavigation?.nombre === filtro);
  });




  lineChartType: ChartType = 'line';


  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { display: false },
      y: { display: true }
    }
  };


  /*chartsData = computed<ChartConfiguration['data']>(() =>
  ({
    labels:this.labels()
    ,
    datasets: [
      {
        data: this.points(),
        label: 'Ventas',
        fill: true,
        tension: 0.25
      }
    ]
  })
  );*/

/*getChartData(sen: Sensor): ChartConfiguration['data'] {
  let l:number[]=
  return {
    labels: sen.medicions.map((_, i) => 'M' + (i + 1)),
    datasets: [
      {
        data: signal<number[]>([sen.medicions])(),
        label:  'Sensor',
        fill: true,
        tension: 0.25
      }
    ]
  };
}*/

getChartData(sen: Sensor): ChartConfiguration['data'] {
  return {
    labels: sen.medicions.map((m, i) => m.idFechaMedicion || 'M' + (i + 1)),
    datasets: [
      {
        data: sen.medicions.map(m => m.valor) ,
        label:  'Sensor',
        fill: true,
        tension: 0.25
      }
    ]
  };
}

  private destroyRef = inject(DestroyRef);

  constructor(
    private dispositivoService: DispositivoService,

  ) {
    this.dispositivoService.getDispositivos().subscribe(data => {

      this.dispositivos.set(data);
      this.dispositivosSubject.next(data);

    });
    this.dispositivo$.subscribe(_d => {
    })
    // generar datos solo en navegador
    if (this.isBrowser) {
      //const id = setInterval(() => this.actualizarSensores(), 2000);
      //this.destroyRef.onDestroy(() => clearInterval(id));
    }

  }

  private actualizarSensores() {


    const nuevo = Math.floor(Math.random() * 100);
    const tag = `N${this.labels().length + 1}`;
    this.labels.update(ls => [...ls.slice(1), tag]);
    this.points.update(ds =>[...ds.slice(1), nuevo]);


  }
}

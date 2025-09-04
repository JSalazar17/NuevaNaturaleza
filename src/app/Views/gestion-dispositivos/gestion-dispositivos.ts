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

@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  templateUrl: './gestion-dispositivos.html',
  imports: [CommonModule, BaseChartDirective],
  styleUrls: ['./gestion-dispositivos.css']
})
export class GestionDispositivos {
  @ViewChildren(BaseChartDirective) chart: BaseChartDirective;
  

  
   isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // filtro
  tipoSeleccionado = signal<string>('Todos');
  // dispositivos iniciales
  dispositivos = signal<Dispositivo[]>([
    { nombre: 'Bomba de Agua', sn: '', idTipoDispositivo: 'Actuador', image: 'assets/actuador_bomba.png' },
    { nombre: 'Luz LED', sn: '', idTipoDispositivo: 'Actuador', image: 'assets/actuador_luz.png' },
    { nombre: 'Ventilador', sn: '', idTipoDispositivo: 'Actuador', image: 'assets/actuador_ventilador.png' },
    { nombre: 'Sensor de Temperatura', sn: '', idTipoDispositivo: 'Sensor', image: 'assets/sensor_temp.png', },
    { nombre: 'Sensor de Humedad', sn: '', idTipoDispositivo: 'Sensor', image: 'assets/sensor_humedad.png'}
  ]);

  // filtrados dinámicamente
  dispositivosFiltrados = computed(() => {
    const filtro = this.tipoSeleccionado();
    return filtro === 'Todos'
      ? this.dispositivos()
      : this.dispositivos().filter(d => d.idTipoDispositivo === filtro);
  });
  


  lineChartType: ChartType = 'line';


  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    animation: false
  };
   labels = signal<string[]>(['Ene', 'Feb', 'Mar', 'Abr']);
  points = signal<number[]>([10, 20, 30, 40]);
  // chartData calculado dinámicamente para cada sensor
  chartsData = computed<ChartConfiguration['data']>(() =>
  ({
      labels: this.labels(),
    datasets: [
      { data: this.points(), label: 'Ventas', fill: true, tension: 0.25 }
    ]
  })
  );



  private destroyRef = inject(DestroyRef);

  constructor(
    private actuadorServicio:ActuadorService,
    private sensorService:SensorService,
    private dispositivoService:DispositivoService,
    private medicionService:MedicionService,
    private tipoMedicionService:TipoMedicionService,
    private unidadMedidaService:UnidadMedidaService,
    private puntoOptimoService:PuntoOptimoService,
    
  ) {
    // generar datos solo en navegador
    if (this.isBrowser) {
      const id = setInterval(() => this.actualizarSensores(), 2000);
      this.destroyRef.onDestroy(() => clearInterval(id));
    }
  }

  private actualizarSensores() {

    
    const nuevo = Math.floor(Math.random() * 100);
    const tag = `N${this.labels().length + 1}`;
    this.labels.update(ls => ls.length >= 6 ? [...ls.slice(1), tag] : [...ls, tag]);
    this.points.update(ds => ds.length >= 6 ? [...ds.slice(1), nuevo] : [...ds, nuevo]);

    
  }
}

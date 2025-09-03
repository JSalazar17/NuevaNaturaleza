import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface Dispositivo {
  nombre: string;
  tipo: 'Sensor' | 'Actuador';
  imagen: string;
  valor?: number;
  datos?: number[];
  chartData?: ChartConfiguration<'line'>['data'];
}

@Component({
  selector: 'app-gestion-dispositivos',
  templateUrl: './gestion-dispositivos.html',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  styleUrls: ['./gestion-dispositivos.css']
})
export class GestionDispositivos implements OnInit {
  tipoSeleccionado: string = 'Todos';

  dispositivos: Dispositivo[] = [
    { nombre: 'Bomba de Agua', tipo: 'Actuador', imagen: 'assets/actuador_bomba.png' },
    { nombre: 'Luz LED', tipo: 'Actuador', imagen: 'assets/actuador_luz.png' },
    { nombre: 'Ventilador', tipo: 'Actuador', imagen: 'assets/actuador_ventilador.png' },
    { nombre: 'Sensor de Temperatura', tipo: 'Sensor', imagen: 'assets/sensor_temp.png', valor: 25, datos: [25] },
    { nombre: 'Sensor de Humedad', tipo: 'Sensor', imagen: 'assets/sensor_humedad.png', valor: 60, datos: [60] }
  ];

  dispositivosFiltrados: Dispositivo[] = [];

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { display: false },
      y: { display: true }
    }
  };

  constructor(private cd: ChangeDetectorRef) {
    this.filtrar();
  }

  ngOnInit(): void {
    // inicializar chartData
    this.dispositivos.forEach(d => {
      if (d.tipo === 'Sensor') {
        d.chartData = {
          labels: d.datos?.map((_, i) => i.toString()) || [],
          datasets: [
            {
              data: d.datos || [],
              borderColor: 'blue',
              fill: false,
              tension: 0.3
            }
          ]
        };
      }
    });

    setInterval(() => {
      this.actualizarSensores();
    }, 2000);
  }

  filtrar() {
    if (this.tipoSeleccionado === 'Todos') {
      this.dispositivosFiltrados = [...this.dispositivos];
    } else {
      this.dispositivosFiltrados = this.dispositivos.filter(
        d => d.tipo === this.tipoSeleccionado
      );
    }
  }

  actualizarSensores() {
    this.dispositivos.forEach(d => {
      if (d.tipo === 'Sensor') {
        d.valor = Math.floor(Math.random() * 100);

        if (d.datos) {
          d.datos.push(d.valor);
          if (d.datos.length > 10) d.datos.shift();
        }

        if (d.chartData) {
          d.chartData.labels = d.datos?.map((_, i) => i.toString());
          d.chartData.datasets[0].data = d.datos || [];
        }
      }
    });

    this.charts.forEach(chart => chart.update());
    this.cd.detectChanges();
  }
}

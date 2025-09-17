  import { ChangeDetectionStrategy, Component } from '@angular/core';
  import { MatDialog } from '@angular/material/dialog';
  import { FiltersPanelComponent } from './filtercomponent/filters-panel.component';
  import { MatIconModule } from "@angular/material/icon";
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-parent',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    imports: [MatIconModule,CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class ParentComponent {
    allData = [
      { deviceType: 'Sensor 1', measurementType: 'Temperatura', value: 20 },
      { deviceType: 'Sensor 2', measurementType: 'Humedad', value: 40 },
      { deviceType: 'Sensor 1', measurementType: 'Presión', value: 1013 }
    ];
    filteredData = [...this.allData];

    deviceTypes = ['Sensor 1', 'Sensor 2', 'Sensor 3'];
    measurementTypes = ['Temperatura', 'Humedad', 'Presión'];
  selectedDeviceType = '';
  selectedMeasurementType = '';
  isDescending = false;


    constructor(private dialog: MatDialog) {}

openFilters() {
  const opened = this.dialog.openDialogs.find(
    d => d.componentInstance instanceof FiltersPanelComponent
  );

  if (opened) {
    // Si ya está abierto, lo cerramos
    opened.close();
    return;
  }

  // Si no está abierto, lo abrimos
  const dialogRef = this.dialog.open(FiltersPanelComponent, {
    panelClass: 'custom-filters-dialog',
    backdropClass: 'filters-backdrop',
    position: { right: '0', top: '60px' },
    width: '320px',
    data: {
      deviceTypes: this.deviceTypes,
      measurementTypes: this.measurementTypes,
      // 👇 Mandamos también los valores actuales ya seleccionados
      selectedDeviceType: this.selectedDeviceType,
      selectedMeasurementType: this.selectedMeasurementType,
      isDescending: this.isDescending
    }
  });

  dialogRef.componentInstance.filtersChanged.subscribe(filters => {
    console.log('Filtros aplicados dinámicamente:', filters);
    this.selectedDeviceType = filters.deviceType;
    this.selectedMeasurementType = filters.measurementType;
    this.isDescending = filters.order;
    this.applyFilters(filters);
  });
}

    applyFilters(filters: any) {
  setTimeout(() => {
      this.filteredData = this.allData
        .filter(item => !filters.deviceType || item.deviceType === filters.deviceType)
        .filter(item => !filters.measurementType || item.measurementType === filters.measurementType);

      if (filters.order) {
        this.filteredData = [...this.filteredData].reverse();
      }
    });
  }
  }

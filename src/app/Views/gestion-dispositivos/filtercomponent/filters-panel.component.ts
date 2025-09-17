import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { TipoDispositivo } from '../../../models/tipodispositivo.model';
import { TipoMedicion } from '../../../models/tipomedicion.model';

@Component({
  selector: 'app-filters-panel',
  templateUrl: './filters-panel.component.html',
  styleUrls: ['./filter-panel.component.css'],
  imports: [MatSlideToggleModule, MatFormFieldModule, MatSelectModule]
})
export class FiltersPanelComponent {
  @Output() filtersChanged = new EventEmitter<any>();

  selectedDeviceType = '';
  selectedMeasurementType = '';
  isDescending = false;

  deviceTypes: TipoDispositivo[] = [];
  measurementTypes: TipoMedicion[] = [];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  this.deviceTypes = data.deviceTypes || [];
  this.measurementTypes = data.measurementTypes || [];

  // 👇 Inicializamos con lo que viene del padre
  this.selectedDeviceType = data.selectedDeviceType || '';
  this.selectedMeasurementType = data.selectedMeasurementType || '';
  this.isDescending = data.isDescending || false;
}


  // Emitir cada cambio en vivo
  onDeviceTypeChange() {
    this.emitFilters();
  }

  onMeasurementTypeChange() {
    this.emitFilters();
  }

  onOrderChange(event: any) {
    this.isDescending = event.checked;
    this.emitFilters();
  }

  private emitFilters() {
    this.filtersChanged.emit({
      deviceType: this.selectedDeviceType,
      measurementType: this.selectedMeasurementType,
      order: this.isDescending
    });
  }
}

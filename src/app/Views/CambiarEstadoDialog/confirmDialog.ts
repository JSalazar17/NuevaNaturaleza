// confirm-dialog.component.ts
import { Component, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-select-tipo',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormField, MatLabel,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,CommonModule],
  templateUrl: './ConfirmDialog.html',
  styles: [` .dialog-content { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
   .radio-group { display: flex; flex-direction: column; gap: 10px; } .input-field { width: 100%; } 
   h2 { font-weight: 600; color: #1565C0; margin-bottom: 10px; } `]
})
export class DialogSelectTipoComponent {

  selectedOption: string = '';
  customText: string = '';

  constructor(@Optional() private dialogRef: MatDialogRef<DialogSelectTipoComponent>) { }

  isValid(): boolean {
    if (this.selectedOption === 'Otra') {
      return this.customText.trim().length > 0;
    }
    return this.selectedOption !== '';
  }

  confirmar(): void {
    let result = this.selectedOption === 'Otra' ? this.customText.trim() : this.selectedOption;
    this.dialogRef.close(result);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}

// confirm-dialog.component.ts
import { Component, Inject, inject, Optional } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './ConfirmDialog.html'
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
    constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any){
        
    }
  onClose(value: boolean) {
    this.dialogRef.close(value);
  }
}

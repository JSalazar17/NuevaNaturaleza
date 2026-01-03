import { CommonModule } from "@angular/common";
import { Component, Inject, Optional, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UsuarioService } from "../../../services/usuario.service";
import { ToggleService } from "../../../services/toggle.service";
import { Rol } from "../../../models/rol.model";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-usuarios',
  templateUrl: './crusuarios.html',
  styleUrls: ['./crususarios.css'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule]
})
export class CRUsuariosComponent implements OnInit {

  usuarioForm!: FormGroup;
  usuarioEditando = false;
  cambiarClave = false;
  roles: Rol[] = [];

  // string dinámico del primer error detectado
  mensajeError: string = "";

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toggleSvc: ToggleService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CRUsuariosComponent, boolean>
  ) {}

  ngOnInit(): void {
    this.roles = this.data.roles || [];
    this.usuarioEditando = !!this.data.usuario;

    this.initForm();
    this.distribuirDatos();
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      idUsuario: [''],
      idRol: ['', Validators.required],
      cedula: ['', Validators.required],
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      clave: [''] // la validación se aplicará de forma dinámica
    });
  }

  distribuirDatos() {
    if (!this.usuarioEditando) return;

    const u = this.data.usuario;

    this.usuarioForm.patchValue({
      idUsuario: u.idUsuario,
      idRol: u.idRol,
      cedula: u.cedula,
      nombre: u.nombre,
      correo: u.correo
    });

    // clave vacía al editar
    this.usuarioForm.get('clave')?.setValue('');
  }

  // VALIDADOR PRINCIPAL CON MENSAJE DINÁMICO
  validarFormulario(): boolean {
    const f = this.usuarioForm;

    // Reset mensaje
    this.mensajeError = "";

    if (f.get('idRol')?.invalid) {
      this.mensajeError = "Debe seleccionar un rol.";
      return false;
    }

    if (f.get('cedula')?.invalid) {
      this.mensajeError = "La cédula es obligatoria.";
      return false;
    }

    if (f.get('nombre')?.invalid) {
      this.mensajeError = "El nombre es obligatorio.";
      return false;
    }

    if (f.get('correo')?.hasError('required')) {
      this.mensajeError = "El correo es obligatorio.";
      return false;
    }

    if (f.get('correo')?.hasError('email')) {
      this.mensajeError = "Debe ingresar un correo válido.";
      return false;
    }

    // VALIDACIÓN DINÁMICA DE CLAVE
    if (!this.usuarioEditando) {
      if (!f.get('clave')?.value) {
        this.mensajeError = "Debe ingresar una contraseña.";
        return false;
      }
    }

    if (this.usuarioEditando && this.cambiarClave) {
      if (!f.get('clave')?.value) {
        this.mensajeError = "Debe ingresar la nueva contraseña.";
        return false;
      }
    }

    return true;
  }

  guardarUsuario() {
    // aplica validación
    if (!this.validarFormulario()) {
      this.mensajeError+="*";
      this.toggleSvc.show(this.mensajeError, "warning");
      return;
    }

    let formData = this.usuarioForm.value;

    if (!this.cambiarClave && this.usuarioEditando) {
       formData.clave = null;
    }

    if (this.usuarioEditando) {
      console.log(formData);
      this.usuarioService.updateUsuario(formData.idUsuario, formData)
        .subscribe(() => this.dialogRef.close(true));
    } else {
      this.usuarioService.createUsuario(formData)
        .subscribe(() => this.dialogRef.close(true));
    }
  }
  changePass(){
    this.cambiarClave=!this.cambiarClave;
  }
}

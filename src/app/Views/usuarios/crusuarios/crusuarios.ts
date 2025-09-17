import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Inject,inject, OnInit, Optional } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Usuario } from "../../../models/usuario.model";
import { FormsModule } from "@angular/forms";
import { UsuarioService } from "../../../services/usuario.service";
import { Rol } from "../../../models/rol.model";

@Component({
  selector: 'app-usuarios',
  templateUrl: './crusuarios.html',
  styleUrls: ['./crususarios.css'],
  imports: [FormsModule,CommonModule]
})
export class CRUsuariosComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CRUsuariosComponent, boolean>);


    
    roles: Rol[] = [];
    usuarioEditando = false;
    cambiarClave:boolean= false;
    usuario:Usuario
    ngOnInit(): void {
    }

    
    usuarioForm: Usuario = { idUsuario: '',idRol: '', cedula: '', nombre: '', correo: '', clave: 'no' };
    constructor(
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private usuarioService: UsuarioService,
        private cdr: ChangeDetectorRef
    ){
        console.log(data)
        this.distribuirDatos()
        
    }

    distribuirDatos(){
        if(this.data){
            this.roles = this.data.roles;
            if(this.data.usuario){
                this.usuarioEditando=true
            this.usuarioForm = { idUsuario: this.data.usuario.idUsuario,idRol: this.data.usuario.idrol,
                 cedula:this.data.usuario.cedula, nombre: this.data.usuario.nombre, correo: this.data.usuario.correo, clave: undefined };
            this.usuario = {...this.data.usuario};
        
        }
        }
    }
    guardarUsuario() {
    if (this.usuarioEditando) {
            console.log("dataso")
      this.usuarioService.updateUsuario(this.usuarioForm.idUsuario!, this.usuarioForm)
        .subscribe((data) => {
            console.log(data)
        });
    } else {
            console.log("datace")
      this.usuarioService.createUsuario(this.usuarioForm)
        .subscribe(() => {
        });
    }
  }

    print(cambiarClave:boolean){
        console.log(cambiarClave)
    }
    resetForm() {
    this.usuarioForm = { idUsuario: '', idRol: '', cedula: '', nombre: '', correo: '', clave: '' };
    this.usuarioEditando = false;
  }
}
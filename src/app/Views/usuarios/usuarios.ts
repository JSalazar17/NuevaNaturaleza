import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios {
  usuarios = [
    { id: 1, rol: 'Admin', cedula: '123456789', nombre: 'Juan Pérez', correo: 'juan@example.com', clave: '1234' },
    { id: 2, rol: 'Usuario', cedula: '987654321', nombre: 'María Gómez', correo: 'maria@example.com', clave: 'abcd' }
  ];

  usuarioSeleccionado: any = null;
  mostrarModal = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  formulario: any = { rol: '', cedula: '', nombre: '', correo: '', clave: '' };

  seleccionar(usuario: any) {
    this.usuarioSeleccionado = usuario;
  }

  abrirModal(modo: 'agregar' | 'editar') {
    this.modoModal = modo;
    this.mostrarModal = true;
    if (modo === 'editar' && this.usuarioSeleccionado) {
      this.formulario = { ...this.usuarioSeleccionado };
    } else {
      this.formulario = { rol: '', cedula: '', nombre: '', correo: '', clave: '' };
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (this.modoModal === 'agregar') {
      const nuevo = { ...this.formulario, id: this.usuarios.length + 1 };
      this.usuarios.push(nuevo);
    } else if (this.modoModal === 'editar' && this.usuarioSeleccionado) {
      Object.assign(this.usuarioSeleccionado, this.formulario);
    }
    this.cerrarModal();
  }

  eliminar() {
    const confirmar = confirm('¿Seguro que quieres eliminar este usuario?');
    if (confirmar) {
      this.usuarios = this.usuarios.filter(u => u !== this.usuarioSeleccionado);
      this.usuarioSeleccionado = null;
    }
  }
}

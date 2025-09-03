import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // 🔹 Necesario para *ngIf, *ngFor

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule], // 🔹 Aquí se agrega CommonModule
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent {
  isCollapsed: boolean = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  cerrarSesion() {
    const confirmacion = confirm("¿Está seguro que desea cerrar sesión?");
    if (confirmacion) {
      this.router.navigate(['/login']);
    }
  }
}

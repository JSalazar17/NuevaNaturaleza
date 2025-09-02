import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterOutlet, RouterLink], 
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent {
  constructor(private router: Router) {}

  cerrarSesion() {
    const confirmacion = confirm("¿Está seguro que desea cerrar sesión?");
    if (confirmacion) {
      this.router.navigate(['/login']);
    }
  }
}

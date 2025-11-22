import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToggleComponent } from "./Views/share/toggle.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToggleComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Acuaponic-Front');
}

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from './components/shell/app-shell.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('scoreboard');
}

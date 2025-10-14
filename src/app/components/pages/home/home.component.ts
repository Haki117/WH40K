import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabType = 'home' | 'players' | 'scoreboard' | 'games';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="start-screen">
      <div class="welcome-section">
        <div class="welcome-content">
          <h2 class="welcome-title">Welcome to WH40K Club Thun</h2>
          <p class="welcome-description">
            Manage your battles, track player statistics, and organize tournaments for the Warhammer
            40,000 gaming club in Thun.
          </p>

          <div class="feature-cards">
            <div class="feature-card" (click)="navigateToTab('players')">
              <div class="feature-icon">👥</div>
              <h3 class="feature-title">Players</h3>
              <p class="feature-description">
                View player profiles, favorite armies, and win rates
              </p>
            </div>

            <div class="feature-card" (click)="navigateToTab('scoreboard')">
              <div class="feature-icon">🏆</div>
              <h3 class="feature-title">Scoreboard</h3>
              <p class="feature-description">
                Rankings, statistics, and player performance analysis
              </p>
            </div>

            <div class="feature-card" (click)="navigateToTab('games')">
              <div class="feature-icon">⚔️</div>
              <h3 class="feature-title">Games</h3>
              <p class="feature-description">Create and manage battle sessions and tournaments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  tabChange = output<TabType>();

  navigateToTab(tab: TabType) {
    this.tabChange.emit(tab);
  }
}

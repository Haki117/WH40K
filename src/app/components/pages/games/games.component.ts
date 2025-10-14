import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreboardComponent } from '../../shared/scoreboard.component';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, ScoreboardComponent],
  template: `
    <div class="games-tab">
      <div class="tab-header">
        <h2 class="tab-title">Battle Sessions</h2>
        <p class="tab-subtitle">Create and manage Warhammer 40K battles</p>
      </div>

      <div class="games-navigation">
        <div class="nav-tabs">
          <button
            class="nav-tab"
            [class.active]="activeView === 'current'"
            (click)="setActiveView('current')"
          >
            <span class="tab-icon">⚔️</span>
            Current Battle
          </button>
          <button
            class="nav-tab"
            [class.active]="activeView === 'history'"
            (click)="setActiveView('history')"
          >
            <span class="tab-icon">📜</span>
            Battle History
          </button>
          <button
            class="nav-tab"
            [class.active]="activeView === 'tournaments'"
            (click)="setActiveView('tournaments')"
          >
            <span class="tab-icon">🏆</span>
            Tournaments
          </button>
        </div>
      </div>

      <!-- Current Battle View -->
      <div class="game-content" *ngIf="activeView === 'current'">
        <app-scoreboard></app-scoreboard>
      </div>

      <!-- Battle History View -->
      <div class="game-content" *ngIf="activeView === 'history'">
        <div class="battle-history">
          <div class="history-controls">
            <input type="text" class="search-input" placeholder="Search battle history..." />
            <select class="filter-select">
              <option value="all">All Battles</option>
              <option value="recent">Recent (Last 30 days)</option>
              <option value="completed">Completed</option>
              <option value="my-battles">My Battles</option>
            </select>
          </div>

          <div class="battle-list">
            <div class="battle-card" *ngFor="let i of [1, 2, 3, 4, 5]">
              <div class="battle-header">
                <div class="battle-info">
                  <h4 class="battle-title">Battle #{{ 100 + i }}</h4>
                  <span class="battle-date">{{ getBattleDate(i) }}</span>
                </div>
                <div class="battle-status">
                  <span class="status-badge completed">Completed</span>
                </div>
              </div>

              <div class="battle-participants">
                <div class="participant-list">
                  <div class="participant" *ngFor="let p of [1, 2]">
                    <div class="participant-avatar">{{ p }}</div>
                    <div class="participant-info">
                      <span class="participant-name">Player {{ p }}</span>
                      <span class="participant-army">{{ getRandomArmy(p) }}</span>
                    </div>
                    <div class="participant-result" [class.winner]="p === 1">
                      {{ p === 1 ? 'Winner' : 'Defeated' }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="battle-actions">
                <button class="btn btn-secondary btn-small">View Details</button>
                <button class="btn btn-primary btn-small">Rematch</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tournaments View -->
      <div class="game-content" *ngIf="activeView === 'tournaments'">
        <div class="tournaments-section">
          <div class="section-header">
            <h3>Upcoming Tournaments</h3>
            <button class="btn btn-primary">Create Tournament</button>
          </div>

          <div class="tournament-list">
            <div class="tournament-card upcoming">
              <div class="tournament-header">
                <h4 class="tournament-title">Monthly Championship</h4>
                <span class="tournament-date">Next Weekend</span>
              </div>
              <div class="tournament-info">
                <div class="tournament-detail">
                  <span class="detail-label">Format:</span>
                  <span class="detail-value">Swiss Rounds</span>
                </div>
                <div class="tournament-detail">
                  <span class="detail-label">Players:</span>
                  <span class="detail-value">8/16 registered</span>
                </div>
                <div class="tournament-detail">
                  <span class="detail-label">Prize:</span>
                  <span class="detail-value">Glory & Honor</span>
                </div>
              </div>
              <div class="tournament-actions">
                <button class="btn btn-primary">Register</button>
                <button class="btn btn-secondary">View Details</button>
              </div>
            </div>

            <div class="tournament-card completed">
              <div class="tournament-header">
                <h4 class="tournament-title">Spring Showdown</h4>
                <span class="tournament-date">Last Month</span>
              </div>
              <div class="tournament-info">
                <div class="tournament-detail">
                  <span class="detail-label">Winner:</span>
                  <span class="detail-value">Player 1</span>
                </div>
                <div class="tournament-detail">
                  <span class="detail-label">Participants:</span>
                  <span class="detail-value">12 players</span>
                </div>
              </div>
              <div class="tournament-actions">
                <button class="btn btn-secondary">View Results</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './games.component.css',
})
export class GamesComponent {
  activeView: 'current' | 'history' | 'tournaments' = 'current';

  armies = [
    'Space Marines',
    'Chaos Space Marines',
    'Imperial Guard',
    'Orks',
    'Eldar',
    'Tyranids',
    'Tau Empire',
    'Necrons',
  ];

  setActiveView(view: 'current' | 'history' | 'tournaments') {
    this.activeView = view;
  }

  getBattleDate(index: number): string {
    const dates = ['Today', '2 days ago', '1 week ago', '2 weeks ago', '1 month ago'];
    return dates[index - 1] || 'Long time ago';
  }

  getRandomArmy(index: number): string {
    return this.armies[index % this.armies.length];
  }
}

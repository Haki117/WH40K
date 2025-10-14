import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../models/player.models';

@Component({
  selector: 'app-player-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()" *ngIf="isVisible()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="player-header-info">
            <div class="player-avatar-large">
              <img *ngIf="player()?.avatar" [src]="player()?.avatar" [alt]="player()?.name" />
              <div *ngIf="!player()?.avatar" class="avatar-initials">{{ getInitials() }}</div>
            </div>
            <div class="player-info">
              <h2>{{ player()?.name }}</h2>
              <div class="player-rank">Rank #{{ player()?.stats?.rank || 'N/A' }}</div>
            </div>
          </div>
          <button class="close-btn" (click)="closeModal()">
            <span class="icon">×</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎲</div>
              <div class="stat-content">
                <div class="stat-value">{{ player()?.stats?.gamesPlayed || 0 }}</div>
                <div class="stat-label">Games Played</div>
              </div>
            </div>

            <div class="stat-card win-rate">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <div class="stat-value">{{ player()?.stats?.winRate || 0 }}%</div>
                <div class="stat-label">Win Rate</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ player()?.stats?.wins || 0 }}</div>
                <div class="stat-label">Victories</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">❌</div>
              <div class="stat-content">
                <div class="stat-value">{{ player()?.stats?.losses || 0 }}</div>
                <div class="stat-label">Defeats</div>
              </div>
            </div>
          </div>

          <div class="armies-section">
            <h3>Armies</h3>
            <div class="armies-grid">
              <div class="army-card" *ngFor="let army of player()?.armies">
                <div class="army-icon" [class]="getArmyFactionClass(army)">
                  {{ getArmyIcon(army) }}
                </div>
                <div class="army-info">
                  <div class="army-name">{{ army }}</div>
                  <div class="army-faction">{{ getArmyFaction(army) }}</div>
                </div>
                <div class="army-stats" *ngIf="army === player()?.stats?.mostPlayedArmy">
                  <span class="most-played">Most Played</span>
                </div>
              </div>
            </div>
          </div>

          <div class="performance-section">
            <h3>Performance Overview</h3>
            <div class="performance-chart">
              <div class="win-loss-bar">
                <div class="win-portion" [style.width.%]="player()?.stats?.winRate || 0"></div>
                <div
                  class="loss-portion"
                  [style.width.%]="100 - (player()?.stats?.winRate || 0)"
                ></div>
              </div>
              <div class="chart-labels">
                <span class="wins-label">{{ player()?.stats?.wins || 0 }} Wins</span>
                <span class="losses-label">{{ player()?.stats?.losses || 0 }} Losses</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="editArmies()">Edit Armies</button>
          <button class="btn btn-secondary" (click)="editPlayer()">Edit Profile</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./player-detail-modal.component.css'],
})
export class PlayerDetailModalComponent {
  @Input() player = signal<Player | null>(null);
  @Input() isVisible = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() editPlayerEvent = new EventEmitter<Player>();
  @Output() editArmiesEvent = new EventEmitter<Player>();

  getInitials(): string {
    const name = this.player()?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getArmyFaction(army: string): string {
    const factionMap: { [key: string]: string } = {
      'Space Marines': 'Imperium',
      'Blood Angels': 'Imperium',
      'Dark Angels': 'Imperium',
      'Imperial Guard': 'Imperium',
      'Chaos Space Marines': 'Chaos',
      'Chaos Knights': 'Chaos',
      Tyranids: 'Xenos',
      Orks: 'Xenos',
      Necrons: 'Xenos',
      Aeldari: 'Aeldari',
      Drukhari: 'Aeldari',
      'Tau Empire': 'Xenos',
    };
    return factionMap[army] || 'Unknown';
  }

  getArmyFactionClass(army: string): string {
    return `faction-${this.getArmyFaction(army).toLowerCase()}`;
  }

  getArmyIcon(army: string): string {
    const iconMap: { [key: string]: string } = {
      'Space Marines': '🛡️',
      'Blood Angels': '🩸',
      'Dark Angels': '⚔️',
      'Imperial Guard': '🎖️',
      'Chaos Space Marines': '💀',
      'Chaos Knights': '🏰',
      Tyranids: '🦎',
      Orks: '⚡',
      Necrons: '🤖',
      Aeldari: '🌟',
      Drukhari: '🗡️',
      'Tau Empire': '🎯',
    };
    return iconMap[army] || '⚔️';
  }

  closeModal(): void {
    this.close.emit();
  }

  editPlayer(): void {
    const currentPlayer = this.player();
    if (currentPlayer) {
      this.editPlayerEvent.emit(currentPlayer);
    }
  }

  editArmies(): void {
    const currentPlayer = this.player();
    if (currentPlayer) {
      this.editArmiesEvent.emit(currentPlayer);
    }
  }
}

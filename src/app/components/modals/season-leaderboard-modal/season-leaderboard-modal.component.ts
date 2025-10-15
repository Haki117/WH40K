import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Season, SeasonStats } from '../../../models/player.models';
import { SeasonsService } from '../../../services/seasons.service';

@Component({
  selector: 'app-season-leaderboard-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-content season-leaderboard-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ season?.name }} - Leaderboard</h2>
          <button class="close-btn" (click)="close()" aria-label="Close">×</button>
        </div>

        <div class="modal-body" *ngIf="season">
          <!-- Season Summary -->
          <div class="season-summary">
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-number">{{ seasonStats.length }}</div>
                <div class="stat-label">Players</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ getTotalBattles() }}</div>
                <div class="stat-label">Total Battles</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ getSeasonDuration() }}</div>
                <div class="stat-label">Duration</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ getAverageBattlesPerPlayer() }}</div>
                <div class="stat-label">Avg. Battles/Player</div>
              </div>
            </div>

            <div class="season-period">
              <span class="period-label">Season Period:</span>
              <span class="period-dates">
                {{ formatDate(season.startDate) }} -
                {{ season.endDate ? formatDate(season.endDate) : 'Ongoing' }}
              </span>
            </div>
          </div>

          <!-- Leaderboard Table -->
          <div class="leaderboard-section">
            <h3 class="section-title">Player Rankings</h3>

            <div class="leaderboard-table">
              <div class="table-header">
                <div class="rank-col">Rank</div>
                <div class="player-col">Player</div>
                <div class="games-col">Games</div>
                <div class="record-col">W-L-D</div>
                <div class="winrate-col">Win Rate</div>
                <div class="avg-col">Avg. Points</div>
              </div>

              <div class="table-body">
                <div
                  class="table-row"
                  *ngFor="let player of seasonStats; let i = index"
                  [class.champion]="i === 0"
                  [class.podium]="i < 3"
                >
                  <div class="rank-col">
                    <div
                      class="rank-badge"
                      [class.gold]="i === 0"
                      [class.silver]="i === 1"
                      [class.bronze]="i === 2"
                    >
                      <span class="rank-number">{{ player.rank }}</span>
                    </div>
                  </div>

                  <div class="player-col">
                    <div class="player-info">
                      <div class="player-avatar">{{ player.playerName.charAt(0) }}</div>
                      <div class="player-details">
                        <div class="player-name">{{ player.playerName }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="games-col">
                    <span class="games-count">{{ player.gamesPlayed }}</span>
                  </div>

                  <div class="record-col">
                    <div class="record-display">
                      <span class="wins">{{ player.wins }}</span
                      >-<span class="losses">{{ player.losses }}</span
                      >-<span class="draws">{{ player.draws }}</span>
                    </div>
                  </div>

                  <div class="winrate-col">
                    <div class="winrate-display">
                      <span class="winrate-text">{{ player.winRate }}%</span>
                      <div class="winrate-bar">
                        <div
                          class="winrate-fill"
                          [style.width.%]="player.winRate"
                          [attr.data-winrate]="getWinRateCategory(player.winRate)"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div class="avg-col">
                    <span class="avg-points">{{ player.averagePoints }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div class="empty-leaderboard" *ngIf="seasonStats.length === 0">
              <div class="empty-icon">📊</div>
              <h4>No Data Available</h4>
              <p>No battles have been recorded for this season yet.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Close</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './season-leaderboard-modal.component.css',
})
export class SeasonLeaderboardModalComponent implements OnInit, OnChanges {
  @Input() season: Season | null = null;
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();

  seasonStats: SeasonStats[] = [];

  constructor(private seasonsService: SeasonsService) {}

  ngOnInit(): void {
    // Initialize when component is created
  }

  ngOnChanges(): void {
    if (this.season && this.isVisible) {
      this.loadSeasonStats();
    }
  }

  private loadSeasonStats(): void {
    if (this.season) {
      this.seasonStats = this.seasonsService.getSeasonStats(this.season.id);
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getTotalBattles(): number {
    return this.seasonStats.reduce((total, player) => total + player.gamesPlayed, 0) / 2; // Divide by 2 since each game involves 2 players
  }

  getSeasonDuration(): string {
    if (!this.season) return '0 days';

    const startDate = new Date(this.season.startDate);
    const endDate = this.season.endDate ? new Date(this.season.endDate) : new Date();

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
  }

  getAverageBattlesPerPlayer(): number {
    if (this.seasonStats.length === 0) return 0;
    const totalBattles = this.seasonStats.reduce((total, player) => total + player.gamesPlayed, 0);
    return Math.round(totalBattles / this.seasonStats.length);
  }

  getWinRateCategory(winRate: number): string {
    if (winRate >= 55) return 'high';
    if (winRate >= 45) return 'medium';
    return 'low';
  }
}

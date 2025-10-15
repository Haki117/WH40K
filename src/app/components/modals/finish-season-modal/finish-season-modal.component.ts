import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Season, SeasonStats } from '../../../models/player.models';
import { SeasonsService } from '../../../services/seasons.service';

@Component({
  selector: 'app-finish-season-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-content finish-season-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Finish Season</h2>
          <button class="close-btn" (click)="close()" aria-label="Close">×</button>
        </div>

        <div class="modal-body" *ngIf="season">
          <!-- Warning Section -->
          <div class="warning-section">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
              <h3>Are you sure you want to finish "{{ season.name }}"?</h3>
              <p>
                This action cannot be undone. The season will be marked as completed and no new
                battles can be added to it.
              </p>
            </div>
          </div>

          <!-- Season Summary -->
          <div class="season-summary">
            <h4>Season Summary</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">{{ getSeasonDuration() }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Battles:</span>
                <span class="summary-value">{{ getTotalBattles() }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Active Players:</span>
                <span class="summary-value">{{ getPlayerCount() }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Started:</span>
                <span class="summary-value">{{ formatDate(season.startDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Championship Preview -->
          <div class="championship-preview" *ngIf="championStats">
            <h4>Season Champion</h4>
            <div class="champion-card">
              <div class="champion-avatar">{{ championStats.playerName.charAt(0) }}</div>
              <div class="champion-info">
                <div class="champion-name">{{ championStats.playerName }}</div>
                <div class="champion-stats">
                  {{ championStats.wins }}-{{ championStats.losses }}-{{ championStats.draws }} ({{
                    championStats.winRate
                  }}% win rate)
                </div>
                <div class="champion-points">{{ championStats.totalPoints }} total points</div>
              </div>
              <div class="champion-crown">👑</div>
            </div>
          </div>

          <!-- What Happens Next -->
          <div class="next-steps">
            <h4>What happens next?</h4>
            <ul>
              <li>The season will be archived and added to the "Previous Seasons" list</li>
              <li>Final rankings and statistics will be preserved</li>
              <li>You can start a new season to continue competition</li>
              <li>All battle records remain accessible in the battle history</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Cancel</button>
          <button class="btn btn-danger" (click)="confirmFinishSeason()">Finish Season</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './finish-season-modal.component.css',
})
export class FinishSeasonModalComponent implements OnChanges {
  @Input() season: Season | null = null;
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() seasonFinished = new EventEmitter<void>();

  championStats: SeasonStats | null = null;

  constructor(private seasonsService: SeasonsService) {}

  ngOnChanges(): void {
    if (this.season && this.isVisible) {
      this.loadChampionStats();
    }
  }

  private loadChampionStats(): void {
    if (this.season) {
      const stats = this.seasonsService.getSeasonStats(this.season.id);
      this.championStats = stats.length > 0 ? stats[0] : null; // First player is the champion
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

  confirmFinishSeason(): void {
    this.seasonFinished.emit();
    this.close();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getSeasonDuration(): string {
    if (!this.season) return '0 days';

    const startDate = new Date(this.season.startDate);
    const endDate = new Date();

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

  getTotalBattles(): number {
    return this.season ? this.seasonsService.getSeasonBattleCount(this.season.id) : 0;
  }

  getPlayerCount(): number {
    return this.season ? this.seasonsService.getSeasonPlayerCount(this.season.id) : 0;
  }
}

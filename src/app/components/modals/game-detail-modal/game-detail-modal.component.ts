import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game, WARHAMMER_ARMIES } from '../../../models/player.models';

@Component({
  selector: 'app-game-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-content game-detail-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Battle Details</h2>
          <button class="close-btn" (click)="close()" aria-label="Close">×</button>
        </div>

        <div class="modal-body" *ngIf="game">
          <!-- Battle Overview -->
          <div class="battle-overview">
            <div class="battle-title">
              <h3>Battle #{{ battleNumber }}</h3>
              <span class="battle-date">{{ formatDate(game.date) }}</span>
            </div>

            <div class="battle-result">
              <span class="result-badge" [class]="getResultClass()">
                {{ getBattleResultText() }}
              </span>
            </div>
          </div>

          <!-- Participants Details -->
          <div class="participants-section">
            <div class="section-title">
              <h4>Participants</h4>
            </div>

            <div class="participants-grid">
              <!-- Player 1 Details -->
              <div class="participant-detail" [class.winner]="game.winner === 'player1'">
                <div class="participant-header">
                  <div class="participant-avatar">{{ game.player1.playerName.charAt(0) }}</div>
                  <div class="participant-info">
                    <h5 class="participant-name">{{ game.player1.playerName }}</h5>
                    <div class="participant-army">
                      <span class="army-icon">{{ getArmyIcon(game.player1.army) }}</span>
                      <span class="army-name">{{ game.player1.army }}</span>
                    </div>
                  </div>
                  <div class="participant-result" [class.winner]="game.winner === 'player1'">
                    {{ game.player1.result.toUpperCase() }}
                  </div>
                </div>

                <!-- Player 1 Details -->
                <div class="participant-details">
                  <div class="detail-section">
                    <h6>Army List</h6>
                    <div class="expandable-content">
                      <p>{{ game.player1.armyList || 'No army list provided' }}</p>
                    </div>
                  </div>

                  <div class="detail-section">
                    <h6>Deployment</h6>
                    <p>{{ game.player1.deployment || 'No deployment information' }}</p>
                  </div>

                  <div class="detail-section">
                    <h6>Twists</h6>
                    <p>{{ game.player1.twists || 'No twists applied' }}</p>
                  </div>

                  <div class="scoring-section">
                    <h6>Scoring Breakdown</h6>
                    <div class="score-grid">
                      <div class="score-item">
                        <span class="score-label">Fully Painted</span>
                        <span class="score-value">{{ game.player1.fullyPaintedPoints }}/10</span>
                      </div>
                      <div class="score-item">
                        <span class="score-label">Primary Points</span>
                        <span class="score-value">{{ game.player1.primaryPoints }}/45</span>
                      </div>
                      <div class="score-item">
                        <span class="score-label">Secondary Points</span>
                        <span class="score-value">{{ game.player1.secondaryPoints }}/45</span>
                      </div>
                      <div class="score-item total">
                        <span class="score-label">Total Points</span>
                        <span class="score-value">{{ game.player1.totalPoints }}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- VS Divider -->
              <div class="vs-divider">
                <span class="vs-text">VS</span>
              </div>

              <!-- Player 2 Details -->
              <div class="participant-detail" [class.winner]="game.winner === 'player2'">
                <div class="participant-header">
                  <div class="participant-avatar">{{ game.player2.playerName.charAt(0) }}</div>
                  <div class="participant-info">
                    <h5 class="participant-name">{{ game.player2.playerName }}</h5>
                    <div class="participant-army">
                      <span class="army-icon">{{ getArmyIcon(game.player2.army) }}</span>
                      <span class="army-name">{{ game.player2.army }}</span>
                    </div>
                  </div>
                  <div class="participant-result" [class.winner]="game.winner === 'player2'">
                    {{ game.player2.result.toUpperCase() }}
                  </div>
                </div>

                <!-- Player 2 Details -->
                <div class="participant-details">
                  <div class="detail-section">
                    <h6>Army List</h6>
                    <div class="expandable-content">
                      <p>{{ game.player2.armyList || 'No army list provided' }}</p>
                    </div>
                  </div>

                  <div class="detail-section">
                    <h6>Deployment</h6>
                    <p>{{ game.player2.deployment || 'No deployment information' }}</p>
                  </div>

                  <div class="detail-section">
                    <h6>Twists</h6>
                    <p>{{ game.player2.twists || 'No twists applied' }}</p>
                  </div>

                  <div class="scoring-section">
                    <h6>Scoring Breakdown</h6>
                    <div class="score-grid">
                      <div class="score-item">
                        <span class="score-label">Fully Painted</span>
                        <span class="score-value">{{ game.player2.fullyPaintedPoints }}/10</span>
                      </div>
                      <div class="score-item">
                        <span class="score-label">Primary Points</span>
                        <span class="score-value">{{ game.player2.primaryPoints }}/45</span>
                      </div>
                      <div class="score-item">
                        <span class="score-label">Secondary Points</span>
                        <span class="score-value">{{ game.player2.secondaryPoints }}/45</span>
                      </div>
                      <div class="score-item total">
                        <span class="score-label">Total Points</span>
                        <span class="score-value">{{ game.player2.totalPoints }}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="notes-section" *ngIf="game.notes">
            <div class="section-title">
              <h4>Battle Notes</h4>
            </div>
            <div class="notes-content">
              <p>{{ game.notes }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Close</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './game-detail-modal.component.css',
})
export class GameDetailModalComponent {
  @Input() game: Game | null = null;
  @Input() battleNumber: number = 0;
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getArmyIcon(armyName: string): string {
    const army = WARHAMMER_ARMIES.find((army) => army.name === armyName);
    return army?.icon || '⚔';
  }

  getBattleResultText(): string {
    if (!this.game) return '';

    if (this.game.winner === 'draw') {
      return 'Draw';
    }

    const winner = this.game.winner === 'player1' ? this.game.player1 : this.game.player2;
    return `${winner.playerName} Victory`;
  }

  getResultClass(): string {
    if (!this.game) return '';

    if (this.game.winner === 'draw') {
      return 'draw';
    }

    return 'victory';
  }
}

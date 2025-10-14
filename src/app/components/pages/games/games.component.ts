import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../../services/games.service';
import { WARHAMMER_ARMIES, Game, GameFormData } from '../../../models/player.models';
import { GameDetailModalComponent } from '../../modals/game-detail-modal/game-detail-modal.component';
import { GameCreationModalComponent } from '../../modals/game-creation-modal/game-creation-modal.component';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    CommonModule,
    GameDetailModalComponent,
    GameCreationModalComponent,
  ],
  template: `
    <div class="games-tab">
      <div class="tab-header">
        <div class="header-content">
          <div class="header-text">
            <h2 class="tab-title">Battle Sessions</h2>
            <p class="tab-subtitle">Create and manage Warhammer 40K battles</p>
          </div>
          <button class="btn btn-primary create-game-btn" (click)="openGameCreationModal()">
            <span class="btn-icon">⚔️</span>
            Create New Battle
          </button>
        </div>
      </div>

      <div class="games-navigation">
        <div class="nav-tabs">
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
            <div class="battle-card" *ngFor="let game of games(); let i = index">
              <div class="battle-header">
                <div class="battle-info">
                  <h4 class="battle-title">Battle #{{ games().length - i }}</h4>
                  <span class="battle-date">{{ game.formattedDate }}</span>
                </div>
                <div class="battle-status">
                  <span class="status-badge completed">Completed</span>
                </div>
              </div>

              <div class="battle-participants">
                <div class="participant-list">
                  <!-- Player 1 -->
                  <div class="participant" [class.winner]="game.winner === 'player1'">
                    <div class="participant-avatar">{{ game.player1.playerName.charAt(0) }}</div>
                    <div class="participant-info">
                      <span class="participant-name">{{ game.player1.playerName }}</span>
                      <div class="participant-army">
                        <span class="army-icon" [title]="game.player1.army">{{
                          getArmyIcon(game.player1.army)
                        }}</span>
                        <span class="army-name">{{ game.player1.army }}</span>
                      </div>
                    </div>
                    <div class="participant-result" [class.winner]="game.winner === 'player1'">
                      {{ getGameResultText(game).player1Result }}
                    </div>
                  </div>

                  <!-- VS Divider -->
                  <div class="vs-divider">VS</div>

                  <!-- Player 2 -->
                  <div class="participant" [class.winner]="game.winner === 'player2'">
                    <div class="participant-avatar">{{ game.player2.playerName.charAt(0) }}</div>
                    <div class="participant-info">
                      <span class="participant-name">{{ game.player2.playerName }}</span>
                      <div class="participant-army">
                        <span class="army-icon" [title]="game.player2.army">{{
                          getArmyIcon(game.player2.army)
                        }}</span>
                        <span class="army-name">{{ game.player2.army }}</span>
                      </div>
                    </div>
                    <div class="participant-result" [class.winner]="game.winner === 'player2'">
                      {{ getGameResultText(game).player2Result }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="battle-actions">
                <button class="btn btn-secondary btn-small" (click)="openGameDetail(game)">
                  View Details
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="games().length === 0">
              <div class="empty-icon">⚔️</div>
              <h3>No Games Played Yet</h3>
              <p>Start recording your battles to see the history here.</p>
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

      <!-- Game Detail Modal -->
      <app-game-detail-modal
        [game]="selectedGame"
        [battleNumber]="selectedBattleNumber"
        [isVisible]="isModalVisible"
        (closeModal)="closeGameDetailModal()"
      ></app-game-detail-modal>

      <!-- Game Creation Modal -->
      <app-game-creation-modal
        [isVisible]="isGameCreationModalVisible"
        (closeModal)="closeGameCreationModal()"
        (gameCreated)="onGameCreated($event)"
      ></app-game-creation-modal>
    </div>
  `,
  styleUrl: './games.component.css',
})
export class GamesComponent {
  activeView: 'history' | 'tournaments' = 'history';

  // Game Detail Modal state
  selectedGame: Game | null = null;
  selectedBattleNumber = 0;
  isModalVisible = false;

  // Game Creation Modal state
  isGameCreationModalVisible = false;

  constructor(private gamesService: GamesService) {} // Computed property for games with formatted dates
  games = computed(() => {
    return this.gamesService.games().map((game) => ({
      ...game,
      formattedDate: this.formatGameDate(game.date),
    }));
  });

  setActiveView(view: 'history' | 'tournaments') {
    this.activeView = view;
  }

  private formatGameDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil((diffDays - 1) / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  getArmyIcon(armyName: string): string {
    const army = WARHAMMER_ARMIES.find((army) => army.name === armyName);
    return army?.icon || '⚔';
  }

  // Helper method to get game result text
  getGameResultText(game: any): { player1Result: string; player2Result: string } {
    if (game.winner === 'draw') {
      return { player1Result: 'Draw', player2Result: 'Draw' };
    }

    return {
      player1Result: game.winner === 'player1' ? 'Victory' : 'Defeat',
      player2Result: game.winner === 'player2' ? 'Victory' : 'Defeat',
    };
  }

  openGameDetail(game: any): void {
    const games = this.games();
    const gameIndex = games.findIndex((g) => g.id === game.id);

    this.selectedGame = game;
    this.selectedBattleNumber = games.length - gameIndex;
    this.isModalVisible = true;
  }

  closeGameDetailModal(): void {
    this.selectedGame = null;
    this.selectedBattleNumber = 0;
    this.isModalVisible = false;
  }

  openGameCreationModal(): void {
    this.isGameCreationModalVisible = true;
  }

  closeGameCreationModal(): void {
    this.isGameCreationModalVisible = false;
  }

  onGameCreated(gameData: GameFormData): void {
    this.gamesService.addGame(gameData);
    this.closeGameCreationModal();
  }
}

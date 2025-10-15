import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../../services/games.service';
import { SeasonsService } from '../../../services/seasons.service';
import { WARHAMMER_ARMIES, Game, GameFormData, Season } from '../../../models/player.models';
import { GameDetailModalComponent } from '../../modals/game-detail-modal/game-detail-modal.component';
import { GameCreationModalComponent } from '../../modals/game-creation-modal/game-creation-modal.component';
import { SeasonLeaderboardModalComponent } from '../../modals/season-leaderboard-modal/season-leaderboard-modal.component';
import { FinishSeasonModalComponent } from '../../modals/finish-season-modal/finish-season-modal.component';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    CommonModule,
    GameDetailModalComponent,
    GameCreationModalComponent,
    SeasonLeaderboardModalComponent,
    FinishSeasonModalComponent,
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
          <button class="btn btn-danger" (click)="clearAllData()" style="margin-left: 10px;">
            🧹 Clear All Data
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
            [class.active]="activeView === 'seasons'"
            (click)="setActiveView('seasons')"
          >
            <span class="tab-icon">🏆</span>
            Seasons
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

      <!-- Seasons View -->
      <div class="game-content" *ngIf="activeView === 'seasons'">
        <div class="seasons-section">
          <div class="section-header">
            <h3>Competition Seasons</h3>
            <button class="btn btn-primary" (click)="createNewSeason()" *ngIf="!hasActiveSeason()">
              Start New Season
            </button>
          </div>

          <!-- Active Season -->
          <div class="season-card active" *ngIf="activeSeason() as season">
            <div class="season-header">
              <div class="season-info">
                <h4 class="season-title">{{ season.name }}</h4>
                <span class="season-duration"
                  >Started {{ formatSeasonDate(season.startDate) }}</span
                >
              </div>
              <div class="season-status">
                <span class="status-badge active">Active</span>
              </div>
            </div>

            <div class="season-description" *ngIf="season.description">
              <p>{{ season.description }}</p>
            </div>

            <div class="season-stats">
              <div class="stat-item">
                <span class="stat-label">Battles Played:</span>
                <span class="stat-value">{{ getSeasonBattleCount(season.id) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Active Players:</span>
                <span class="stat-value">{{ getSeasonPlayerCount(season.id) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Duration:</span>
                <span class="stat-value">{{ getSeasonDuration(season) }}</span>
              </div>
            </div>

            <div class="season-actions">
              <button class="btn btn-secondary" (click)="viewSeasonStats(season)">
                View Leaderboard
              </button>
              <button class="btn btn-danger" (click)="finishSeason(season)">Finish Season</button>
            </div>
          </div>

          <!-- No Active Season State -->
          <div class="empty-season-state" *ngIf="!activeSeason()">
            <div class="empty-icon">🏆</div>
            <h3>No Active Season</h3>
            <p>Start a new competition season to track player rankings and statistics.</p>
            <button class="btn btn-primary" (click)="createNewSeason()">Start New Season</button>
          </div>

          <!-- Previous Seasons -->
          <div class="previous-seasons" *ngIf="previousSeasons().length > 0">
            <h4 class="section-subtitle">Previous Seasons</h4>
            <div class="season-list">
              <div class="season-card completed" *ngFor="let season of previousSeasons()">
                <div class="season-header">
                  <div class="season-info">
                    <h5 class="season-title">{{ season.name }}</h5>
                    <span class="season-duration">
                      {{ formatSeasonDate(season.startDate) }} -
                      {{ formatSeasonDate(season.endDate!) }}
                    </span>
                  </div>
                  <div class="season-status">
                    <span class="status-badge completed">Completed</span>
                  </div>
                </div>

                <div class="season-stats">
                  <div class="stat-item">
                    <span class="stat-label">Battles:</span>
                    <span class="stat-value">{{ getSeasonBattleCount(season.id) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Duration:</span>
                    <span class="stat-value">{{ getSeasonDuration(season) }}</span>
                  </div>
                </div>

                <div class="season-actions">
                  <button class="btn btn-secondary btn-small" (click)="viewSeasonStats(season)">
                    View Results
                  </button>
                </div>
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

      <!-- Season Leaderboard Modal -->
      <app-season-leaderboard-modal
        [season]="selectedSeasonForStats"
        [isVisible]="isLeaderboardModalVisible"
        (closeModal)="closeLeaderboardModal()"
      ></app-season-leaderboard-modal>

      <!-- Finish Season Modal -->
      <app-finish-season-modal
        [season]="selectedSeasonToFinish"
        [isVisible]="isFinishSeasonModalVisible"
        (closeModal)="closeFinishSeasonModal()"
        (seasonFinished)="onSeasonFinished()"
      ></app-finish-season-modal>
    </div>
  `,
  styleUrl: './games.component.css',
})
export class GamesComponent {
  activeView: 'history' | 'seasons' = 'history';

  // Game Detail Modal state
  selectedGame: Game | null = null;
  selectedBattleNumber = 0;
  isModalVisible = false;

  // Game Creation Modal state
  isGameCreationModalVisible = false;

  // Season Leaderboard Modal state
  selectedSeasonForStats: Season | null = null;
  isLeaderboardModalVisible = false;

  // Finish Season Modal state
  selectedSeasonToFinish: Season | null = null;
  isFinishSeasonModalVisible = false;

  constructor(private gamesService: GamesService, private seasonsService: SeasonsService) {}

  // Computed property for games with formatted dates
  games = computed(() => {
    return this.gamesService.games().map((game) => ({
      ...game,
      formattedDate: this.formatGameDate(game.date),
    }));
  });

  // Season computed properties
  activeSeason = computed(() => this.seasonsService.activeSeason());
  previousSeasons = computed(() => this.seasonsService.previousSeasons());

  setActiveView(view: 'history' | 'seasons') {
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
    const game = this.gamesService.addGame(gameData);
    // Add game to current season if one exists
    if (game) {
      this.seasonsService.addGameToCurrentSeason(game.id);
    }
    this.closeGameCreationModal();
  }

  // Season methods
  hasActiveSeason(): boolean {
    return this.activeSeason() !== null;
  }

  createNewSeason(): void {
    const seasonCount = this.seasonsService.seasons().length + 1;
    const seasonName = `Season ${seasonCount}`;
    const description = `Competition season ${seasonCount} - Battle for glory and honor!`;

    this.seasonsService.createSeason(seasonName, description);
  }

  finishSeason(season: Season): void {
    this.selectedSeasonToFinish = season;
    this.isFinishSeasonModalVisible = true;
  }

  viewSeasonStats(season: Season): void {
    this.selectedSeasonForStats = season;
    this.isLeaderboardModalVisible = true;
  }

  formatSeasonDate(date: Date | null): string {
    if (!date) return 'Ongoing';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getSeasonBattleCount(seasonId: string): number {
    return this.seasonsService.getSeasonBattleCount(seasonId);
  }

  getSeasonPlayerCount(seasonId: string): number {
    return this.seasonsService.getSeasonPlayerCount(seasonId);
  }

  getSeasonDuration(season: Season): string {
    const startDate = new Date(season.startDate);
    const endDate = season.endDate ? new Date(season.endDate) : new Date();

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

  // Modal management methods
  closeLeaderboardModal(): void {
    this.selectedSeasonForStats = null;
    this.isLeaderboardModalVisible = false;
  }

  closeFinishSeasonModal(): void {
    this.selectedSeasonToFinish = null;
    this.isFinishSeasonModalVisible = false;
  }

  onSeasonFinished(): void {
    this.seasonsService.finishCurrentSeason();
    this.closeFinishSeasonModal();
  }

  // Clear all data and reset to fresh state
  clearAllData(): void {
    if (
      confirm(
        'Are you sure you want to clear ALL battles and seasons data? This will:\n\n• Delete all battle records\n• Reset to a fresh Season 1\n• Clear all player statistics\n• Save empty data files\n\nThis cannot be undone!'
      )
    ) {
      this.gamesService.clearAllGames();
      this.seasonsService.clearAllSeasons();
      alert(
        '✅ All data has been cleared!\n\n• Battle history: Empty\n• Seasons: Reset to Season 1\n• Data files: Updated\n\nYou now have a fresh start!'
      );
    }
  }
}

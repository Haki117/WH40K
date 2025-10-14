import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type SortOption = 'winrate' | 'games' | 'name' | 'rank';
type FilterOption = 'all' | 'active' | 'new';
type ViewMode = 'table' | 'cards';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scoreboard-tab">
      <div class="tab-header">
        <h2 class="tab-title">Scoreboard</h2>
        <p class="tab-subtitle">Player rankings and performance metrics</p>
      </div>

      <div class="scoreboard-controls">
        <div class="filters">
          <select
            class="filter-select"
            [(ngModel)]="filterOption"
            (ngModelChange)="onFilterChange()"
          >
            <option value="all">All Players ({{ getTotalPlayers() }})</option>
            <option value="active">Active Players ({{ getActivePlayers() }})</option>
            <option value="new">New Players ({{ getNewPlayers() }})</option>
          </select>

          <select class="sort-select" [(ngModel)]="sortOption" (ngModelChange)="onSortChange()">
            <option value="winrate">Sort by Win Rate</option>
            <option value="games">Sort by Games Played</option>
            <option value="name">Sort by Name</option>
            <option value="rank">Sort by Rank</option>
          </select>
        </div>

        <div class="view-controls">
          <button
            class="view-button"
            [class.active]="viewMode() === 'table'"
            (click)="setViewMode('table')"
          >
            <span class="view-icon">☰</span>
            Table
          </button>
          <button
            class="view-button"
            [class.active]="viewMode() === 'cards'"
            (click)="setViewMode('cards')"
          >
            <span class="view-icon">⚏</span>
            Cards
          </button>
        </div>
      </div>

      <!-- Table View -->
      <div class="scoreboard-table" *ngIf="viewMode() === 'table'">
        <table class="players-table">
          <thead>
            <tr>
              <th class="sortable" (click)="setSortOption('rank')">
                Rank
                <span class="sort-indicator" *ngIf="sortOption === 'rank'">↓</span>
              </th>
              <th class="sortable" (click)="setSortOption('name')">
                Player
                <span class="sort-indicator" *ngIf="sortOption === 'name'">↓</span>
              </th>
              <th class="sortable" (click)="setSortOption('winrate')">
                Win Rate
                <span class="sort-indicator" *ngIf="sortOption === 'winrate'">↓</span>
              </th>
              <th class="sortable" (click)="setSortOption('games')">
                Games Played
                <span class="sort-indicator" *ngIf="sortOption === 'games'">↓</span>
              </th>
              <th>Favorite Army</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let player of getFilteredPlayers(); let rank = index"
              [class.highlight]="rank < 3"
            >
              <td class="rank">
                <div class="rank-cell">
                  <span class="rank-number" [class.top-rank]="rank < 3">{{ rank + 1 }}</span>
                  <span class="rank-badge gold" *ngIf="rank === 0">🥇</span>
                  <span class="rank-badge silver" *ngIf="rank === 1">🥈</span>
                  <span class="rank-badge bronze" *ngIf="rank === 2">🥉</span>
                </div>
              </td>
              <td class="player">
                <div class="player-cell">
                  <div class="player-avatar-small">{{ player.id }}</div>
                  <div class="player-details">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-status" [class.online]="player.isActive">
                      {{ player.isActive ? 'Online' : 'Offline' }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="win-rate">
                <div class="win-rate-cell">
                  <span class="percentage" [class]="getWinRateClass(player.winRate)">
                    {{ player.winRate }}%
                  </span>
                  <div class="win-rate-bar">
                    <div
                      class="win-rate-fill"
                      [style.width.%]="player.winRate"
                      [class]="getWinRateClass(player.winRate)"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="games">
                <div class="games-cell">
                  <span class="games-total">{{ player.gamesPlayed }}</span>
                  <span class="games-breakdown">{{ player.wins }}W / {{ player.losses }}L</span>
                </div>
              </td>
              <td class="army">
                <span class="army-badge">{{ player.favoriteArmy }}</span>
              </td>
              <td class="last-active">
                <span class="last-active-text" [class.recent]="player.lastActiveText === 'Today'">
                  {{ player.lastActiveText }}
                </span>
              </td>
              <td class="actions">
                <div class="action-buttons">
                  <button class="btn btn-small btn-secondary">Profile</button>
                  <button class="btn btn-small btn-primary">Challenge</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards View -->
      <div class="scoreboard-cards" *ngIf="viewMode() === 'cards'">
        <div
          class="ranking-card"
          *ngFor="let player of getFilteredPlayers(); let rank = index"
          [class.top-rank]="rank < 3"
        >
          <div class="card-header">
            <div class="rank-info">
              <span class="rank-number" [class.top-rank]="rank < 3">{{ rank + 1 }}</span>
              <span class="rank-badge gold" *ngIf="rank === 0">🥇</span>
              <span class="rank-badge silver" *ngIf="rank === 1">🥈</span>
              <span class="rank-badge bronze" *ngIf="rank === 2">🥉</span>
            </div>
            <div class="player-info">
              <div class="player-avatar-medium">{{ player.id }}</div>
              <div class="player-details">
                <h3 class="player-name">{{ player.name }}</h3>
                <span class="player-status" [class.online]="player.isActive">
                  {{ player.isActive ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">Win Rate</span>
              <span class="stat-value" [class]="getWinRateClass(player.winRate)">
                {{ player.winRate }}%
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Games</span>
              <span class="stat-value">{{ player.gamesPlayed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Army</span>
              <span class="army-badge">{{ player.favoriteArmy }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary">View Profile</button>
            <button class="btn btn-primary">Challenge</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="getFilteredPlayers().length === 0">
        <div class="empty-icon">🏆</div>
        <h3>No Players Found</h3>
        <p>No players match your current filter criteria.</p>
      </div>
    </div>
  `,
  styleUrls: ['./ranking-scoreboard.component.css'],
})
export class RankingScoreboardComponent {
  viewMode = signal<ViewMode>('table');
  sortOption: SortOption = 'winrate';
  filterOption: FilterOption = 'all';

  players = [
    {
      id: 1,
      name: 'Player 1',
      winRate: 85,
      gamesPlayed: 30,
      wins: 26,
      losses: 4,
      favoriteArmy: 'Space Marines',
      lastActiveText: 'Today',
      isActive: true,
    },
    {
      id: 2,
      name: 'Player 2',
      winRate: 78,
      gamesPlayed: 28,
      wins: 22,
      losses: 6,
      favoriteArmy: 'Chaos Marines',
      lastActiveText: '1 day ago',
      isActive: true,
    },
    {
      id: 3,
      name: 'Player 3',
      winRate: 72,
      gamesPlayed: 25,
      wins: 18,
      losses: 7,
      favoriteArmy: 'Orks',
      lastActiveText: '2 days ago',
      isActive: false,
    },
    {
      id: 4,
      name: 'Player 4',
      winRate: 68,
      gamesPlayed: 22,
      wins: 15,
      losses: 7,
      favoriteArmy: 'Tyranids',
      lastActiveText: '3 days ago',
      isActive: true,
    },
    {
      id: 5,
      name: 'Player 5',
      winRate: 65,
      gamesPlayed: 20,
      wins: 13,
      losses: 7,
      favoriteArmy: 'Eldar',
      lastActiveText: '1 week ago',
      isActive: false,
    },
    {
      id: 6,
      name: 'Player 6',
      winRate: 58,
      gamesPlayed: 18,
      wins: 10,
      losses: 8,
      favoriteArmy: 'Imperial Guard',
      lastActiveText: '2 weeks ago',
      isActive: false,
    },
  ];

  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  setSortOption(option: SortOption) {
    this.sortOption = option;
  }

  onSortChange() {
    // Sorting logic will be implemented here
  }

  onFilterChange() {
    // Filtering logic will be implemented here
  }

  getFilteredPlayers() {
    let filtered = [...this.players];

    // Apply filter
    if (this.filterOption === 'active') {
      filtered = filtered.filter((p) => p.isActive);
    } else if (this.filterOption === 'new') {
      filtered = filtered.filter((p) => p.gamesPlayed <= 10);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (this.sortOption) {
        case 'winrate':
          return b.winRate - a.winRate;
        case 'games':
          return b.gamesPlayed - a.gamesPlayed;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.winRate - a.winRate;
      }
    });

    return filtered;
  }

  getTotalPlayers(): number {
    return this.players.length;
  }

  getActivePlayers(): number {
    return this.players.filter((p) => p.isActive).length;
  }

  getNewPlayers(): number {
    return this.players.filter((p) => p.gamesPlayed <= 10).length;
  }

  getWinRateClass(winRate: number): string {
    if (winRate >= 70) return 'high';
    if (winRate >= 50) return 'medium';
    return 'low';
  }
}

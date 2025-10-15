import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService } from '../../../services/games.service';
import { SeasonsService } from '../../../services/seasons.service';
import { PlayerService } from '../../../services/player.service';
import { Season, Game, Player } from '../../../models/player.models';

interface PlayerStats {
  player: Player;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalPoints: number;
  averagePoints: number;
}

interface ArmyStats {
  armyName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalPoints: number;
  averagePoints: number;
}

interface PlayerArmyStats {
  playerName: string;
  armyName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalPoints: number;
  averagePoints: number;
}

type DataScope = 'all' | string; // 'all' or season ID
type StatsType = 'players' | 'armies' | 'player-army';

@Component({
  selector: 'app-ranking-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scoreboard-container">
      <div class="tab-header">
        <h2 class="tab-title">Scoreboard & Statistics</h2>
        <p class="tab-subtitle">Win rates and performance metrics</p>
      </div>

      <div class="controls-section">
        <!-- Data Scope Selection -->
        <div class="control-group">
          <label for="dataScope">Data Scope:</label>
          <select
            id="dataScope"
            class="control-select"
            [ngModel]="selectedDataScope()"
            (ngModelChange)="setDataScope($event)"
          >
            <option value="all">All Data</option>
            <option *ngFor="let season of allSeasons()" [value]="season.id">
              {{ season.name }}
            </option>
          </select>
        </div>

        <!-- Statistics Type Selection -->
        <div class="control-group">
          <label for="statsType">Statistics Type:</label>
          <select
            id="statsType"
            class="control-select"
            [ngModel]="selectedStatsType()"
            (ngModelChange)="setStatsType($event)"
          >
            <option value="players">Players</option>
            <option value="armies">Armies</option>
            <option value="player-army">Player & Army Combinations</option>
          </select>
        </div>
      </div>

      <!-- Players Statistics -->
      <div class="stats-section" *ngIf="selectedStatsType() === 'players'">
        <h3 class="section-title">Player Rankings</h3>
        <div class="stats-table">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Games</th>
                <th>W-L-D</th>
                <th>Win Rate</th>
                <th>Avg Points</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let stat of playerStats(); let i = index" class="stats-row">
                <td>{{ i + 1 }}</td>
                <td>{{ stat.player.name }}</td>
                <td>{{ stat.gamesPlayed }}</td>
                <td>{{ stat.wins }}-{{ stat.losses }}-{{ stat.draws }}</td>
                <td>{{ stat.winRate.toFixed(1) }}%</td>
                <td>{{ stat.averagePoints.toFixed(1) }}</td>
              </tr>
              <tr *ngIf="playerStats().length === 0">
                <td colspan="6" class="no-data">No data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Army Statistics -->
      <div class="stats-section" *ngIf="selectedStatsType() === 'armies'">
        <h3 class="section-title">Army Rankings</h3>
        <div class="stats-table">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Army</th>
                <th>Games</th>
                <th>W-L-D</th>
                <th>Win Rate</th>
                <th>Avg Points</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let stat of armyStats(); let i = index" class="stats-row">
                <td>{{ i + 1 }}</td>
                <td>{{ stat.armyName }}</td>
                <td>{{ stat.gamesPlayed }}</td>
                <td>{{ stat.wins }}-{{ stat.losses }}-{{ stat.draws }}</td>
                <td>{{ stat.winRate.toFixed(1) }}%</td>
                <td>{{ stat.averagePoints.toFixed(1) }}</td>
              </tr>
              <tr *ngIf="armyStats().length === 0">
                <td colspan="6" class="no-data">No data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Player-Army Combinations Statistics -->
      <div class="stats-section" *ngIf="selectedStatsType() === 'player-army'">
        <h3 class="section-title">Player & Army Combinations</h3>
        <div class="stats-table">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Army</th>
                <th>Games</th>
                <th>W-L-D</th>
                <th>Win Rate</th>
                <th>Avg Points</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let stat of playerArmyStats(); let i = index" class="stats-row">
                <td>{{ i + 1 }}</td>
                <td>{{ stat.playerName }}</td>
                <td>{{ stat.armyName }}</td>
                <td>{{ stat.gamesPlayed }}</td>
                <td>{{ stat.wins }}-{{ stat.losses }}-{{ stat.draws }}</td>
                <td>{{ stat.winRate.toFixed(1) }}%</td>
                <td>{{ stat.averagePoints.toFixed(1) }}</td>
              </tr>
              <tr *ngIf="playerArmyStats().length === 0">
                <td colspan="7" class="no-data">No data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ranking-scoreboard-simple.component.css'],
})
export class RankingScoreboardComponent {
  // Reactive signals for UI state
  selectedDataScope = signal<DataScope>('all');
  selectedStatsType = signal<StatsType>('players');

  constructor(
    private gamesService: GamesService,
    private seasonsService: SeasonsService,
    private playerService: PlayerService
  ) {}

  // Basic data getters
  allPlayers = computed(() => this.playerService.players());
  allGames = computed(() => this.gamesService.games());
  allSeasons = computed(() => this.seasonsService.seasons());

  // Method to set data scope
  setDataScope(scope: DataScope) {
    this.selectedDataScope.set(scope);
  }

  // Method to set statistics type
  setStatsType(type: StatsType) {
    this.selectedStatsType.set(type);
  }

  // Filter games based on selected data scope
  filteredGames = computed(() => {
    const scope = this.selectedDataScope();
    const allGames = this.allGames();

    if (scope === 'all') {
      return allGames;
    } else {
      // Filter by season
      const season = this.allSeasons().find((s) => s.id === scope);
      if (season) {
        return allGames.filter((game) => season.gameIds.includes(game.id));
      }
      return [];
    }
  });

  // Calculate player statistics
  playerStats = computed(() => {
    const players = this.allPlayers();
    const games = this.filteredGames();

    if (players.length === 0) {
      return [];
    }

    return players
      .map((player) => {
        const playerGames = games.filter(
          (game) => game.player1.playerId === player.id || game.player2.playerId === player.id
        );

        let wins = 0;
        let losses = 0;
        let draws = 0;
        let totalPoints = 0;

        playerGames.forEach((game) => {
          if (game.winner === 'draw') {
            draws++;
          } else if (game.winner === 'player1' && game.player1.playerId === player.id) {
            wins++;
          } else if (game.winner === 'player2' && game.player2.playerId === player.id) {
            wins++;
          } else {
            losses++;
          }

          if (game.player1.playerId === player.id) {
            totalPoints += game.player1.totalPoints || 0;
          } else if (game.player2.playerId === player.id) {
            totalPoints += game.player2.totalPoints || 0;
          }
        });

        const gamesPlayed = playerGames.length;
        const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;
        const averagePoints = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;

        return {
          player,
          gamesPlayed,
          wins,
          losses,
          draws,
          winRate,
          totalPoints,
          averagePoints,
        };
      })
      .filter((stat) => stat.gamesPlayed > 0)
      .sort((a, b) => b.winRate - a.winRate);
  });

  // Calculate army statistics
  armyStats = computed(() => {
    const games = this.filteredGames();
    const armyStatsMap = new Map<
      string,
      {
        wins: number;
        losses: number;
        draws: number;
        totalPoints: number;
        gamesPlayed: number;
      }
    >();

    games.forEach((game) => {
      // Process player1's army
      const army1 = game.player1.army;
      if (!armyStatsMap.has(army1)) {
        armyStatsMap.set(army1, { wins: 0, losses: 0, draws: 0, totalPoints: 0, gamesPlayed: 0 });
      }
      const stats1 = armyStatsMap.get(army1)!;
      stats1.gamesPlayed++;
      stats1.totalPoints += game.player1.totalPoints || 0;

      // Process player2's army
      const army2 = game.player2.army;
      if (!armyStatsMap.has(army2)) {
        armyStatsMap.set(army2, { wins: 0, losses: 0, draws: 0, totalPoints: 0, gamesPlayed: 0 });
      }
      const stats2 = armyStatsMap.get(army2)!;
      stats2.gamesPlayed++;
      stats2.totalPoints += game.player2.totalPoints || 0;

      // Update win/loss/draw counts
      if (game.winner === 'draw') {
        stats1.draws++;
        stats2.draws++;
      } else if (game.winner === 'player1') {
        stats1.wins++;
        stats2.losses++;
      } else if (game.winner === 'player2') {
        stats1.losses++;
        stats2.wins++;
      }
    });

    return Array.from(armyStatsMap.entries())
      .map(([armyName, stats]) => ({
        armyName,
        gamesPlayed: stats.gamesPlayed,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
        totalPoints: stats.totalPoints,
        averagePoints: stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0,
      }))
      .filter((stat) => stat.gamesPlayed > 0)
      .sort((a, b) => b.winRate - a.winRate);
  });

  // Calculate player-army combination statistics
  playerArmyStats = computed(() => {
    const games = this.filteredGames();
    const playerArmyStatsMap = new Map<
      string,
      {
        playerName: string;
        armyName: string;
        wins: number;
        losses: number;
        draws: number;
        totalPoints: number;
        gamesPlayed: number;
      }
    >();

    games.forEach((game) => {
      // Process player1
      const key1 = `${game.player1.playerName}-${game.player1.army}`;
      if (!playerArmyStatsMap.has(key1)) {
        playerArmyStatsMap.set(key1, {
          playerName: game.player1.playerName,
          armyName: game.player1.army,
          wins: 0,
          losses: 0,
          draws: 0,
          totalPoints: 0,
          gamesPlayed: 0,
        });
      }
      const stats1 = playerArmyStatsMap.get(key1)!;
      stats1.gamesPlayed++;
      stats1.totalPoints += game.player1.totalPoints || 0;

      // Process player2
      const key2 = `${game.player2.playerName}-${game.player2.army}`;
      if (!playerArmyStatsMap.has(key2)) {
        playerArmyStatsMap.set(key2, {
          playerName: game.player2.playerName,
          armyName: game.player2.army,
          wins: 0,
          losses: 0,
          draws: 0,
          totalPoints: 0,
          gamesPlayed: 0,
        });
      }
      const stats2 = playerArmyStatsMap.get(key2)!;
      stats2.gamesPlayed++;
      stats2.totalPoints += game.player2.totalPoints || 0;

      // Update win/loss/draw counts
      if (game.winner === 'draw') {
        stats1.draws++;
        stats2.draws++;
      } else if (game.winner === 'player1') {
        stats1.wins++;
        stats2.losses++;
      } else if (game.winner === 'player2') {
        stats1.losses++;
        stats2.wins++;
      }
    });

    return Array.from(playerArmyStatsMap.values())
      .map((stats) => ({
        playerName: stats.playerName,
        armyName: stats.armyName,
        gamesPlayed: stats.gamesPlayed,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
        totalPoints: stats.totalPoints,
        averagePoints: stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0,
      }))
      .filter((stat) => stat.gamesPlayed > 0)
      .sort((a, b) => b.winRate - a.winRate);
  });
}

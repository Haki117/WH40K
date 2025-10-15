import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Season, SeasonStats } from '../models/player.models';
import { GamesService } from './games.service';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root',
})
export class SeasonsService {
  private readonly STORAGE_KEY = 'wh40k-club-seasons';
  private seasonsSignal = signal<Season[]>([]);

  // Public readonly signals
  seasons = this.seasonsSignal.asReadonly();

  // Computed properties
  activeSeason = computed(() => this.seasons().find((season) => season.isActive) || null);

  previousSeasons = computed(() => this.seasons().filter((season) => !season.isActive));

  constructor(
    private gamesService: GamesService,
    private playerService: PlayerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadSeasonsData();
  }

  // Load seasons data from localStorage
  private loadSeasonsData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const seasons = JSON.parse(savedData) as Season[];
        // Convert date strings back to Date objects
        const seasonsWithDates = seasons.map((season) => ({
          ...season,
          startDate: new Date(season.startDate),
          endDate: season.endDate ? new Date(season.endDate) : null,
        }));
        this.seasonsSignal.set(seasonsWithDates);
      } else {
        this.initializeDefaultSeason();
      }
    } catch (error) {
      console.error('Error loading seasons data:', error);
      this.initializeDefaultSeason();
    }
  }

  // Save seasons data to localStorage
  private saveSeasonsData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.seasons()));
    } catch (error) {
      console.error('Error saving seasons data:', error);
    }
  }

  // Clear all seasons data and start fresh
  clearAllSeasons(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.seasonsSignal.set([]);
    this.initializeDefaultSeason();
  }

  private initializeDefaultSeason(): void {
    // Create a default season if none exists
    if (this.seasons().length === 0) {
      const defaultSeason: Season = {
        id: this.generateId(),
        name: 'Season 1',
        startDate: new Date(),
        endDate: null,
        isActive: true,
        description: 'The first competitive season of WH40K Club Thun',
        gameIds: [],
      };

      this.seasonsSignal.set([defaultSeason]);

      // Add all existing games to the current season
      const allGames = this.gamesService.games();
      if (allGames.length > 0) {
        defaultSeason.gameIds = allGames.map((game) => game.id);
        this.seasonsSignal.set([defaultSeason]);
      }

      this.saveSeasonsData();
    }
  }

  createSeason(name: string, description?: string): Season {
    // Finish any active season first
    this.finishCurrentSeason();

    const newSeason: Season = {
      id: this.generateId(),
      name,
      startDate: new Date(),
      endDate: null,
      isActive: true,
      description,
      gameIds: [],
    };

    const currentSeasons = this.seasonsSignal();
    this.seasonsSignal.set([...currentSeasons, newSeason]);
    this.saveSeasonsData();

    return newSeason;
  }

  finishCurrentSeason(): void {
    const activeSeason = this.activeSeason();
    if (activeSeason) {
      const updatedSeason: Season = {
        ...activeSeason,
        endDate: new Date(),
        isActive: false,
      };

      const updatedSeasons = this.seasons().map((season) =>
        season.id === activeSeason.id ? updatedSeason : season
      );

      this.seasonsSignal.set(updatedSeasons);
      this.saveSeasonsData();
    }
  }

  addGameToCurrentSeason(gameId: string): void {
    const activeSeason = this.activeSeason();
    if (activeSeason && !activeSeason.gameIds.includes(gameId)) {
      const updatedSeason: Season = {
        ...activeSeason,
        gameIds: [...activeSeason.gameIds, gameId],
      };

      const updatedSeasons = this.seasons().map((season) =>
        season.id === activeSeason.id ? updatedSeason : season
      );

      this.seasonsSignal.set(updatedSeasons);
      this.saveSeasonsData();
    }
  }

  getSeasonStats(seasonId: string): SeasonStats[] {
    const season = this.seasons().find((s) => s.id === seasonId);
    if (!season) return [];

    const seasonGames = this.gamesService
      .games()
      .filter((game) => season.gameIds.includes(game.id));

    const playerStats = new Map<string, SeasonStats>();

    // Initialize stats for all players who participated in this season
    seasonGames.forEach((game) => {
      [game.player1, game.player2].forEach((player) => {
        if (!playerStats.has(player.playerId)) {
          playerStats.set(player.playerId, {
            seasonId,
            playerId: player.playerId,
            playerName: player.playerName,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            totalPoints: 0,
            averagePoints: 0,
            winRate: 0,
            rank: 0,
          });
        }
      });
    });

    // Calculate stats
    seasonGames.forEach((game) => {
      const player1Stats = playerStats.get(game.player1.playerId)!;
      const player2Stats = playerStats.get(game.player2.playerId)!;

      // Update games played
      player1Stats.gamesPlayed++;
      player2Stats.gamesPlayed++;

      // Update points
      player1Stats.totalPoints += game.player1.totalPoints;
      player2Stats.totalPoints += game.player2.totalPoints;

      // Update wins/losses/draws
      if (game.winner === 'player1') {
        player1Stats.wins++;
        player2Stats.losses++;
      } else if (game.winner === 'player2') {
        player2Stats.wins++;
        player1Stats.losses++;
      } else {
        player1Stats.draws++;
        player2Stats.draws++;
      }
    });

    // Calculate derived stats and convert to array
    const statsArray = Array.from(playerStats.values()).map((stats) => ({
      ...stats,
      averagePoints: stats.gamesPlayed > 0 ? Math.round(stats.totalPoints / stats.gamesPlayed) : 0,
      winRate: stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0,
    }));

    // Sort by total points (descending) and assign ranks
    statsArray.sort((a, b) => b.totalPoints - a.totalPoints);
    statsArray.forEach((stats, index) => {
      stats.rank = index + 1;
    });

    return statsArray;
  }

  getSeasonBattleCount(seasonId: string): number {
    const season = this.seasons().find((s) => s.id === seasonId);
    return season ? season.gameIds.length : 0;
  }

  getSeasonPlayerCount(seasonId: string): number {
    const season = this.seasons().find((s) => s.id === seasonId);
    if (!season) return 0;

    const seasonGames = this.gamesService
      .games()
      .filter((game) => season.gameIds.includes(game.id));

    const uniquePlayers = new Set<string>();
    seasonGames.forEach((game) => {
      uniquePlayers.add(game.player1.playerId);
      uniquePlayers.add(game.player2.playerId);
    });

    return uniquePlayers.size;
  }

  private generateId(): string {
    return 'season_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

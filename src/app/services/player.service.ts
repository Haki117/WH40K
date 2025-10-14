import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Player, PlayerStats } from '../models/player.models';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private platformId = inject(PLATFORM_ID);
  private readonly FILE_NAME = 'wh40k-club-players.json';
  private isDataLoaded = false;

  // Reactive signal for players data
  players = signal<Player[]>([]);

  constructor() {
    this.initializeDefaultPlayers();
  }

  private initializeDefaultPlayers() {
    const defaultPlayers: Player[] = [
      {
        id: 'romano-001',
        name: 'Romano',
        armies: ['Chaos Space Marines', 'Chaos Knights'],
        stats: {
          gamesPlayed: 23,
          wins: 15,
          losses: 8,
          winRate: 65,
          mostPlayedArmy: 'Chaos Space Marines',
          rank: 1,
        },
        avatar: 'R',
      },
      {
        id: 'burk-002',
        name: 'Burk',
        armies: ['Dark Angels', 'Tyranids'],
        stats: {
          gamesPlayed: 19,
          wins: 12,
          losses: 7,
          winRate: 63,
          mostPlayedArmy: 'Dark Angels',
          rank: 2,
        },
        avatar: 'B',
      },
      {
        id: 'doeni-003',
        name: 'Döni',
        armies: ['Aeldari', 'Drukhari'],
        stats: {
          gamesPlayed: 17,
          wins: 10,
          losses: 7,
          winRate: 59,
          mostPlayedArmy: 'Aeldari',
          rank: 3,
        },
        avatar: 'D',
      },
    ];

    this.players.set(defaultPlayers);
  }

  // Initialize app with notification about JSON workflow
  initializeApp() {
    if (!this.isDataLoaded && isPlatformBrowser(this.platformId)) {
      this.isDataLoaded = true;

      // Show info about JSON workflow
      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          const message = `📁 WH40K Club Thun now uses JSON files for data storage!

Your player data is no longer automatically saved. To keep your data:
• Use the "📤 Export" button to save your players to a JSON file
• Use the "📥 Import" button to load your saved data

Starting with default players (Romano, Burk, Döni).
Remember to export your data before closing the browser!`;

          alert(message);
        }
      }, 1000);
    }
  }

  // Track if data has been modified since last save
  private dataModified = false;

  // Mark data as modified (no automatic save)
  private markDataModified() {
    this.dataModified = true;

    // Optional: Show a visual indicator that data needs saving
    if (isPlatformBrowser(this.platformId)) {
      document.title = '* WH40K Club Thun (Unsaved Changes)';
    }
  }

  // Mark data as saved
  markDataSaved() {
    this.dataModified = false;
    if (isPlatformBrowser(this.platformId)) {
      document.title = 'WH40K Club Thun';
    }
  }

  // Check if there are unsaved changes
  hasUnsavedChanges(): boolean {
    return this.dataModified;
  }

  addPlayer(name: string, armies: string[], avatar?: string): Player {
    const newPlayer: Player = {
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      armies,
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        mostPlayedArmy: armies[0] || 'Unknown',
        rank: this.players().length + 1,
      },
      avatar: avatar || name.charAt(0).toUpperCase(),
    };

    const updatedPlayers = [...this.players(), newPlayer];
    this.players.set(updatedPlayers);
    this.markDataModified();
    return newPlayer;
  }

  updatePlayer(playerId: string, updates: Partial<Player>) {
    const players = this.players();
    const playerIndex = players.findIndex((p) => p.id === playerId);

    if (playerIndex !== -1) {
      const updatedPlayer = { ...players[playerIndex], ...updates };
      const updatedPlayers = [...players];
      updatedPlayers[playerIndex] = updatedPlayer;
      this.players.set(updatedPlayers);
      this.markDataModified();
    }
  }

  removePlayer(playerId: string) {
    const filteredPlayers = this.players().filter((p) => p.id !== playerId);
    this.players.set(filteredPlayers);
    this.markDataModified();
  }

  updatePlayerStats(playerId: string, gameResult: 'win' | 'loss', army: string) {
    const players = this.players();
    const playerIndex = players.findIndex((p) => p.id === playerId);

    if (playerIndex !== -1) {
      const player = players[playerIndex];
      const newStats: PlayerStats = {
        ...player.stats,
        gamesPlayed: player.stats.gamesPlayed + 1,
        wins: gameResult === 'win' ? player.stats.wins + 1 : player.stats.wins,
        losses: gameResult === 'loss' ? player.stats.losses + 1 : player.stats.losses,
        mostPlayedArmy: army,
      };

      newStats.winRate =
        newStats.gamesPlayed > 0 ? Math.round((newStats.wins / newStats.gamesPlayed) * 100) : 0;

      this.updatePlayer(playerId, {
        stats: newStats,
      });
    }
  }

  getPlayersByArmy(armyName: string): Player[] {
    return this.players().filter((player) =>
      player.armies.some((army) => army.toLowerCase().includes(armyName.toLowerCase()))
    );
  }

  getTopPlayers(count: number = 10): Player[] {
    return [...this.players()].sort((a, b) => b.stats.winRate - a.stats.winRate).slice(0, count);
  }

  searchPlayers(searchTerm: string): Player[] {
    if (!searchTerm.trim()) return this.players();

    const term = searchTerm.toLowerCase();
    return this.players().filter(
      (player) =>
        player.name.toLowerCase().includes(term) ||
        player.armies.some((army) => army.toLowerCase().includes(term))
    );
  }

  getPlayerById(playerId: string): Player | undefined {
    return this.players().find((player) => player.id === playerId);
  }

  exportPlayers(): string {
    return JSON.stringify(this.players(), null, 2);
  }

  importPlayers(jsonData: string): boolean {
    try {
      const importedPlayers = JSON.parse(jsonData);
      // Validate the data structure
      if (Array.isArray(importedPlayers) && importedPlayers.every((p) => p.id && p.name)) {
        this.players.set(importedPlayers);
        this.markDataModified();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Export/Import functionality
  exportPlayersToJson(): string {
    return JSON.stringify(this.players(), null, 2);
  }

  downloadPlayersJson(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const dataStr = this.exportPlayersToJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `wh40k-club-players-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Mark data as saved after successful download
    this.markDataSaved();
  }
  importPlayersFromJson(jsonData: string): { success: boolean; message: string } {
    try {
      const parsedData = JSON.parse(jsonData);

      // Validate the data structure
      if (!Array.isArray(parsedData)) {
        return { success: false, message: 'Invalid data format: Expected an array of players' };
      }

      // Validate each player object
      for (const player of parsedData) {
        if (!this.validatePlayerStructure(player)) {
          return { success: false, message: 'Invalid player data structure found' };
        }
      }

      this.players.set(parsedData);
      this.markDataSaved(); // Importing counts as saving

      return { success: true, message: `Successfully imported ${parsedData.length} players` };
    } catch (error) {
      return { success: false, message: 'Invalid JSON format or corrupted data' };
    }
  }

  private validatePlayerStructure(player: any): boolean {
    return (
      player &&
      typeof player.id === 'string' &&
      typeof player.name === 'string' &&
      Array.isArray(player.armies) &&
      player.stats &&
      typeof player.stats.gamesPlayed === 'number' &&
      typeof player.stats.wins === 'number' &&
      typeof player.stats.losses === 'number' &&
      typeof player.stats.winRate === 'number'
    );
  }
}

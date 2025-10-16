import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Player, PlayerStats } from '../models/player.models';
import { SharedStorageService } from './shared-storage.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly STORAGE_KEY = 'wh40k-club-players';
  private platformId = inject(PLATFORM_ID);
  private sharedStorage = inject(SharedStorageService);
  
  // Reactive signal for players data
  players = signal<Player[]>([]);

  constructor() {
    // Start with empty players array - no sample data
    this.loadPlayersData();
  }

  // Track if data has been modified since last save
  private dataModified = false;

  // Load players data from cloud storage with localStorage fallback
  private loadPlayersData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // First try to load from cloud storage
    this.sharedStorage.loadSharedData().subscribe({
      next: (cloudData) => {
        if (cloudData && cloudData.players) {
          this.players.set(cloudData.players);
          // Also save to localStorage as backup
          this.saveToLocalStorage(cloudData.players);
        } else {
          // Fallback to localStorage
          this.loadFromLocalStorage();
        }
      },
      error: () => {
        // Fallback to localStorage if cloud fails
        this.loadFromLocalStorage();
      }
    });
  }

  // Load from localStorage (fallback)
  private loadFromLocalStorage(): void {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const players = JSON.parse(savedData) as Player[];
        this.players.set(players);
      }
    } catch (error) {
      console.error('Error loading players from localStorage:', error);
    }
  }

  // Save to localStorage (backup)
  private saveToLocalStorage(players: Player[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players to localStorage:', error);
    }
  }

  // Save players data to cloud storage
  private savePlayersData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const playersData = this.players();
    
    // Save to cloud storage
    this.sharedStorage.saveSharedData('players', playersData).subscribe({
      next: (success) => {
        if (success) {
          this.markDataSaved();
          // Also save to localStorage as backup
          this.saveToLocalStorage(playersData);
        } else {
          console.error('Failed to save players to cloud storage');
          // Still save to localStorage
          this.saveToLocalStorage(playersData);
        }
      },
      error: (error) => {
        console.error('Error saving players to cloud:', error);
        // Fallback to localStorage
        this.saveToLocalStorage(playersData);
      }
    });
  }

  // Mark data as modified and save automatically
  private markDataModified() {
    this.dataModified = true;

    // Optional: Show a visual indicator that data needs saving
    if (isPlatformBrowser(this.platformId)) {
      document.title = '* WH40K Club Thun (Unsaved Changes)';
    }

    // Automatically save to localStorage
    this.savePlayersData();
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

  // Clear all players data
  clearAllPlayers(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.players.set([]);
    this.markDataSaved();
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
      this.markDataModified(); // This will trigger automatic save

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

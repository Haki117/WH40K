import { Injectable, signal, computed, Inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GameData, Player, Army, DEFAULT_ARMIES } from '../models/game.models';

@Injectable({
  providedIn: 'root',
})
export class GameDataService {
  private readonly STORAGE_KEY = 'warhammer40k-scoreboard-data';

  // Reactive signals for game data
  private gameDataSignal = signal<GameData>(this.getInitialGameData());

  // Public readonly computed signals
  public readonly gameData = this.gameDataSignal.asReadonly();
  public readonly players = computed(() => this.gameData().players);
  public readonly armies = computed(() => this.gameData().armies);
  public readonly gameStatus = computed(() => this.gameData().status);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only load data after the component is rendered in the browser
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.loadGameData();
      });
    }
  }

  private getInitialGameData(): GameData {
    return {
      players: [],
      armies: [...DEFAULT_ARMIES],
      gameTitle: 'Warhammer 40,000 Battle',
      gameDate: new Date().toISOString().split('T')[0],
      status: 'setup',
    };
  }

  // Load data from localStorage
  loadGameData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // We're on the server, just use initial data
      return;
    }

    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as GameData;
        // Ensure armies array includes defaults if missing
        if (!parsedData.armies || parsedData.armies.length === 0) {
          parsedData.armies = [...DEFAULT_ARMIES];
        }
        // Migrate old data structure if needed
        if (parsedData.players) {
          parsedData.players = parsedData.players.map((player: any) => {
            // Convert old single army to armies array
            if (player.army && !player.armies) {
              return {
                ...player,
                armies: [player.army],
                army: undefined,
              };
            }
            return player;
          }) as Player[];
        }
        this.gameDataSignal.set(parsedData);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
      this.gameDataSignal.set(this.getInitialGameData());
    }
  }

  // Save data to localStorage
  saveGameData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // We're on the server, can't save to localStorage
      return;
    }

    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.gameDataSignal()));
      console.log('Game data saved successfully');
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }

  // Player management methods
  addPlayer(name: string, armies: string[]): void {
    const currentData = this.gameDataSignal();
    const newPlayer: Player = {
      id: this.generateId(),
      name: name.trim(),
      armies: armies,
      score: 0,
      victories: 0,
      defeats: 0,
    };

    const updatedData = {
      ...currentData,
      players: [...currentData.players, newPlayer],
    };

    this.gameDataSignal.set(updatedData);
    this.saveGameData();
  }

  removePlayer(playerId: string): void {
    const currentData = this.gameDataSignal();
    const updatedData = {
      ...currentData,
      players: currentData.players.filter((p: Player) => p.id !== playerId),
    };

    this.gameDataSignal.set(updatedData);
    this.saveGameData();
  }

  updatePlayer(playerId: string, updates: Partial<Player>): void {
    const currentData = this.gameDataSignal();
    const updatedData = {
      ...currentData,
      players: currentData.players.map((p: Player) =>
        p.id === playerId ? { ...p, ...updates } : p
      ),
    };

    this.gameDataSignal.set(updatedData);
    this.saveGameData();
  }

  // Army management methods
  addCustomArmy(army: Army): void {
    const currentData = this.gameDataSignal();
    const updatedData = {
      ...currentData,
      armies: [...currentData.armies, army],
    };

    this.gameDataSignal.set(updatedData);
    this.saveGameData();
  }

  // Game state management
  updateGameStatus(status: GameData['status']): void {
    const currentData = this.gameDataSignal();
    const updatedData = {
      ...currentData,
      status,
    };

    this.gameDataSignal.set(updatedData);
    this.saveGameData();
  }

  updateGameInfo(title: string, date: string): void {
    const currentData = this.gameDataSignal();
    const updatedData = {
      ...currentData,
      gameTitle: title,
      gameDate: date,
    };

    this.gameDataSignal.set(updatedData);
    this.saveGameData();
  }

  // Reset all data
  resetGameData(): void {
    this.gameDataSignal.set(this.getInitialGameData());
    this.saveGameData();
  }

  // Export data as JSON
  exportGameData(): string {
    return JSON.stringify(this.gameDataSignal(), null, 2);
  }

  // Import data from JSON
  importGameData(jsonData: string): boolean {
    try {
      const parsedData = JSON.parse(jsonData) as GameData;
      this.gameDataSignal.set(parsedData);
      this.saveGameData();
      return true;
    } catch (error) {
      console.error('Error importing game data:', error);
      return false;
    }
  }

  // Utility methods
  private generateId(): string {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get players by army
  getPlayersByArmy(armyName: string): Player[] {
    return this.players().filter((p: Player) => p.armies.includes(armyName));
  }

  // Get army usage statistics
  getArmyUsageStats(): Array<{ army: string; playerCount: number; players: string[] }> {
    const players = this.players();
    const armyStats: { [key: string]: { playerCount: number; players: string[] } } = {};

    players.forEach((player: Player) => {
      player.armies.forEach((army: string) => {
        if (!armyStats[army]) {
          armyStats[army] = { playerCount: 0, players: [] };
        }
        armyStats[army].playerCount++;
        if (!armyStats[army].players.includes(player.name)) {
          armyStats[army].players.push(player.name);
        }
      });
    });

    return Object.entries(armyStats).map(([army, stats]) => ({
      army,
      ...stats,
    }));
  }
}

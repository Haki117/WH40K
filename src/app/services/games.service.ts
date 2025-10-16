import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Game, GameFormData, GamePlayer } from '../models/player.models';
import { PlayerService } from './player.service';
import { SharedStorageService } from './shared-storage.service';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private readonly STORAGE_KEY = 'wh40k-club-games';
  private gamesSignal = signal<Game[]>([]);

  // Public readonly signal
  games = this.gamesSignal.asReadonly();

  constructor(
    private playerService: PlayerService,
    private sharedStorage: SharedStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadGamesData();
  }

  // Load games data from cloud storage with localStorage fallback
  private loadGamesData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // First try to load from cloud storage
    this.sharedStorage.loadSharedData().subscribe({
      next: (cloudData) => {
        if (cloudData && cloudData.games) {
          // Convert date strings back to Date objects
          const gamesWithDates = cloudData.games.map((game: any) => ({
            ...game,
            date: new Date(game.date),
          }));
          this.gamesSignal.set(gamesWithDates);
          this.updatePlayerStats();
          // Also save to localStorage as backup
          this.saveToLocalStorage(gamesWithDates);
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
        const games = JSON.parse(savedData) as Game[];
        // Convert date strings back to Date objects
        const gamesWithDates = games.map((game) => ({
          ...game,
          date: new Date(game.date),
        }));
        this.gamesSignal.set(gamesWithDates);
        this.updatePlayerStats();
      }
    } catch (error) {
      console.error('Error loading games from localStorage:', error);
    }
  }

  // Save to localStorage (backup)
  private saveToLocalStorage(games: Game[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error('Error saving games to localStorage:', error);
    }
  }

  // Save games data to cloud storage
  private saveGamesData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const gamesData = this.games();
    
    // Save to cloud storage
    this.sharedStorage.saveSharedData('games', gamesData).subscribe({
      next: (success) => {
        if (success) {
          // Also save to localStorage as backup
          this.saveToLocalStorage(gamesData);
        } else {
          console.error('Failed to save games to cloud storage');
          // Still save to localStorage
          this.saveToLocalStorage(gamesData);
        }
      },
      error: (error) => {
        console.error('Error saving games to cloud:', error);
        // Fallback to localStorage
        this.saveToLocalStorage(gamesData);
      }
    });
  }

  // Clear all games data and start fresh
  clearAllGames(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.gamesSignal.set([]);
    this.updatePlayerStats();
  }

  private initializeWithSampleGames() {
    // Get today's date
    const today = new Date();

    // Create sample games based on user's request
    const sampleGames: Game[] = [
      {
        id: this.generateId(),
        date: today,
        player1: {
          playerId: 'burk-002',
          playerName: 'Burk',
          army: 'Dark Angels',
          result: 'loss',
          armyList: 'Azrael, Intercessors x2, Hellblasters, Redemptor Dreadnought',
          deployment: 'Hammer and Anvil',
          twists: 'Dense Cover, Maelstrom of War',
          fullyPaintedPoints: 10,
          primaryPoints: 10,
          secondaryPoints: 10,
          totalPoints: 30,
        },
        player2: {
          playerId: 'romano-001',
          playerName: 'Romano',
          army: 'Chaos Space Marines',
          result: 'win',
          armyList: 'Chaos Lord, Legionnaires x3, Helbrute, Venomcrawler',
          deployment: 'Hammer and Anvil',
          twists: 'Dense Cover, Maelstrom of War',
          fullyPaintedPoints: 10,
          primaryPoints: 30,
          secondaryPoints: 30,
          totalPoints: 70,
        },
        winner: 'player2',
      },
      {
        id: this.generateId(),
        date: today,
        player1: {
          playerId: 'burk-002',
          playerName: 'Burk',
          army: 'Dark Angels',
          result: 'loss',
          armyList: 'Captain, Intercessors x2, Aggressors, Impulsor',
          deployment: 'Search and Destroy',
          twists: 'Night Fighting, Orbital Bombardment',
          fullyPaintedPoints: 10,
          primaryPoints: 15,
          secondaryPoints: 5,
          totalPoints: 30,
        },
        player2: {
          playerId: 'doeni-003',
          playerName: 'Döni',
          army: 'Aeldari',
          result: 'win',
          armyList: 'Farseer, Guardian Defenders x2, Fire Dragons, Wave Serpent',
          deployment: 'Search and Destroy',
          twists: 'Night Fighting, Orbital Bombardment',
          fullyPaintedPoints: 10,
          primaryPoints: 35,
          secondaryPoints: 25,
          totalPoints: 70,
        },
        winner: 'player2',
      },
      {
        id: this.generateId(),
        date: today,
        player1: {
          playerId: 'burk-002',
          playerName: 'Burk',
          army: 'Tyranids',
          result: 'loss',
          armyList: 'Hive Tyrant, Termagants x3, Carnifex, Genestealers',
          deployment: 'Dawn of War',
          twists: 'Acid Rain, Seismic Activity',
          fullyPaintedPoints: 10,
          primaryPoints: 5,
          secondaryPoints: 15,
          totalPoints: 30,
        },
        player2: {
          playerId: 'romano-001',
          playerName: 'Romano',
          army: 'Chaos Space Marines',
          result: 'win',
          armyList: 'Chaos Sorcerer, Rubric Marines x2, Forgefiend, Cultists',
          deployment: 'Dawn of War',
          twists: 'Acid Rain, Seismic Activity',
          fullyPaintedPoints: 10,
          primaryPoints: 40,
          secondaryPoints: 20,
          totalPoints: 70,
        },
        winner: 'player2',
      },
      {
        id: this.generateId(),
        date: today,
        player1: {
          playerId: 'romano-001',
          playerName: 'Romano',
          army: 'Chaos Space Marines',
          result: 'loss',
          armyList: 'Daemon Prince, Noise Marines x2, Maulerfiend, Havocs',
          deployment: 'Crucible of Battle',
          twists: 'Psychic Maelstrom, Gravity Wells',
          fullyPaintedPoints: 10,
          primaryPoints: 20,
          secondaryPoints: 0,
          totalPoints: 30,
        },
        player2: {
          playerId: 'doeni-003',
          playerName: 'Döni',
          army: 'Aeldari',
          result: 'win',
          armyList: 'Autarch, Dire Avengers x3, Wraithlord, Rangers',
          deployment: 'Crucible of Battle',
          twists: 'Psychic Maelstrom, Gravity Wells',
          fullyPaintedPoints: 10,
          primaryPoints: 30,
          secondaryPoints: 30,
          totalPoints: 70,
        },
        winner: 'player2',
      },
      {
        id: this.generateId(),
        date: today,
        player1: {
          playerId: 'doeni-003',
          playerName: 'Döni',
          army: 'Aeldari',
          result: 'loss',
          armyList: 'Warlock Skyrunner, Windrider x2, War Walker, Howling Banshees',
          deployment: 'Spearhead Assault',
          twists: 'Warp Storm, Empyric Echoes',
          fullyPaintedPoints: 10,
          primaryPoints: 10,
          secondaryPoints: 10,
          totalPoints: 30,
        },
        player2: {
          playerId: 'burk-002',
          playerName: 'Burk',
          army: 'Tyranids',
          result: 'win',
          armyList: 'Neurothrope, Hormagaunts x3, Tyrannofex, Warriors',
          deployment: 'Spearhead Assault',
          twists: 'Warp Storm, Empyric Echoes',
          fullyPaintedPoints: 10,
          primaryPoints: 25,
          secondaryPoints: 35,
          totalPoints: 70,
        },
        winner: 'player2',
      },
    ];

    this.gamesSignal.set(sampleGames);
    this.updatePlayerStats();
    this.saveGamesData();
  }

  addGame(gameData: GameFormData): Game {
    const player1 = this.playerService.getPlayerById(gameData.player1Id);
    const player2 = this.playerService.getPlayerById(gameData.player2Id);

    if (!player1 || !player2) {
      throw new Error('One or both players not found');
    }

    // Calculate total points for each player
    const player1TotalPoints =
      gameData.player1FullyPaintedPoints +
      gameData.player1PrimaryPoints +
      gameData.player1SecondaryPoints;
    const player2TotalPoints =
      gameData.player2FullyPaintedPoints +
      gameData.player2PrimaryPoints +
      gameData.player2SecondaryPoints;

    const game: Game = {
      id: this.generateId(),
      date: gameData.battleDate,
      player1: {
        playerId: gameData.player1Id,
        playerName: player1.name,
        army: gameData.player1Army,
        result:
          gameData.winner === 'player1' ? 'win' : gameData.winner === 'draw' ? 'draw' : 'loss',
        armyList: gameData.player1ArmyList,
        deployment: gameData.player1Deployment,
        twists: gameData.player1Twists,
        fullyPaintedPoints: gameData.player1FullyPaintedPoints,
        primaryPoints: gameData.player1PrimaryPoints,
        secondaryPoints: gameData.player1SecondaryPoints,
        totalPoints: player1TotalPoints,
      },
      player2: {
        playerId: gameData.player2Id,
        playerName: player2.name,
        army: gameData.player2Army,
        result:
          gameData.winner === 'player2' ? 'win' : gameData.winner === 'draw' ? 'draw' : 'loss',
        armyList: gameData.player2ArmyList,
        deployment: gameData.player2Deployment,
        twists: gameData.player2Twists,
        fullyPaintedPoints: gameData.player2FullyPaintedPoints,
        primaryPoints: gameData.player2PrimaryPoints,
        secondaryPoints: gameData.player2SecondaryPoints,
        totalPoints: player2TotalPoints,
      },
      winner: gameData.winner,
      notes: gameData.notes,
    };

    const currentGames = this.gamesSignal();
    this.gamesSignal.set([game, ...currentGames]);
    this.updatePlayerStats();
    this.saveGamesData();

    return game;
  }

  getGameById(id: string): Game | undefined {
    return this.gamesSignal().find((game) => game.id === id);
  }

  getGamesByPlayer(playerId: string): Game[] {
    return this.gamesSignal().filter(
      (game) => game.player1.playerId === playerId || game.player2.playerId === playerId
    );
  }

  getGamesByDateRange(startDate: Date, endDate: Date): Game[] {
    return this.gamesSignal().filter((game) => game.date >= startDate && game.date <= endDate);
  }

  private updatePlayerStats(): void {
    const players = this.playerService.players();
    const games = this.gamesSignal();

    players.forEach((player) => {
      const playerGames = games.filter(
        (game) => game.player1.playerId === player.id || game.player2.playerId === player.id
      );

      let wins = 0;
      let losses = 0;
      const armyCounts: { [army: string]: number } = {};

      playerGames.forEach((game) => {
        const playerInGame = game.player1.playerId === player.id ? game.player1 : game.player2;

        if (playerInGame.result === 'win') wins++;
        if (playerInGame.result === 'loss') losses++;

        // Count army usage
        armyCounts[playerInGame.army] = (armyCounts[playerInGame.army] || 0) + 1;
      });

      const gamesPlayed = playerGames.length;
      const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

      // Find most played army
      const mostPlayedArmy = Object.keys(armyCounts).reduce(
        (a, b) => (armyCounts[a] > armyCounts[b] ? a : b),
        player.armies[0] || ''
      );

      // Update player stats
      this.playerService.updatePlayer(player.id, {
        stats: {
          gamesPlayed,
          wins,
          losses,
          winRate,
          mostPlayedArmy,
          rank: player.stats.rank, // Keep existing rank for now
        },
      });
    });

    // Update ranks based on win rates
    this.updatePlayerRanks();
  }

  private updatePlayerRanks(): void {
    const players = this.playerService.players();

    // Sort players by win rate (descending), then by games played (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.stats.winRate !== b.stats.winRate) {
        return b.stats.winRate - a.stats.winRate;
      }
      return b.stats.gamesPlayed - a.stats.gamesPlayed;
    });

    // Update ranks
    sortedPlayers.forEach((player, index) => {
      this.playerService.updatePlayer(player.id, {
        stats: {
          ...player.stats,
          rank: index + 1,
        },
      });
    });
  }

  private generateId(): string {
    return 'game-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

export interface Player {
  id: string;
  name: string;
  armies: string[];
  stats: PlayerStats;
  avatar?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  mostPlayedArmy: string;
  rank: number;
}

export interface Army {
  name: string;
  faction: 'Imperium' | 'Chaos' | 'Xenos' | 'Aeldari';
  color: string;
  icon: string;
  description?: string;
}

export interface Game {
  id: string;
  date: Date;
  player1: GamePlayer;
  player2: GamePlayer;
  winner: 'player1' | 'player2' | 'draw';
  notes?: string;
}

export interface GamePlayer {
  playerId: string;
  playerName: string;
  army: string;
  result: 'win' | 'loss' | 'draw';
  armyList?: string; // Expandable field for army list details
  deployment?: string;
  twists?: string;
  fullyPaintedPoints: number; // Always 10
  primaryPoints: number; // 0-45
  secondaryPoints: number; // 0-45
  totalPoints: number; // 0-100 (calculated)
}

export interface GameFormData {
  player1Id: string;
  player1Army: string;
  player1ArmyList?: string;
  player1Deployment?: string;
  player1Twists?: string;
  player1FullyPaintedPoints: number;
  player1PrimaryPoints: number;
  player1SecondaryPoints: number;
  player2Id: string;
  player2Army: string;
  player2ArmyList?: string;
  player2Deployment?: string;
  player2Twists?: string;
  player2FullyPaintedPoints: number;
  player2PrimaryPoints: number;
  player2SecondaryPoints: number;
  winner: 'player1' | 'player2' | 'draw';
  notes?: string;
}

export const WARHAMMER_ARMIES: Army[] = [
  // Imperium
  {
    name: 'Space Marines',
    faction: 'Imperium',
    color: '#1e40af',
    icon: '⚔',
    description: "The Emperor's finest warriors",
  },

  {
    name: 'Black Templars',
    faction: 'Imperium',
    color: '#000000ff',
    icon: '✠',
    description: 'Crusading Zealots',
  },
  {
    name: 'Blood Angels',
    faction: 'Imperium',
    color: '#dc2626',
    icon: '🩸',
    description: 'Sons of Sanguinius',
  },
  {
    name: 'Dark Angels',
    faction: 'Imperium',
    color: '#059669',
    icon: '⚔',
    description: 'The First Legion',
  },
  {
    name: 'Space Wolves',
    faction: 'Imperium',
    color: '#6b7280',
    icon: '🐺',
    description: "The Emperor's Executioners",
  },
  {
    name: 'Imperial Guard',
    faction: 'Imperium',
    color: '#a3a3a3',
    icon: '🎖',
    description: 'Hammer of the Emperor',
  },
  {
    name: 'Adeptus Mechanicus',
    faction: 'Imperium',
    color: '#ef4444',
    icon: '⚙',
    description: 'Quest for Knowledge',
  },
  {
    name: 'Imperial Knights',
    faction: 'Imperium',
    color: '#fbbf24',
    icon: '🏰',
    description: 'Noble Houses',
  },
  {
    name: 'Sisters of Battle',
    faction: 'Imperium',
    color: '#7c2d12',
    icon: '✠',
    description: "Adepta Sororitas - Emperor's Daughters",
  },

  // Chaos
  {
    name: 'Chaos Space Marines',
    faction: 'Chaos',
    color: '#7c2d12',
    icon: '☠',
    description: 'Traitor Legions',
  },
  {
    name: 'Death Guard',
    faction: 'Chaos',
    color: '#65a30d',
    icon: '☣',
    description: "Nurgle's Chosen",
  },
  {
    name: 'Thousand Sons',
    faction: 'Chaos',
    color: '#2563eb',
    icon: '◉',
    description: "Tzeentch's Sorcerers",
  },
  {
    name: 'World Eaters',
    faction: 'Chaos',
    color: '#dc2626',
    icon: '⚡',
    description: "Khorne's Berserkers",
  },
  {
    name: 'Chaos Knights',
    faction: 'Chaos',
    color: '#7c2d12',
    icon: '🏰',
    description: 'Fallen Houses',
  },
  {
    name: 'Chaos Daemons',
    faction: 'Chaos',
    color: '#a21caf',
    icon: '👹',
    description: 'Warp Entities',
  },

  // Xenos
  {
    name: 'Tyranids',
    faction: 'Xenos',
    color: '#7c3aed',
    icon: '🦎',
    description: 'Great Devourer',
  },
  { name: 'Orks', faction: 'Xenos', color: '#16a34a', icon: '⚡', description: 'WAAAGH!' },
  {
    name: 'Necrons',
    faction: 'Xenos',
    color: '#374151',
    icon: '⚱',
    description: 'Ancient Machines',
  },
  {
    name: 'Tau Empire',
    faction: 'Xenos',
    color: '#0ea5e9',
    icon: '🎯',
    description: 'For the Greater Good',
  },
  {
    name: 'Genestealer Cults',
    faction: 'Xenos',
    color: '#a855f7',
    icon: '⬡',
    description: 'Hidden Corruption',
  },

  // Aeldari
  {
    name: 'Aeldari',
    faction: 'Aeldari',
    color: '#0891b2',
    icon: '◊',
    description: 'Craftworld Eldar',
  },
  { name: 'Drukhari', faction: 'Aeldari', color: '#1f2937', icon: '🗡', description: 'Dark Eldar' },
];

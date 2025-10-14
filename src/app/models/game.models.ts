export interface Player {
  id: string;
  name: string;
  armies: string[];
  score?: number;
  victories?: number;
  defeats?: number;
}

export interface Army {
  name: string;
  faction: string;
  color?: string;
  icon?: string;
}

export interface GameData {
  players: Player[];
  armies: Army[];
  gameTitle?: string;
  gameDate?: string;
  status: 'setup' | 'in-progress' | 'completed';
}

// Popular Warhammer 40k armies for initial setup
export const DEFAULT_ARMIES: Army[] = [
  { name: 'Space Marines', faction: 'Space Marines', color: '#003d82', icon: '⚔️' },
  { name: 'Space Wolves', faction: 'Space Marines', color: '#304a55ff', icon: '⚔️' },
  { name: 'Dark Angels', faction: 'Space Marines', color: '#025e19ff', icon: '⚔️' },
  { name: 'Blood Angels', faction: 'Space Marines', color: '#f04603ff', icon: '⚔️' },
  { name: 'Black Templars', faction: 'Space Marines', color: '#000000ff', icon: '⚔️' },
  { name: 'Chaos Space Marines', faction: 'Chaos', color: '#8B0000', icon: '💀' },
  { name: 'Thousand Sons', faction: 'Chaos', color: '#360bf1ff', icon: '💀' },
  { name: 'Emperors Children', faction: 'Chaos', color: '#8b0749ff', icon: '💀' },
  { name: 'Death Guard', faction: 'Chaos', color: '#06d128ff', icon: '💀' },
  { name: 'World Eaters', faction: 'Chaos', color: '#5c0404ff', icon: '💀' },
  { name: 'Daemons', faction: 'Chaos', color: '#8B008B', icon: '👹' },
  { name: 'Chaos Knights', faction: 'Chaos', color: '#141313ff', icon: '🛡️' },
  { name: 'Orks', faction: 'Xenos', color: '#2d5016', icon: '🔥' },
  { name: 'Aeldari', faction: 'Xenos', color: '#FFD700', icon: '✨' },
  { name: 'Drukhari', faction: 'Xenos', color: '#2F4F4F', icon: '🗡️' },
  { name: 'Tyranids', faction: 'Xenos', color: '#4A0080', icon: '🦂' },
  { name: 'Necrons', faction: 'Xenos', color: '#C0C0C0', icon: '💀' },
  { name: 'Tau Empire', faction: 'Xenos', color: '#00CED1', icon: '🎯' },
  { name: 'Leagues of Votann', faction: 'Xenos', color: '#faf60bff', icon: '🎯' },
  { name: 'Imperial Guard', faction: 'Imperium', color: '#07681fff', icon: '🛡️' },
  { name: 'Imperial Knights', faction: 'Imperium', color: '#272626ff', icon: '🛡️' },
  { name: 'Sisters of Battle', faction: 'Imperium', color: '#979595ff', icon: '🛡️' },
  { name: 'Adeptus Mechanicus', faction: 'Imperium', color: '#bb2323ff', icon: '🛡️' },
];

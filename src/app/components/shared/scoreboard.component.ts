import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameDataService } from '../../services/game-data.service';
import { Player, Army } from '../../models/game.models';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.css',
})
export class ScoreboardComponent {
  private gameDataService = inject(GameDataService);

  // Reactive data from service
  gameData = this.gameDataService.gameData;
  players = this.gameDataService.players;
  armies = this.gameDataService.armies;
  gameStatus = this.gameDataService.gameStatus;

  // Form signals for adding players
  newPlayerName = signal('');
  selectedArmies = signal<string[]>([]);

  // Form signals for editing players
  editingPlayerId = signal<string | null>(null);
  editPlayerName = signal('');
  editSelectedArmies = signal<string[]>([]);

  // UI state
  showAddPlayerForm = signal(false);

  // Player management methods
  addPlayer(): void {
    const name = this.newPlayerName().trim();
    const armies = this.selectedArmies();

    if (name && armies.length > 0) {
      this.gameDataService.addPlayer(name, armies);
      this.newPlayerName.set('');
      this.selectedArmies.set([]);
      this.showAddPlayerForm.set(false);
    }
  }

  removePlayer(playerId: string): void {
    if (confirm('Are you sure you want to remove this player?')) {
      this.gameDataService.removePlayer(playerId);
    }
  }

  updatePlayerScore(playerId: string, newScore: number): void {
    this.gameDataService.updatePlayer(playerId, { score: newScore });
  }

  // Edit player methods
  startEditingPlayer(player: Player): void {
    this.editingPlayerId.set(player.id);
    this.editPlayerName.set(player.name);
    this.editSelectedArmies.set([...player.armies]);
    this.showAddPlayerForm.set(false); // Hide add form if open
  }

  savePlayerEdit(): void {
    const playerId = this.editingPlayerId();
    const name = this.editPlayerName().trim();
    const armies = this.editSelectedArmies();

    if (playerId && name && armies.length > 0) {
      this.gameDataService.updatePlayer(playerId, {
        name: name,
        armies: armies,
      });
      this.cancelPlayerEdit();
    }
  }

  cancelPlayerEdit(): void {
    this.editingPlayerId.set(null);
    this.editPlayerName.set('');
    this.editSelectedArmies.set([]);
  }

  isEditingPlayer(playerId: string): boolean {
    return this.editingPlayerId() === playerId;
  }

  // Edit army checkbox methods
  toggleEditArmySelection(armyName: string): void {
    const currentSelection = this.editSelectedArmies();
    const index = currentSelection.indexOf(armyName);

    if (index > -1) {
      // Remove army from selection
      this.editSelectedArmies.set(currentSelection.filter((a) => a !== armyName));
    } else {
      // Add army to selection
      this.editSelectedArmies.set([...currentSelection, armyName]);
    }
  }

  isEditArmySelected(armyName: string): boolean {
    return this.editSelectedArmies().includes(armyName);
  }

  // Army-related methods
  getArmyColor(armyName: string): string {
    const army = this.armies().find((a: Army) => a.name === armyName);
    return army?.color || '#666666';
  }

  getArmyIcon(armyName: string): string {
    const army = this.armies().find((a: Army) => a.name === armyName);
    return army?.icon || '⚔️';
  }

  getArmyFaction(armyName: string): string {
    const army = this.armies().find((a: Army) => a.name === armyName);
    return army?.faction || 'Unknown';
  }

  // Get players grouped by army
  getArmyUsageStats() {
    return this.gameDataService.getArmyUsageStats();
  }

  // Army checkbox methods
  toggleArmySelection(armyName: string): void {
    const currentSelection = this.selectedArmies();
    const index = currentSelection.indexOf(armyName);

    if (index > -1) {
      // Remove army from selection
      this.selectedArmies.set(currentSelection.filter((a) => a !== armyName));
    } else {
      // Add army to selection
      this.selectedArmies.set([...currentSelection, armyName]);
    }
  }

  isArmySelected(armyName: string): boolean {
    return this.selectedArmies().includes(armyName);
  }

  // Cancel add player form
  cancelAddPlayer(): void {
    this.newPlayerName.set('');
    this.selectedArmies.set([]);
    this.showAddPlayerForm.set(false);
  }

  // Game state methods
  startGame(): void {
    this.gameDataService.updateGameStatus('in-progress');
  }

  resetGame(): void {
    if (
      confirm(
        'Are you sure you want to reset the entire game? This will remove all players and data.'
      )
    ) {
      this.gameDataService.resetGameData();
    }
  }

  // Export/Import functionality
  exportData(): void {
    const dataStr = this.gameDataService.exportGameData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `warhammer40k-scoreboard-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // File input handler for import
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (this.gameDataService.importGameData(content)) {
          alert('Game data imported successfully!');
        } else {
          alert('Error importing game data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  // TrackBy functions for performance optimization
  trackByPlayerId(index: number, player: Player): string {
    return player.id;
  }

  trackByArmyName(index: number, army: Army): string {
    return army.name;
  }

  // Calculate total score of all players
  getTotalScore(): number {
    return this.players().reduce((sum: number, p: Player) => sum + (p.score || 0), 0);
  }
}

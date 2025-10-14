import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../../services/player.service';
import { Player, WARHAMMER_ARMIES } from '../../../models/player.models';
import { PlayerDetailModalComponent } from '../../shared/player-detail-modal/player-detail-modal.component';
import { ArmyManagementModalComponent } from '../../shared/army-management-modal/army-management-modal.component';
import {
  PlayerFormModalComponent,
  PlayerFormData,
} from '../../shared/player-form-modal/player-form-modal.component';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PlayerDetailModalComponent,
    ArmyManagementModalComponent,
    PlayerFormModalComponent,
  ],
  template: `
    <div class="players-page">
      <div class="players-header">
        <div class="header-left">
          <h2>Players</h2>
          <button class="btn btn-primary add-player-btn" (click)="addNewPlayer()">
            <span class="icon">+</span>
            Add Player
          </button>
        </div>

        <div class="header-center">
          <div class="data-controls">
            <button
              class="btn btn-small"
              [class.btn-warning]="hasUnsavedChanges()"
              [class.btn-secondary]="!hasUnsavedChanges()"
              (click)="exportPlayers()"
              [title]="
                hasUnsavedChanges()
                  ? 'You have unsaved changes! Click to save.'
                  : 'Export player data'
              "
            >
              <span class="icon">📤</span>
              {{ hasUnsavedChanges() ? 'Save Data' : 'Export' }}
            </button>
            <button
              class="btn btn-secondary btn-small"
              (click)="triggerImport()"
              title="Import player data"
            >
              <span class="icon">📥</span>
              Import
            </button>
            <input
              type="file"
              #fileInput
              accept=".json"
              (change)="importPlayers($event)"
              style="display: none"
            />
          </div>
        </div>

        <div class="view-controls">
          <button
            class="view-button"
            [class.active]="viewMode() === 'grid'"
            (click)="setViewMode('grid')"
          >
            <span class="view-icon">⚏</span>
            Grid
          </button>
          <button
            class="view-button"
            [class.active]="viewMode() === 'list'"
            (click)="setViewMode('list')"
          >
            <span class="view-icon">☰</span>
            List
          </button>
        </div>
      </div>

      <div class="players-grid" [class.list-view]="viewMode() === 'list'">
        <!-- Player cards will be rendered here -->
        <div class="player-card" *ngFor="let player of filteredPlayers()">
          <div class="player-avatar">
            <div class="avatar-circle">
              <span class="avatar-initial">{{ player.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>

          <div class="player-info">
            <h3 class="player-name">{{ player.name }}</h3>
            <div class="player-armies">
              <span class="army-icon" *ngFor="let army of player.armies" [title]="army">{{
                getArmyIcon(army)
              }}</span>
            </div>

            <div class="player-stats">
              <div class="stat-row">
                <div class="stat">
                  <span class="stat-value">{{ player.stats.gamesPlayed }}</span>
                  <span class="stat-label">Games</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ player.stats.wins }}</span>
                  <span class="stat-label">Wins</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ player.stats.losses }}</span>
                  <span class="stat-label">Losses</span>
                </div>
                <div class="stat">
                  <span
                    class="stat-value win-rate"
                    [class.excellent]="player.stats.winRate >= 80"
                    [class.good]="player.stats.winRate >= 60 && player.stats.winRate < 80"
                    [class.average]="player.stats.winRate >= 40 && player.stats.winRate < 60"
                    [class.poor]="player.stats.winRate < 40"
                  >
                    {{ player.stats.winRate.toFixed(0) }}%
                  </span>
                  <span class="stat-label">Win Rate</span>
                </div>
              </div>

              <div class="stat-row">
                <div class="stat">
                  <span class="stat-label">Rank:</span>
                  <span class="rank-badge rank-{{ player.stats.rank }}"
                    >#{{ player.stats.rank }}</span
                  >
                </div>
              </div>
            </div>

            <div class="player-actions">
              <button class="btn btn-secondary btn-small" (click)="viewPlayerDetails(player)">
                View Profile
              </button>
              <button class="btn btn-primary btn-small" (click)="editPlayer(player)">Edit</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredPlayers().length === 0">
        <div class="empty-icon">👥</div>
        <h3>No Players Found</h3>
        <p>No players match your search criteria.</p>
      </div>
    </div>

    <!-- Player Detail Modal -->
    <app-player-detail-modal
      [player]="selectedPlayer"
      [isVisible]="isModalVisible"
      (close)="closeModal()"
      (editPlayerEvent)="onEditPlayer($event)"
      (editArmiesEvent)="onEditArmies($event)"
    ></app-player-detail-modal>

    <!-- Army Management Modal -->
    <app-army-management-modal
      [player]="selectedPlayer"
      [isVisible]="isArmyModalVisible"
      (close)="closeArmyModal()"
      (armiesUpdated)="onArmiesUpdated($event)"
    ></app-army-management-modal>

    <!-- Player Form Modal -->
    <app-player-form-modal
      [player]="playerToEdit"
      [isVisible]="isPlayerFormModalVisible"
      (close)="closePlayerFormModal()"
      (playerSaved)="onPlayerSaved($event)"
    ></app-player-form-modal>
  `,
  styleUrls: ['./players.component.css'],
})
export class PlayersComponent {
  searchTerm = signal('');
  viewMode = signal<'grid' | 'list'>('grid');

  // Modal state
  selectedPlayer = signal<Player | null>(null);
  isModalVisible = signal(false);

  // Army management modal state
  isArmyModalVisible = signal(false);

  // Player form modal state
  isPlayerFormModalVisible = signal(false);
  playerToEdit = signal<Player | null>(null);

  constructor(private playerService: PlayerService) {
    // Initialize the app and show JSON workflow notification
    this.playerService.initializeApp();

    // Warn user before leaving with unsaved changes
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', (e) => {
        if (this.playerService.hasUnsavedChanges()) {
          e.preventDefault();
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
      });
    }
  }

  // Computed property for filtered players based on search
  filteredPlayers = computed(() => {
    const term = this.searchTerm();
    if (!term.trim()) {
      return this.playerService.players();
    }
    return this.playerService.searchPlayers(term);
  });

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  viewPlayerDetails(player: Player) {
    this.selectedPlayer.set(player);
    this.isModalVisible.set(true);
  }

  closeModal() {
    this.isModalVisible.set(false);
    this.selectedPlayer.set(null);
  }

  onEditPlayer(player: Player) {
    this.closeModal();
    this.editPlayer(player);
  }

  onEditArmies(player: Player) {
    this.closeModal(); // Close player detail modal
    this.selectedPlayer.set(player);
    this.isArmyModalVisible.set(true);
  }

  closeArmyModal() {
    this.isArmyModalVisible.set(false);
  }

  onArmiesUpdated(armies: string[]) {
    const player = this.selectedPlayer();
    if (player) {
      this.playerService.updatePlayer(player.id, { armies });
    }
    this.closeArmyModal();
  }

  addNewPlayer() {
    this.playerToEdit.set(null);
    this.isPlayerFormModalVisible.set(true);
  }

  editPlayer(player: Player) {
    this.playerToEdit.set(player);
    this.isPlayerFormModalVisible.set(true);
  }

  closePlayerFormModal() {
    this.isPlayerFormModalVisible.set(false);
    this.playerToEdit.set(null);
  }

  onPlayerSaved(event: { player?: Player; formData: PlayerFormData }) {
    const { player, formData } = event;

    if (player) {
      // Editing existing player
      this.playerService.updatePlayer(player.id, {
        name: formData.name,
        armies: formData.armies,
        avatar: formData.avatar,
      });
    } else {
      // Creating new player
      this.playerService.addPlayer(formData.name, formData.armies, formData.avatar);
    }

    this.closePlayerFormModal();
  }

  // Check for unsaved changes
  hasUnsavedChanges(): boolean {
    return this.playerService.hasUnsavedChanges();
  }

  // Get army icon based on army name
  getArmyIcon(armyName: string): string {
    const army = WARHAMMER_ARMIES.find((army) => army.name === armyName);
    return army?.icon || '⚔';
  }

  // Export/Import functionality
  exportPlayers() {
    this.playerService.downloadPlayersJson();
  }

  triggerImport() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  importPlayers(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = e.target?.result as string;
      const result = this.playerService.importPlayersFromJson(jsonData);

      if (result.success) {
        alert(
          `✅ ${result.message}\n\nData has been loaded successfully. Your changes are now saved!`
        );
      } else {
        alert(`❌ Import failed: ${result.message}\n\nPlease check your JSON file and try again.`);
      }

      // Reset the input
      input.value = '';
    };

    reader.onerror = () => {
      alert('❌ Error reading file');
      input.value = '';
    };

    reader.readAsText(file);
  }
}

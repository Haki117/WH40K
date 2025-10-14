import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player, Army, WARHAMMER_ARMIES } from '../../../models/player.models';

export interface PlayerFormData {
  name: string;
  armies: string[];
  avatar?: string;
}

@Component({
  selector: 'app-player-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()" *ngIf="isVisible()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-info">
            <h2>{{ isEditing() ? 'Edit Player' : 'Add New Player' }}</h2>
            <p>{{ isEditing() ? 'Update player information' : 'Create a new player profile' }}</p>
          </div>
          <button class="close-btn" (click)="closeModal()">
            <span class="icon">×</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Player Basic Info -->
          <div class="form-section">
            <h3>Basic Information</h3>
            <div class="form-group">
              <label for="playerName">Player Name</label>
              <input
                type="text"
                id="playerName"
                class="form-input"
                [(ngModel)]="formData.name"
                placeholder="Enter player name"
                [class.error]="nameError()"
              />
              <div class="error-message" *ngIf="nameError()">
                {{ nameError() }}
              </div>
            </div>
          </div>

          <!-- Player Avatar -->
          <div class="form-section">
            <h3>Player Image</h3>
            <div class="avatar-section">
              <div class="avatar-preview">
                <div class="avatar-circle-large">
                  <img
                    *ngIf="formData.avatar"
                    [src]="formData.avatar"
                    [alt]="formData.name"
                    class="avatar-image"
                  />
                  <div *ngIf="!formData.avatar" class="avatar-initials-large">
                    {{ getAvatarInitials() }}
                  </div>
                </div>
              </div>
              <div class="avatar-controls">
                <input
                  type="file"
                  #fileInput
                  accept="image/*"
                  (change)="onImageSelected($event)"
                  style="display: none"
                />
                <button type="button" class="btn btn-secondary" (click)="fileInput.click()">
                  Choose Image
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="removeAvatar()"
                  *ngIf="formData.avatar"
                >
                  Remove Image
                </button>
                <div class="image-info">
                  <small>Recommended: Square image, max 2MB</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Army Selection -->
          <div class="form-section">
            <h3>Army Selection</h3>
            <p class="section-description">Select all armies this player commands</p>

            <!-- Army Filter Controls -->
            <div class="army-filters">
              <button
                type="button"
                class="filter-btn"
                [class.active]="selectedFaction() === 'all'"
                (click)="setFactionFilter('all')"
              >
                All ({{ getArmiesCount('all') }})
              </button>
              <button
                type="button"
                class="filter-btn imperium"
                [class.active]="selectedFaction() === 'Imperium'"
                (click)="setFactionFilter('Imperium')"
              >
                Imperium ({{ getArmiesCount('Imperium') }})
              </button>
              <button
                type="button"
                class="filter-btn chaos"
                [class.active]="selectedFaction() === 'Chaos'"
                (click)="setFactionFilter('Chaos')"
              >
                Chaos ({{ getArmiesCount('Chaos') }})
              </button>
              <button
                type="button"
                class="filter-btn xenos"
                [class.active]="selectedFaction() === 'Xenos'"
                (click)="setFactionFilter('Xenos')"
              >
                Xenos ({{ getArmiesCount('Xenos') }})
              </button>
              <button
                type="button"
                class="filter-btn aeldari"
                [class.active]="selectedFaction() === 'Aeldari'"
                (click)="setFactionFilter('Aeldari')"
              >
                Aeldari ({{ getArmiesCount('Aeldari') }})
              </button>
            </div>

            <!-- Selected Armies Summary -->
            <div class="selected-armies-summary" *ngIf="formData.armies.length > 0">
              <h4>Selected Armies ({{ formData.armies.length }})</h4>
              <div class="selected-armies-list">
                <span
                  class="army-tag"
                  *ngFor="let armyName of formData.armies"
                  [style.background]="getArmyData(armyName)?.color"
                >
                  {{ getArmyData(armyName)?.icon }} {{ armyName }}
                  <button
                    type="button"
                    class="remove-army-btn"
                    (click)="toggleArmy(armyName)"
                    title="Remove army"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>

            <!-- Army Checkboxes -->
            <div class="armies-grid">
              <div
                class="army-checkbox-item"
                *ngFor="let army of filteredArmies(); trackBy: trackByArmy"
              >
                <label class="army-checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="formData.armies.includes(army.name)"
                    (change)="toggleArmy(army.name)"
                    class="army-checkbox"
                  />
                  <div class="army-checkbox-content">
                    <div class="army-icon" [style.background]="army.color">
                      {{ army.icon }}
                    </div>
                    <div class="army-info">
                      <div class="army-name">{{ army.name }}</div>
                      <div class="army-faction">{{ army.faction }}</div>
                      <div class="army-description">{{ army.description }}</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div class="armies-error" *ngIf="armiesError()">
              {{ armiesError() }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-info">
            <span class="army-count">{{ formData.armies.length }} armies selected</span>
          </div>
          <div class="footer-actions">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="savePlayer()"
              [disabled]="!isFormValid()"
            >
              {{ isEditing() ? 'Update Player' : 'Create Player' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./player-form-modal.component.css'],
})
export class PlayerFormModalComponent implements OnInit {
  @Input() player = signal<Player | null>(null);
  @Input() isVisible = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() playerSaved = new EventEmitter<{ player?: Player; formData: PlayerFormData }>();

  // Form state
  formData: PlayerFormData = {
    name: '',
    armies: [],
  };

  selectedFaction = signal<'all' | 'Imperium' | 'Chaos' | 'Xenos' | 'Aeldari'>('all');

  // Computed properties
  isEditing = computed(() => this.player() !== null);

  filteredArmies = computed(() => {
    if (this.selectedFaction() === 'all') {
      return WARHAMMER_ARMIES;
    }
    return WARHAMMER_ARMIES.filter((army) => army.faction === this.selectedFaction());
  });

  nameError = signal<string>('');
  armiesError = signal<string>('');

  constructor() {
    // Watch for changes to the player input signal
    effect(() => {
      const player = this.player();
      this.initializeForm();
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    const currentPlayer = this.player();
    if (currentPlayer) {
      // Editing existing player
      this.formData = {
        name: currentPlayer.name,
        armies: [...currentPlayer.armies],
        avatar: currentPlayer.avatar,
      };
    } else {
      // Creating new player
      this.formData = {
        name: '',
        armies: [],
        avatar: undefined,
      };
    }

    // Clear errors
    this.nameError.set('');
    this.armiesError.set('');
  }

  getArmyData(armyName: string): Army | undefined {
    return WARHAMMER_ARMIES.find((army) => army.name === armyName);
  }

  getArmiesCount(faction: 'all' | 'Imperium' | 'Chaos' | 'Xenos' | 'Aeldari'): number {
    if (faction === 'all') {
      return WARHAMMER_ARMIES.length;
    }
    return WARHAMMER_ARMIES.filter((army) => army.faction === faction).length;
  }

  setFactionFilter(faction: 'all' | 'Imperium' | 'Chaos' | 'Xenos' | 'Aeldari') {
    this.selectedFaction.set(faction);
  }

  toggleArmy(armyName: string) {
    const currentArmies = this.formData.armies;
    const index = currentArmies.indexOf(armyName);

    if (index > -1) {
      // Remove army
      this.formData.armies = currentArmies.filter((army) => army !== armyName);
    } else {
      // Add army
      this.formData.armies = [...currentArmies, armyName];
    }

    // Clear army error when user makes changes
    this.armiesError.set('');
  }

  validateForm(): boolean {
    let isValid = true;

    // Validate name
    if (!this.formData.name.trim()) {
      this.nameError.set('Player name is required');
      isValid = false;
    } else if (this.formData.name.trim().length < 2) {
      this.nameError.set('Player name must be at least 2 characters');
      isValid = false;
    } else {
      this.nameError.set('');
    }

    // Validate armies
    if (this.formData.armies.length === 0) {
      this.armiesError.set('Please select at least one army');
      isValid = false;
    } else {
      this.armiesError.set('');
    }

    return isValid;
  }

  isFormValid(): boolean {
    return this.formData.name.trim().length >= 2 && this.formData.armies.length > 0;
  }

  savePlayer() {
    if (!this.validateForm()) {
      return;
    }

    this.playerSaved.emit({
      player: this.player() || undefined,
      formData: { ...this.formData },
    });

    this.closeModal();
  }

  closeModal() {
    this.close.emit();
    // Reset form when closing
    this.initializeForm();
    this.selectedFaction.set('all');
  }

  trackByArmy(index: number, army: Army): string {
    return army.name;
  }

  // Avatar methods
  getAvatarInitials(): string {
    const name = this.formData.name || 'New Player';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      this.formData.avatar = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.formData.avatar = undefined;
  }
}

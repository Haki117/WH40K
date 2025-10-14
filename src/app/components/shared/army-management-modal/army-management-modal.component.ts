import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player, Army, WARHAMMER_ARMIES } from '../../../models/player.models';

@Component({
  selector: 'app-army-management-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()" *ngIf="isVisible()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-info">
            <h2>Manage Armies</h2>
            <p>{{ player()?.name }}</p>
          </div>
          <button class="close-btn" (click)="closeModal()">
            <span class="icon">×</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Current Armies -->
          <div class="current-armies-section" *ngIf="currentArmies().length > 0">
            <h3>Current Armies</h3>
            <div class="armies-grid">
              <div
                class="army-card current"
                *ngFor="let army of currentArmies(); trackBy: trackByArmyName"
              >
                <div class="army-icon" [style.background]="getArmyData(army)?.color">
                  {{ getArmyData(army)?.icon }}
                </div>
                <div class="army-info">
                  <div class="army-name">{{ army }}</div>
                  <div class="army-faction">{{ getArmyData(army)?.faction }}</div>
                  <div class="army-description">{{ getArmyData(army)?.description }}</div>
                </div>
                <button class="remove-btn" (click)="removeArmy(army)" title="Remove Army">
                  <span class="icon">−</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Filter Controls -->
          <div class="filter-section">
            <h3>Add New Army</h3>
            <div class="filter-controls">
              <input
                type="text"
                placeholder="Search armies..."
                class="search-input"
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()"
              />
              <div class="faction-filters">
                <button
                  class="faction-filter"
                  [class.active]="selectedFaction() === 'all'"
                  (click)="setFactionFilter('all')"
                >
                  All
                </button>
                <button
                  class="faction-filter imperium"
                  [class.active]="selectedFaction() === 'Imperium'"
                  (click)="setFactionFilter('Imperium')"
                >
                  Imperium
                </button>
                <button
                  class="faction-filter chaos"
                  [class.active]="selectedFaction() === 'Chaos'"
                  (click)="setFactionFilter('Chaos')"
                >
                  Chaos
                </button>
                <button
                  class="faction-filter xenos"
                  [class.active]="selectedFaction() === 'Xenos'"
                  (click)="setFactionFilter('Xenos')"
                >
                  Xenos
                </button>
                <button
                  class="faction-filter aeldari"
                  [class.active]="selectedFaction() === 'Aeldari'"
                  (click)="setFactionFilter('Aeldari')"
                >
                  Aeldari
                </button>
              </div>
            </div>
          </div>

          <!-- Available Armies -->
          <div class="available-armies-section">
            <div class="armies-grid">
              <div
                class="army-card available"
                *ngFor="let army of filteredAvailableArmies(); trackBy: trackByArmy"
                [class.disabled]="currentArmies().includes(army.name)"
              >
                <div class="army-icon" [style.background]="army.color">
                  {{ army.icon }}
                </div>
                <div class="army-info">
                  <div class="army-name">{{ army.name }}</div>
                  <div class="army-faction">{{ army.faction }}</div>
                  <div class="army-description">{{ army.description }}</div>
                </div>
                <button
                  class="add-btn"
                  (click)="addArmy(army.name)"
                  [disabled]="currentArmies().includes(army.name)"
                  title="Add Army"
                >
                  <span class="icon">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="army-count">{{ currentArmies().length }} armies selected</div>
          <div class="footer-actions">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveChanges()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./army-management-modal.component.css'],
})
export class ArmyManagementModalComponent {
  @Input() player = signal<Player | null>(null);
  @Input() isVisible = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() armiesUpdated = new EventEmitter<string[]>();

  searchTerm = signal('');
  selectedFaction = signal<'all' | 'Imperium' | 'Chaos' | 'Xenos' | 'Aeldari'>('all');
  currentArmies = signal<string[]>([]);

  // Available armies excluding current ones
  availableArmies = computed(() =>
    WARHAMMER_ARMIES.filter((army) => !this.currentArmies().includes(army.name))
  );

  // Filtered available armies based on search and faction
  filteredAvailableArmies = computed(() => {
    let armies = this.availableArmies();

    // Filter by faction
    if (this.selectedFaction() !== 'all') {
      armies = armies.filter((army) => army.faction === this.selectedFaction());
    }

    // Filter by search term
    const searchTerm = this.searchTerm().toLowerCase().trim();
    if (searchTerm) {
      armies = armies.filter(
        (army) =>
          army.name.toLowerCase().includes(searchTerm) ||
          army.faction.toLowerCase().includes(searchTerm) ||
          (army.description && army.description.toLowerCase().includes(searchTerm))
      );
    }

    return armies;
  });

  ngOnInit() {
    // Initialize current armies when player changes
    if (this.player()) {
      this.currentArmies.set([...this.player()!.armies]);
    }
  }

  ngOnChanges() {
    // Update current armies when player changes
    if (this.player()) {
      this.currentArmies.set([...this.player()!.armies]);
    }
  }

  getArmyData(armyName: string): Army | undefined {
    return WARHAMMER_ARMIES.find((army) => army.name === armyName);
  }

  addArmy(armyName: string) {
    const current = this.currentArmies();
    if (!current.includes(armyName)) {
      this.currentArmies.set([...current, armyName]);
    }
  }

  removeArmy(armyName: string) {
    const current = this.currentArmies();
    this.currentArmies.set(current.filter((army) => army !== armyName));
  }

  setFactionFilter(faction: 'all' | 'Imperium' | 'Chaos' | 'Xenos' | 'Aeldari') {
    this.selectedFaction.set(faction);
  }

  onSearchChange() {
    // Search term is automatically updated via two-way binding
    // This method is kept for potential future search logic
  }

  saveChanges() {
    this.armiesUpdated.emit(this.currentArmies());
    this.closeModal();
  }

  closeModal() {
    this.close.emit();
    // Reset to original armies
    if (this.player()) {
      this.currentArmies.set([...this.player()!.armies]);
    }
    this.searchTerm.set('');
    this.selectedFaction.set('all');
  }

  trackByArmyName(index: number, armyName: string): string {
    return armyName;
  }

  trackByArmy(index: number, army: Army): string {
    return army.name;
  }
}

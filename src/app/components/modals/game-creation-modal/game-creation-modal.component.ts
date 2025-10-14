import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameFormData, Player } from '../../../models/player.models';
import { PlayerService } from '../../../services/player.service';

export interface GameCreationFormData {
  player1Id: string;
  player1Army: string;
  player1ArmyList: string;
  player1Deployment: string;
  player1Twists: string;
  player1FullyPaintedPoints: number;
  player1PrimaryPoints: number;
  player1SecondaryPoints: number;
  player2Id: string;
  player2Army: string;
  player2ArmyList: string;
  player2Deployment: string;
  player2Twists: string;
  player2FullyPaintedPoints: number;
  player2PrimaryPoints: number;
  player2SecondaryPoints: number;
  winner: 'player1' | 'player2' | 'draw';
  notes: string;
}

@Component({
  selector: 'app-game-creation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-content game-creation-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Create New Battle</h2>
          <button class="close-btn" (click)="close()" aria-label="Close">×</button>
        </div>

        <div class="modal-body">
          <!-- Battle Configuration -->
          <div class="battle-config-section">
            <div class="section-title">
              <h3>Battle Configuration</h3>
            </div>

            <div class="shared-config">
              <div class="form-group">
                <label for="deployment">Deployment</label>
                <input
                  type="text"
                  id="deployment"
                  class="form-input"
                  [(ngModel)]="sharedDeployment"
                  placeholder="e.g., Hammer and Anvil, Dawn of War"
                />
              </div>

              <div class="form-group">
                <label for="twists">Mission Twists</label>
                <input
                  type="text"
                  id="twists"
                  class="form-input"
                  [(ngModel)]="sharedTwists"
                  placeholder="e.g., Dense Cover, Night Fighting"
                />
              </div>
            </div>
          </div>

          <!-- Players Configuration -->
          <div class="players-section">
            <div class="section-title">
              <h3>Battle Participants</h3>
            </div>

            <div class="players-grid">
              <!-- Player 1 -->
              <div class="player-config">
                <div class="player-header">
                  <h4>Player 1</h4>
                </div>

                <div class="form-group">
                  <label for="player1">Select Player</label>
                  <select
                    id="player1"
                    class="form-select"
                    [(ngModel)]="formData.player1Id"
                    (ngModelChange)="onPlayer1Change()"
                  >
                    <option value="">Choose a player...</option>
                    <option *ngFor="let player of players()" [value]="player.id">
                      {{ player.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group" *ngIf="formData.player1Id">
                  <label for="player1Army">Select Army</label>
                  <select id="player1Army" class="form-select" [(ngModel)]="formData.player1Army">
                    <option value="">Choose an army...</option>
                    <option *ngFor="let army of player1Armies()" [value]="army">
                      {{ army }}
                    </option>
                    <option *ngIf="player1Armies().length === 0" value="" disabled>
                      No armies available for this player
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="player1ArmyList">Army List</label>
                  <textarea
                    id="player1ArmyList"
                    class="form-textarea"
                    [(ngModel)]="formData.player1ArmyList"
                    placeholder="Enter army list details..."
                    rows="3"
                  ></textarea>
                </div>

                <!-- Player 1 Scoring -->
                <div class="scoring-section">
                  <h5>Scoring</h5>

                  <div class="form-group">
                    <label for="player1FullyPainted">Fully Painted Points</label>
                    <input
                      type="number"
                      id="player1FullyPainted"
                      class="form-input"
                      [(ngModel)]="formData.player1FullyPaintedPoints"
                      min="0"
                      max="10"
                      placeholder="Usually 10"
                    />
                    <small class="field-hint">0-10 points (10 for fully painted army)</small>
                  </div>

                  <div class="form-group">
                    <label for="player1Primary">Primary Points</label>
                    <input
                      type="number"
                      id="player1Primary"
                      class="form-input"
                      [(ngModel)]="formData.player1PrimaryPoints"
                      min="0"
                      max="45"
                      placeholder="0-45"
                    />
                    <small class="field-hint">0-45 points from primary objectives</small>
                  </div>

                  <div class="form-group">
                    <label for="player1Secondary">Secondary Points</label>
                    <input
                      type="number"
                      id="player1Secondary"
                      class="form-input"
                      [(ngModel)]="formData.player1SecondaryPoints"
                      min="0"
                      max="45"
                      placeholder="0-45"
                    />
                    <small class="field-hint">0-45 points from secondary objectives</small>
                  </div>

                  <div class="total-score">
                    <strong>Total: {{ getPlayer1Total() }}/100 points</strong>
                  </div>
                </div>
              </div>

              <!-- VS Divider -->
              <div class="vs-divider">
                <span class="vs-text">VS</span>
              </div>

              <!-- Player 2 -->
              <div class="player-config">
                <div class="player-header">
                  <h4>Player 2</h4>
                </div>

                <div class="form-group">
                  <label for="player2">Select Player</label>
                  <select
                    id="player2"
                    class="form-select"
                    [(ngModel)]="formData.player2Id"
                    (ngModelChange)="onPlayer2Change()"
                  >
                    <option value="">Choose a player...</option>
                    <option *ngFor="let player of players()" [value]="player.id">
                      {{ player.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group" *ngIf="formData.player2Id">
                  <label for="player2Army">Select Army</label>
                  <select id="player2Army" class="form-select" [(ngModel)]="formData.player2Army">
                    <option value="">Choose an army...</option>
                    <option *ngFor="let army of player2Armies()" [value]="army">
                      {{ army }}
                    </option>
                    <option *ngIf="player2Armies().length === 0" value="" disabled>
                      No armies available for this player
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="player2ArmyList">Army List</label>
                  <textarea
                    id="player2ArmyList"
                    class="form-textarea"
                    [(ngModel)]="formData.player2ArmyList"
                    placeholder="Enter army list details..."
                    rows="3"
                  ></textarea>
                </div>

                <!-- Player 2 Scoring -->
                <div class="scoring-section">
                  <h5>Scoring</h5>

                  <div class="form-group">
                    <label for="player2FullyPainted">Fully Painted Points</label>
                    <input
                      type="number"
                      id="player2FullyPainted"
                      class="form-input"
                      [(ngModel)]="formData.player2FullyPaintedPoints"
                      min="0"
                      max="10"
                      placeholder="Usually 10"
                    />
                    <small class="field-hint">0-10 points (10 for fully painted army)</small>
                  </div>

                  <div class="form-group">
                    <label for="player2Primary">Primary Points</label>
                    <input
                      type="number"
                      id="player2Primary"
                      class="form-input"
                      [(ngModel)]="formData.player2PrimaryPoints"
                      min="0"
                      max="45"
                      placeholder="0-45"
                    />
                    <small class="field-hint">0-45 points from primary objectives</small>
                  </div>

                  <div class="form-group">
                    <label for="player2Secondary">Secondary Points</label>
                    <input
                      type="number"
                      id="player2Secondary"
                      class="form-input"
                      [(ngModel)]="formData.player2SecondaryPoints"
                      min="0"
                      max="45"
                      placeholder="0-45"
                    />
                    <small class="field-hint">0-45 points from secondary objectives</small>
                  </div>

                  <div class="total-score">
                    <strong>Total: {{ getPlayer2Total() }}/100 points</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Battle Result -->
          <div class="result-section">
            <div class="section-title">
              <h3>Battle Result</h3>
            </div>

            <div class="battle-result-display">
              <div class="result-info">
                <div class="score-comparison">
                  <div class="player-score">
                    <span class="player-name">{{
                      getPlayerName(formData.player1Id) || 'Player 1'
                    }}</span>
                    <span class="score">{{ getPlayer1Total() }} points</span>
                  </div>
                  <div class="vs-indicator">VS</div>
                  <div class="player-score">
                    <span class="player-name">{{
                      getPlayerName(formData.player2Id) || 'Player 2'
                    }}</span>
                    <span class="score">{{ getPlayer2Total() }} points</span>
                  </div>
                </div>
                <div class="automatic-result">
                  <strong>Result: {{ getAutomaticWinnerText() }}</strong>
                  <small class="result-explanation">{{ getWinnerExplanation() }}</small>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="notes">Battle Notes</label>
              <textarea
                id="notes"
                class="form-textarea"
                [(ngModel)]="formData.notes"
                placeholder="Optional battle notes, highlights, or observations..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Cancel</button>
          <button class="btn btn-primary" (click)="createGame()" [disabled]="!isFormValid()">
            Create Battle
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './game-creation-modal.component.css',
})
export class GameCreationModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() gameCreated = new EventEmitter<GameFormData>();

  // Shared battle configuration
  sharedDeployment = '';
  sharedTwists = '';

  // Form data
  formData: GameCreationFormData = {
    player1Id: '',
    player1Army: '',
    player1ArmyList: '',
    player1Deployment: '',
    player1Twists: '',
    player1FullyPaintedPoints: 10,
    player1PrimaryPoints: 0,
    player1SecondaryPoints: 0,
    player2Id: '',
    player2Army: '',
    player2ArmyList: '',
    player2Deployment: '',
    player2Twists: '',
    player2FullyPaintedPoints: 10,
    player2PrimaryPoints: 0,
    player2SecondaryPoints: 0,
    winner: 'player1',
    notes: '',
  };

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    // Initialize deployment and twists when modal opens
    this.syncSharedValues();
  }

  // Computed properties
  players = computed(() => this.playerService.players());

  player1Armies = computed(() => {
    const player = this.players().find((p) => p.id === this.formData.player1Id);
    return player ? player.armies : [];
  });

  player2Armies = computed(() => {
    const player = this.players().find((p) => p.id === this.formData.player2Id);
    return player ? player.armies : [];
  });

  close(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onPlayer1Change(): void {
    this.formData.player1Army = '';
  }

  onPlayer2Change(): void {
    this.formData.player2Army = '';
  }

  getPlayer1Total(): number {
    return (
      this.formData.player1FullyPaintedPoints +
      this.formData.player1PrimaryPoints +
      this.formData.player1SecondaryPoints
    );
  }

  getPlayer2Total(): number {
    return (
      this.formData.player2FullyPaintedPoints +
      this.formData.player2PrimaryPoints +
      this.formData.player2SecondaryPoints
    );
  }

  getPlayerName(playerId: string): string {
    const player = this.players().find((p) => p.id === playerId);
    return player ? player.name : '';
  }

  isFormValid(): boolean {
    return !!(
      this.formData.player1Id &&
      this.formData.player1Army &&
      this.formData.player2Id &&
      this.formData.player2Army &&
      this.formData.player1Id !== this.formData.player2Id
    );
  }

  // Automatic winner determination based on point difference
  getAutomaticWinner(): 'player1' | 'player2' | 'draw' {
    const player1Total = this.getPlayer1Total();
    const player2Total = this.getPlayer2Total();
    const difference = player1Total - player2Total;

    if (difference > 5) {
      return 'player1';
    } else if (difference < -5) {
      return 'player2';
    } else {
      return 'draw';
    }
  }

  getAutomaticWinnerText(): string {
    const winner = this.getAutomaticWinner();
    const player1Name = this.getPlayerName(this.formData.player1Id) || 'Player 1';
    const player2Name = this.getPlayerName(this.formData.player2Id) || 'Player 2';

    switch (winner) {
      case 'player1':
        return `${player1Name} Victory`;
      case 'player2':
        return `${player2Name} Victory`;
      case 'draw':
        return 'Draw';
      default:
        return 'Calculating...';
    }
  }

  getWinnerExplanation(): string {
    const player1Total = this.getPlayer1Total();
    const player2Total = this.getPlayer2Total();
    const difference = Math.abs(player1Total - player2Total);

    if (difference > 5) {
      return `Won by ${difference} points (more than 5 point difference)`;
    } else {
      return `Draw - only ${difference} point difference (5 or less)`;
    }
  }

  private syncSharedValues(): void {
    this.formData.player1Deployment = this.sharedDeployment;
    this.formData.player1Twists = this.sharedTwists;
    this.formData.player2Deployment = this.sharedDeployment;
    this.formData.player2Twists = this.sharedTwists;
  }

  createGame(): void {
    if (!this.isFormValid()) return;

    // Sync shared values before creating
    this.syncSharedValues();

    // Automatically determine winner based on point difference
    const automaticWinner = this.getAutomaticWinner();

    const gameFormData: GameFormData = {
      player1Id: this.formData.player1Id,
      player1Army: this.formData.player1Army,
      player1ArmyList: this.formData.player1ArmyList,
      player1Deployment: this.formData.player1Deployment,
      player1Twists: this.formData.player1Twists,
      player1FullyPaintedPoints: this.formData.player1FullyPaintedPoints,
      player1PrimaryPoints: this.formData.player1PrimaryPoints,
      player1SecondaryPoints: this.formData.player1SecondaryPoints,
      player2Id: this.formData.player2Id,
      player2Army: this.formData.player2Army,
      player2ArmyList: this.formData.player2ArmyList,
      player2Deployment: this.formData.player2Deployment,
      player2Twists: this.formData.player2Twists,
      player2FullyPaintedPoints: this.formData.player2FullyPaintedPoints,
      player2PrimaryPoints: this.formData.player2PrimaryPoints,
      player2SecondaryPoints: this.formData.player2SecondaryPoints,
      winner: automaticWinner,
      notes: this.formData.notes,
    };

    this.gameCreated.emit(gameFormData);
    this.close();
  }

  private resetForm(): void {
    this.formData = {
      player1Id: '',
      player1Army: '',
      player1ArmyList: '',
      player1Deployment: '',
      player1Twists: '',
      player1FullyPaintedPoints: 10,
      player1PrimaryPoints: 0,
      player1SecondaryPoints: 0,
      player2Id: '',
      player2Army: '',
      player2ArmyList: '',
      player2Deployment: '',
      player2Twists: '',
      player2FullyPaintedPoints: 10,
      player2PrimaryPoints: 0,
      player2SecondaryPoints: 0,
      winner: 'player1',
      notes: '',
    };
    this.sharedDeployment = '';
    this.sharedTwists = '';
  }
}

import { GameSnapshot } from '@/src/types';

export interface MultiplayerClientOptions {
  roomId: string;
  memberId: string;
  memberToken: string;
  onSnapshot: (snapshot: GameSnapshot) => void;
  onMatchFinished: (results: unknown) => void;
  onError: (err: string) => void;
  onPingChange?: (pingMs: number) => void;
}

export class MultiplayerNetworkClient {
  private roomId: string;
  private memberId: string;
  private memberToken: string;
  private onSnapshot: (snapshot: GameSnapshot) => void;
  private onMatchFinished: (results: unknown) => void;
  private onError: (err: string) => void;
  private onPingChange?: (pingMs: number) => void;

  private isRunning: boolean = false;
  private syncTimer?: ReturnType<typeof setTimeout>;
  private pendingInput = {
    dx: 0,
    dy: 0,
    dash: false,
    pickupDrop: false,
    interact: false,
    ping: undefined as { x: number; y: number; type?: 'general' | 'ingredient' | 'station' | 'fire' | 'order' } | undefined,
    chat: undefined as string | undefined,
  };
  private consecutiveFailures: number = 0;
  private currentPing: number = 0;

  constructor(options: MultiplayerClientOptions) {
    this.roomId = options.roomId;
    this.memberId = options.memberId;
    this.memberToken = options.memberToken;
    this.onSnapshot = options.onSnapshot;
    this.onMatchFinished = options.onMatchFinished;
    this.onError = options.onError;
    this.onPingChange = options.onPingChange;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.consecutiveFailures = 0;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  public sendInput(input: {
    dx?: number;
    dy?: number;
    dash?: boolean;
    pickupDrop?: boolean;
    interact?: boolean;
    ping?: { x: number; y: number; type?: 'general' | 'ingredient' | 'station' | 'fire' | 'order' };
    chat?: string;
  }) {
    if (input.dx !== undefined) this.pendingInput.dx = input.dx;
    if (input.dy !== undefined) this.pendingInput.dy = input.dy;
    if (input.dash) this.pendingInput.dash = true;
    if (input.pickupDrop) this.pendingInput.pickupDrop = true;
    if (input.interact) this.pendingInput.interact = true;
    if (input.ping) this.pendingInput.ping = input.ping;
    if (input.chat) this.pendingInput.chat = input.chat;
  }

  private async loop() {
    if (!this.isRunning) return;

    const startTime = performance.now();

    try {
      const payload = {
        memberId: this.memberId,
        memberToken: this.memberToken,
        dx: this.pendingInput.dx,
        dy: this.pendingInput.dy,
        dash: this.pendingInput.dash,
        pickupDrop: this.pendingInput.pickupDrop,
        interact: this.pendingInput.interact,
        ping: this.pendingInput.ping,
        chat: this.pendingInput.chat,
      };

      // Reset one-shot triggers
      this.pendingInput.dash = false;
      this.pendingInput.pickupDrop = false;
      this.pendingInput.interact = false;
      this.pendingInput.ping = undefined;
      this.pendingInput.chat = undefined;

      const res = await fetch(`/api/rooms/${this.roomId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rtt = Math.round(performance.now() - startTime);
      this.currentPing = rtt;
      this.onPingChange?.(rtt);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        error?: string;
        snapshot?: GameSnapshot;
        status?: string;
        matchResults?: unknown;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      this.consecutiveFailures = 0;

      if (data.snapshot) {
        this.onSnapshot(data.snapshot);
      }

      if (data.status === 'finished') {
        this.onMatchFinished(data.matchResults);
        this.stop();
        return;
      }
    } catch (err: unknown) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures > 5) {
        this.onError('Mất kết nối với máy chủ!');
      }
    }

    // Adaptive interval: 50ms (~20 syncs/sec) when stable, slightly backed off on errors
    const delay = this.consecutiveFailures > 0 ? Math.min(1000, 50 * Math.pow(1.5, this.consecutiveFailures)) : 50;

    if (this.isRunning) {
      this.syncTimer = setTimeout(() => this.loop(), delay);
    }
  }

  public getPing(): number {
    return this.currentPing;
  }
}

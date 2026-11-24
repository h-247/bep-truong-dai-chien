export interface PlayerInput {
  dx: number;
  dy: number;
  dash: boolean;
  pickupDrop: boolean;
  interact: boolean;
  switchChef: boolean;
  quickChat: boolean;
  ping: boolean;
}

export interface KeyboardBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  pickupDrop: string;
  interact: string;
  dash: string;
  switchChef: string;
  quickChat: string;
  ping: string;
}

export const DEFAULT_P1_BINDINGS: KeyboardBindings = {
  up: 'KeyW',
  down: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  pickupDrop: 'KeyE',
  interact: 'KeyF',
  dash: 'Space',
  switchChef: 'Tab',
  quickChat: 'KeyQ',
  ping: 'KeyR',
};

export const DEFAULT_P2_BINDINGS: KeyboardBindings = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  pickupDrop: 'Enter',
  interact: 'ShiftRight',
  dash: 'ControlRight',
  switchChef: 'Numpad0',
  quickChat: 'KeyP',
  ping: 'KeyO',
};

export class InputManager {
  private keysPressed: Set<string> = new Set();
  private p1Bindings: KeyboardBindings = { ...DEFAULT_P1_BINDINGS };
  private p2Bindings: KeyboardBindings = { ...DEFAULT_P2_BINDINGS };
  private activeTouchJoy: { id: number; startX: number; startY: number; currX: number; currY: number } | null = null;
  private virtualJoystickVector = { x: 0, y: 0 };
  private virtualButtons = {
    dash: false,
    pickupDrop: false,
    interact: false,
    switchChef: false,
    quickChat: false,
    ping: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Prevent default scrolling for game keys
    if (
      ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
        e.code,
      )
    ) {
      e.preventDefault();
    }
    this.keysPressed.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysPressed.delete(e.code);
  };

  // Mobile virtual joystick input methods
  public setVirtualJoystick(x: number, y: number) {
    this.virtualJoystickVector.x = Math.max(-1, Math.min(1, x));
    this.virtualJoystickVector.y = Math.max(-1, Math.min(1, y));
  }

  public setVirtualButton(
    button: keyof typeof this.virtualButtons,
    isPressed: boolean,
  ) {
    this.virtualButtons[button] = isPressed;
  }

  public triggerVirtualAction(
    button: keyof typeof this.virtualButtons,
  ) {
    this.virtualButtons[button] = true;
    setTimeout(() => {
      this.virtualButtons[button] = false;
    }, 50);
  }

  public getPlayer1Input(): PlayerInput {
    let dx = 0;
    let dy = 0;

    // Keyboard
    if (this.keysPressed.has(this.p1Bindings.left)) dx -= 1;
    if (this.keysPressed.has(this.p1Bindings.right)) dx += 1;
    if (this.keysPressed.has(this.p1Bindings.up)) dy -= 1;
    if (this.keysPressed.has(this.p1Bindings.down)) dy += 1;

    // Virtual Joystick overlay (adds or overrides if active)
    if (
      Math.abs(this.virtualJoystickVector.x) > 0.1 ||
      Math.abs(this.virtualJoystickVector.y) > 0.1
    ) {
      dx = this.virtualJoystickVector.x;
      dy = this.virtualJoystickVector.y;
    }

    return {
      dx,
      dy,
      dash: this.keysPressed.has(this.p1Bindings.dash) || this.virtualButtons.dash,
      pickupDrop:
        this.keysPressed.has(this.p1Bindings.pickupDrop) || this.virtualButtons.pickupDrop,
      interact:
        this.keysPressed.has(this.p1Bindings.interact) || this.virtualButtons.interact,
      switchChef:
        this.keysPressed.has(this.p1Bindings.switchChef) || this.virtualButtons.switchChef,
      quickChat:
        this.keysPressed.has(this.p1Bindings.quickChat) || this.virtualButtons.quickChat,
      ping: this.keysPressed.has(this.p1Bindings.ping) || this.virtualButtons.ping,
    };
  }

  public getPlayer2Input(): PlayerInput {
    let dx = 0;
    let dy = 0;

    if (this.keysPressed.has(this.p2Bindings.left)) dx -= 1;
    if (this.keysPressed.has(this.p2Bindings.right)) dx += 1;
    if (this.keysPressed.has(this.p2Bindings.up)) dy -= 1;
    if (this.keysPressed.has(this.p2Bindings.down)) dy += 1;

    return {
      dx,
      dy,
      dash: this.keysPressed.has(this.p2Bindings.dash),
      pickupDrop: this.keysPressed.has(this.p2Bindings.pickupDrop),
      interact: this.keysPressed.has(this.p2Bindings.interact),
      switchChef: this.keysPressed.has(this.p2Bindings.switchChef),
      quickChat: this.keysPressed.has(this.p2Bindings.quickChat),
      ping: this.keysPressed.has(this.p2Bindings.ping),
    };
  }

  public resetActionTriggers() {
    this.virtualButtons.dash = false;
    this.virtualButtons.pickupDrop = false;
    this.virtualButtons.interact = false;
    this.virtualButtons.switchChef = false;
    this.virtualButtons.quickChat = false;
    this.virtualButtons.ping = false;
  }
}

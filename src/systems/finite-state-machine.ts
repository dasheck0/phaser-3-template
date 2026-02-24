/**
 * Finite State Machine - Generic FSM implementation
 * Modular: State management decoupled from game logic
 * Functional: Pure state transitions with explicit dependencies
 */

/**
 * Base State interface
 * Each state implements lifecycle methods
 */
export abstract class State {
	protected fsm: FiniteStateMachine;
	protected name: string;

	constructor(name: string, fsm: FiniteStateMachine) {
		this.name = name;
		this.fsm = fsm;
	}

	/**
	 * Called when entering this state
	 */
	enter(): void {
		// Override in subclass
	}

	/**
	 * Called every frame while in this state
	 */
	execute(_time: number, _delta: number): void {
		// Override in subclass
	}

	/**
	 * Called when exiting this state
	 */
	exit(): void {
		// Override in subclass
	}

	/**
	 * Get state name
	 */
	getName(): string {
		return this.name;
	}
}

/**
 * Finite State Machine
 * Manages state transitions and lifecycle
 */
export class FiniteStateMachine {
	private states: Map<string, State>;
	private currentState: State | null;
	private context: any; // Context object (e.g., Scene, GameObject)

	constructor(context: any) {
		this.states = new Map();
		this.currentState = null;
		this.context = context;
	}

	/**
	 * Add a state to the FSM
	 */
	addState(state: State): void {
		this.states.set(state.getName(), state);
	}

	/**
	 * Set the initial state
	 */
	setState(stateName: string): void {
		const state = this.states.get(stateName);
		if (!state) {
			console.warn(`State "${stateName}" not found`);
			return;
		}

		// Exit current state
		if (this.currentState) {
			this.currentState.exit();
		}

		// Enter new state
		this.currentState = state;
		this.currentState.enter();
	}

	/**
	 * Update current state
	 */
	update(time: number, delta: number): void {
		if (this.currentState) {
			this.currentState.execute(time, delta);
		}
	}

	/**
	 * Get current state name
	 */
	getCurrentStateName(): string | null {
		return this.currentState ? this.currentState.getName() : null;
	}

	/**
	 * Get context object
	 */
	getContext(): any {
		return this.context;
	}

	/**
	 * Check if FSM is in a specific state
	 */
	isInState(stateName: string): boolean {
		return this.currentState?.getName() === stateName;
	}
}

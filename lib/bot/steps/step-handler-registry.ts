import { confirmationHandler } from './confirmation';
import { locationInputHandler } from './location-input';
import { selectionHandler } from './selection';
import type { StepHandler, StepType } from './step-types';
import { textInputHandler } from './text-input';

/**
 * Registry of step handlers by step type.
 * Maps step types to their implementations.
 */
class StepHandlerRegistry {
  private handlers: Map<StepType, StepHandler> = new Map();

  constructor() {
    // Register built-in handlers
    this.register('text', textInputHandler);
    this.register('selection', selectionHandler);
    this.register('location', locationInputHandler);
    this.register('confirmation', confirmationHandler);
  }

  /**
   * Register a handler for a step type.
   */
  register(type: StepType, handler: StepHandler): void {
    if (this.handlers.has(type)) {
      console.warn(`Overwriting handler for step type: ${type}`);
    }
    this.handlers.set(type, handler);
  }

  /**
   * Get handler for a step type.
   */
  get(type: StepType): StepHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`No handler registered for step type: ${type}`);
    }
    return handler;
  }

  /**
   * Check if a handler exists for a step type.
   */
  has(type: StepType): boolean {
    return this.handlers.has(type);
  }
}

export const stepHandlerRegistry = new StepHandlerRegistry();

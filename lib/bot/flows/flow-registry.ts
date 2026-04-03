import type { Flow } from './flow-types';
import { onboardingFlow } from './onboarding-flow';

/**
 * Registry of all available flows.
 * New flows can be registered here without modifying handler code.
 */
class FlowRegistry {
  private flows: Map<string, Flow> = new Map();

  constructor() {
    // Register built-in flows
    this.register(onboardingFlow);
  }

  /**
   * Register a flow.
   */
  register(flow: Flow): void {
    if (this.flows.has(flow.id)) {
      console.warn(`Overwriting flow: ${flow.id}`);
    }
    this.flows.set(flow.id, flow);
  }

  /**
   * Get a flow by ID.
   */
  get(flowId: string): Flow | undefined {
    return this.flows.get(flowId);
  }

  /**
   * Get all registered flows.
   */
  getAllFlows(): Flow[] {
    return Array.from(this.flows.values());
  }
}

export const flowRegistry = new FlowRegistry();

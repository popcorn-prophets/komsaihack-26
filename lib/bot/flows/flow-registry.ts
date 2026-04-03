import type { Flow } from './flow-types';
import { incidentReportingFlow } from './incident-reporting-flow';
import { onboardingFlow } from './onboarding-flow';

/**
 * Registry of all available flows.
 * New flows can be registered here without modifying handler code.
 */
class FlowRegistry {
  private flows: Map<string, Flow> = new Map();

  private normalizeCommand(command: string): string {
    return command.trim().toLowerCase();
  }

  constructor() {
    // Register built-in flows
    this.register(onboardingFlow);
    this.register(incidentReportingFlow);
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
   * Resolve the first flow that should start for a command.
   */
  getByCommand(command: string): Flow | undefined {
    const normalized = this.normalizeCommand(command);

    return this.getAllFlows().find((flow) =>
      (flow.start?.commands ?? [])
        .map((currentCommand) => this.normalizeCommand(currentCommand))
        .includes(normalized)
    );
  }

  /**
   * Resolve the flow that auto-starts for unregistered residents.
   */
  getAutoStartForUnregisteredResident(): Flow | undefined {
    return this.getAllFlows().find(
      (flow) => flow.start?.autoStartForUnregisteredResident
    );
  }

  /**
   * Gather command examples for user guidance.
   */
  getStartCommands(): string[] {
    const commandSet = new Set<string>();

    for (const flow of this.getAllFlows()) {
      for (const command of flow.start?.commands ?? []) {
        const normalized = this.normalizeCommand(command);
        if (normalized) {
          commandSet.add(normalized);
        }
      }
    }

    return Array.from(commandSet);
  }

  /**
   * Get all registered flows.
   */
  getAllFlows(): Flow[] {
    return Array.from(this.flows.values());
  }
}

export const flowRegistry = new FlowRegistry();

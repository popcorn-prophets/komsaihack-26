import type { Flow } from './flow-types';
import { incidentReportingFlow } from './incident-reporting-flow';
import { incidentReportingFreeformFlow } from './incident-reporting-freeform-flow';
import { onboardingFlow } from './onboarding-flow';
import { residentThreadSettingsFlow } from './resident-thread-settings-flow';

export interface ResolvedStartCommand {
  flow: Flow;
  command: string;
  payload?: string;
}

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
    this.register(incidentReportingFreeformFlow);
    this.register(residentThreadSettingsFlow);
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
   * Resolve a user input into a start command, with optional trailing payload.
   * Uses longest-command-first matching to avoid short-command shadowing.
   */
  resolveStartCommandInput(input: string): ResolvedStartCommand | undefined {
    const trimmedInput = input.trim();
    const normalizedInput = this.normalizeCommand(trimmedInput);

    if (!normalizedInput) {
      return undefined;
    }

    const commandIndex = this.getAllFlows()
      .flatMap((flow) =>
        (flow.start?.commands ?? []).map((command) => ({
          flow,
          command,
          normalizedCommand: this.normalizeCommand(command),
        }))
      )
      .filter((item) => item.normalizedCommand.length > 0)
      .sort(
        (left, right) =>
          right.normalizedCommand.length - left.normalizedCommand.length
      );

    for (const candidate of commandIndex) {
      if (normalizedInput === candidate.normalizedCommand) {
        return {
          flow: candidate.flow,
          command: candidate.command,
        };
      }

      const prefix = `${candidate.normalizedCommand} `;
      if (normalizedInput.startsWith(prefix)) {
        const payload = trimmedInput.slice(candidate.command.length).trim();
        return {
          flow: candidate.flow,
          command: candidate.command,
          payload: payload || undefined,
        };
      }
    }

    return undefined;
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

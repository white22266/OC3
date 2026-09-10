import type { Agent } from '@oc3/shared';
import type { WorldPoint } from '../../data/office-layout';
import { getAgentPresentation } from '../../lib/agent-presentation';

export interface WorldAgentModel {
  id: string; name: string; role: string; state: Agent['state']; position: WorldPoint;
  marker: string; isSleeping: boolean; tone: ReturnType<typeof getAgentPresentation>['tone'];
}
export interface WorldModel { agents: WorldAgentModel[]; }
export function buildWorldModel(agents: Agent[], positions: Record<string, WorldPoint>): WorldModel {
  return { agents: agents.map((agent) => {
    const position = positions[agent.id];
    if (!position) throw new Error(`Missing home position for agent: ${agent.id}`);
    const presentation = getAgentPresentation(agent.state);
    return { id: agent.id, name: agent.name, role: agent.role, state: agent.state, position, marker: presentation.marker, isSleeping: presentation.isSleeping, tone: presentation.tone };
  }) };
}

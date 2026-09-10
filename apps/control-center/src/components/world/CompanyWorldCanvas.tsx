'use client';
import type { Agent } from '@oc3/shared';
interface Props { agents: Agent[]; selectedAgentId: string; onSelectAgent: (agentId: string) => void; }
export function CompanyWorldCanvas({ agents, selectedAgentId, onSelectAgent }: Props) {
  return <div className="world-stage-wrap" data-selected-agent={selectedAgentId}><div>2D WORLD BOOTSTRAP · PixiJS scene lands in the next task.</div><div className="sr-only" aria-label="Agent selection controls">{agents.map((agent) => <button key={agent.id} type="button" aria-label={`Select ${agent.name}`} onClick={() => onSelectAgent(agent.id)}>{agent.name}</button>)}</div></div>;
}

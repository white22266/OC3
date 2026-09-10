import { describe, expect, it } from 'vitest';
import { seedAgents } from '../../data/agents';
import { agentHomePositions } from '../../data/office-layout';
import { buildWorldModel } from './world-model';

describe('buildWorldModel', () => {
  it('resolves every seeded agent to a configured home position', () => {
    const model = buildWorldModel(seedAgents, agentHomePositions);
    expect(model.agents).toHaveLength(seedAgents.length);
    expect(model.agents.every((agent) => Number.isFinite(agent.position.x) && Number.isFinite(agent.position.y))).toBe(true);
  });
  it('carries the idle sleeping marker into the renderer model', () => {
    const model = buildWorldModel(seedAgents, agentHomePositions);
    expect(model.agents.find((agent) => agent.id === 'forge')).toMatchObject({ isSleeping: true, marker: 'Zzz' });
  });
});

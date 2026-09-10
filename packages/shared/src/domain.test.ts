import { describe, expect, it } from 'vitest';
import { AGENT_STATES, makeAgent } from './domain';

describe('shared agent domain', () => {
  it('exposes the complete company-world state vocabulary', () => {
    expect(AGENT_STATES).toEqual([
      'idle',
      'queued',
      'working',
      'thinking',
      'using_tool',
      'communicating',
      'waiting_approval',
      'completed',
      'error',
      'paused',
      'offline',
    ]);
  });

  it('creates seeded agents as explicitly disconnected from runtime', () => {
    const agent = makeAgent({ id: 'yoda', name: 'Yoda', role: 'Lead Agent', state: 'working' });
    expect(agent.runtimeConnected).toBe(false);
  });
});

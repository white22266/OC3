import { describe, expect, it } from 'vitest';
import { getAgentPresentation } from './agent-presentation';

describe('getAgentPresentation', () => {
  it('renders idle as sleeping with Zzz', () => {
    expect(getAgentPresentation('idle')).toEqual({ label: 'Idle', tone: 'sleeping', isSleeping: true, marker: 'Zzz' });
  });
  it('keeps working agents awake', () => { expect(getAgentPresentation('working').isSleeping).toBe(false); });
  it('keeps paused visually distinct from idle', () => {
    expect(getAgentPresentation('paused')).toMatchObject({ isSleeping: true, marker: 'Ⅱ', tone: 'paused' });
  });
});

import { describe, expect, it } from 'vitest';
import { agentCharacterProfiles } from './character-profiles';

describe('agentCharacterProfiles', () => {
  it('gives every seeded OC3 agent a distinct visual identity', () => {
    const ids = ['yoda', 'bb8', 'aria', 'forge', 'research', 'ops'];
    const profiles = ids.map((id) => agentCharacterProfiles[id]);

    expect(profiles.every(Boolean)).toBe(true);
    expect(new Set(profiles.map((profile) => profile.hairStyle)).size).toBe(ids.length);
    expect(new Set(profiles.map((profile) => profile.outfit)).size).toBeGreaterThanOrEqual(4);
  });

  it('uses natural RPG silhouettes instead of the old block character template', () => {
    expect(agentCharacterProfiles.yoda.hairStyle).toBe('layered-messy');
    expect(agentCharacterProfiles.bb8.hairStyle).toBe('soft-spiky');
    expect(agentCharacterProfiles.aria.hairStyle).toBe('high-ponytail');
    expect(agentCharacterProfiles.research.hairStyle).toBe('side-swept-bob');
    expect(agentCharacterProfiles.ops.hairStyle).toBe('shaggy-back');
  });
});

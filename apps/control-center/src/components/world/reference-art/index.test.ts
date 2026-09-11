import { describe, expect, it } from 'vitest';
import { APPROVED_WORLD_ART_SIZE, approvedWorldArtDataUri, approvedWorldHotspots } from './index';

describe('approved company world art', () => {
  it('uses the locked visual reference as the world layer', () => {
    expect(APPROVED_WORLD_ART_SIZE).toEqual({ width: 1191, height: 768 });
    expect(approvedWorldArtDataUri.startsWith('data:image/webp;base64,UklGR')).toBe(true);
    expect(approvedWorldArtDataUri.length).toBeGreaterThan(90000);
  });

  it('keeps every seeded agent interactive over the approved art', () => {
    expect(Object.keys(approvedWorldHotspots).sort()).toEqual(
      ['aria', 'bb8', 'forge', 'ops', 'research', 'yoda'].sort(),
    );
  });
});

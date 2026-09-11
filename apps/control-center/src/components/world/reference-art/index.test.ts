import { describe, expect, it } from 'vitest';
import { approvedWorldStaticAssetPath } from './static-asset';
import { APPROVED_WORLD_ART_SIZE, approvedWorldHotspots } from './index';

describe('approved company world art', () => {
  it('uses the locked visual reference as a real public asset', () => {
    expect(APPROVED_WORLD_ART_SIZE).toEqual({ width: 1191, height: 768 });
    expect(approvedWorldStaticAssetPath).toBe('/world/company-world.webp');
  });

  it('keeps every seeded agent interactive over the approved art', () => {
    expect(Object.keys(approvedWorldHotspots).sort()).toEqual(
      ['aria', 'bb8', 'forge', 'ops', 'research', 'yoda'].sort(),
    );
  });
});

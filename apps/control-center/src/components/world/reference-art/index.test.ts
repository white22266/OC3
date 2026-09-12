import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { approvedWorldStaticAssetPath } from './static-asset';
import { APPROVED_WORLD_ART_SIZE, approvedWorldHotspots } from './index';

describe('approved company world art', () => {
  it('uses the locked visual reference as a real public asset', () => {
    expect(APPROVED_WORLD_ART_SIZE).toEqual({ width: 1191, height: 768 });
    expect(approvedWorldStaticAssetPath).toBe('/world/company-world.webp');
  });

  it('ships a complete WebP instead of a truncated image payload', () => {
    const artwork = readFileSync(resolve(process.cwd(), 'public/world/company-world.webp'));

    expect(artwork.byteLength).toBeGreaterThan(100_000);
    expect(artwork.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(artwork.subarray(8, 12).toString('ascii')).toBe('WEBP');
  });

  it('keeps every seeded agent interactive over the approved art', () => {
    expect(Object.keys(approvedWorldHotspots).sort()).toEqual(
      ['aria', 'bb8', 'forge', 'ops', 'research', 'yoda'].sort(),
    );
  });
});

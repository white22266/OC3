import { describe, expect, it } from 'vitest';
import { officeArtDirection } from './office-art-direction';

describe('officeArtDirection', () => {
  it('keeps the approved dense warm pixel-office composition', () => {
    expect(officeArtDirection.wallDepth).toBeGreaterThanOrEqual(3);
    expect(officeArtDirection.warmLightCount).toBeGreaterThanOrEqual(10);
    expect(officeArtDirection.plantCount).toBeGreaterThanOrEqual(14);
    expect(officeArtDirection.decorDensity).toBe('high');
    expect(officeArtDirection.rooms).toEqual(expect.arrayContaining([
      'meeting-room',
      'lobby',
      'ai-lab',
      'lounge',
      'servers',
    ]));
  });
});

import part00 from './part00';
import part01 from './part01';
import part02 from './part02';
import part03 from './part03';
import part04 from './part04';
import part05 from './part05';
import part06 from './part06';

export const APPROVED_WORLD_ART_SIZE = { width: 1191, height: 768 } as const;

export const approvedWorldArtDataUri = `data:image/webp;base64,${[
  part00,
  part01,
  part02,
  part03,
  part04,
  part05,
  part06,
].join('')}`;

export const approvedWorldHotspots = {
  yoda: { x: 244, y: 365, width: 132, height: 146 },
  bb8: { x: 558, y: 365, width: 132, height: 146 },
  aria: { x: 858, y: 365, width: 132, height: 146 },
  forge: { x: 455, y: 582, width: 142, height: 132 },
  research: { x: 695, y: 582, width: 142, height: 132 },
  ops: { x: 970, y: 652, width: 132, height: 146 },
} as const;

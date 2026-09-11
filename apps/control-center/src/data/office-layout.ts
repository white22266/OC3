export interface WorldPoint { x: number; y: number; }
export interface OfficeZone {
  id: string; label: string; x: number; y: number; width: number; height: number;
  kind: 'room' | 'desk' | 'lounge' | 'lobby';
}

export const WORLD_SIZE = { width: 1200, height: 820 } as const;

export const officeZones: OfficeZone[] = [
  { id: 'meeting-room', label: 'MEETING ROOM', x: 26, y: 26, width: 372, height: 244, kind: 'room' },
  { id: 'lobby', label: 'OC3 · IDEAS · AGENTS · IMPACT', x: 414, y: 26, width: 300, height: 190, kind: 'lobby' },
  { id: 'ai-lab', label: 'AI LAB / MODELS', x: 730, y: 26, width: 444, height: 244, kind: 'room' },
  { id: 'yoda-desk', label: 'YODA · LEAD AGENT', x: 142, y: 300, width: 250, height: 190, kind: 'desk' },
  { id: 'bb8-desk', label: 'BB8 · MESSENGER', x: 448, y: 300, width: 250, height: 190, kind: 'desk' },
  { id: 'aria-desk', label: 'ARIA · APPROVAL', x: 754, y: 300, width: 250, height: 190, kind: 'desk' },
  { id: 'lounge', label: 'LOUNGE', x: 26, y: 535, width: 324, height: 258, kind: 'lounge' },
  { id: 'shared-work', label: 'AGENT FLOOR', x: 374, y: 535, width: 414, height: 258, kind: 'desk' },
  { id: 'servers', label: 'SERVERS / LOGS', x: 814, y: 515, width: 360, height: 278, kind: 'room' },
];

export const agentHomePositions: Record<string, WorldPoint> = {
  yoda: { x: 264, y: 402 },
  bb8: { x: 572, y: 402 },
  aria: { x: 880, y: 402 },
  forge: { x: 462, y: 665 },
  research: { x: 670, y: 665 },
  ops: { x: 1000, y: 674 },
};

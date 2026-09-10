export interface WorldPoint { x: number; y: number; }
export interface OfficeZone {
  id: string; label: string; x: number; y: number; width: number; height: number;
  kind: 'room' | 'desk' | 'lounge' | 'lobby';
}

export const WORLD_SIZE = { width: 1200, height: 760 } as const;
export const officeZones: OfficeZone[] = [
  { id: 'meeting-room', label: 'MEETING ROOM', x: 28, y: 28, width: 350, height: 220, kind: 'room' },
  { id: 'lobby', label: 'OC3 · IDEAS · AGENTS · IMPACT', x: 404, y: 28, width: 304, height: 220, kind: 'lobby' },
  { id: 'ai-lab', label: 'AI LAB / MODELS', x: 734, y: 28, width: 438, height: 220, kind: 'room' },
  { id: 'yoda-desk', label: 'YODA · LEAD AGENT', x: 138, y: 290, width: 250, height: 160, kind: 'desk' },
  { id: 'bb8-desk', label: 'BB8 · MESSENGER', x: 446, y: 290, width: 250, height: 160, kind: 'desk' },
  { id: 'aria-desk', label: 'ARIA · APPROVAL', x: 754, y: 290, width: 250, height: 160, kind: 'desk' },
  { id: 'lounge', label: 'LOUNGE', x: 28, y: 492, width: 322, height: 238, kind: 'lounge' },
  { id: 'shared-work', label: 'AGENT FLOOR', x: 374, y: 492, width: 414, height: 238, kind: 'desk' },
  { id: 'servers', label: 'SERVERS / LOGS', x: 814, y: 470, width: 358, height: 260, kind: 'room' },
];
export const agentHomePositions: Record<string, WorldPoint> = {
  yoda: { x: 264, y: 378 }, bb8: { x: 572, y: 378 }, aria: { x: 880, y: 378 },
  forge: { x: 462, y: 610 }, research: { x: 670, y: 610 }, ops: { x: 1000, y: 620 },
};

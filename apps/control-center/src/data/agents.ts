import type { Agent } from '@oc3/shared';

const now = '2026-09-10T10:24:00+08:00';

export const seedAgents: Agent[] = [
  {
    id: 'yoda', name: 'Yoda', role: 'Lead Agent', state: 'working',
    currentTask: 'Review proposals (3 pending)', model: { provider: 'Preview', name: 'OC3 Seed Model' },
    uptimeLabel: '3h 42m', completedToday: 12, runtimeConnected: false,
    recentActivity: [
      { id: 'ya1', agentId: 'yoda', type: 'review', message: 'Reviewed marketing brief', occurredAt: now },
      { id: 'ya2', agentId: 'yoda', type: 'delegate', message: 'Assigned task to Aria', occurredAt: now },
    ],
  },
  { id: 'bb8', name: 'BB8', role: 'Messenger Agent', state: 'working', currentTask: 'Route internal handoff', model: { provider: 'Preview', name: 'OC3 Seed Model' }, uptimeLabel: '2h 18m', completedToday: 8, runtimeConnected: false },
  { id: 'aria', name: 'Aria', role: 'Approval Agent', state: 'working', currentTask: 'Review pending approval', model: { provider: 'Preview', name: 'OC3 Seed Model' }, uptimeLabel: '2h 57m', completedToday: 6, runtimeConnected: false },
  { id: 'forge', name: 'Forge', role: 'Builder Agent', state: 'idle', model: { provider: 'Preview', name: 'OC3 Seed Model' }, uptimeLabel: '1h 09m', completedToday: 4, runtimeConnected: false },
  { id: 'research', name: 'Research', role: 'Research Agent', state: 'idle', model: { provider: 'Preview', name: 'OC3 Seed Model' }, uptimeLabel: '58m', completedToday: 3, runtimeConnected: false },
  { id: 'ops', name: 'Ops', role: 'Operations Agent', state: 'using_tool', currentTask: 'Inspect server logs', model: { provider: 'Preview', name: 'OC3 Seed Model' }, uptimeLabel: '4h 11m', completedToday: 15, runtimeConnected: false },
];

'use client';

import { useMemo, useState } from 'react';
import { seedAgents } from '../../data/agents';
import { AgentPanel } from '../agent/AgentPanel';
import { Sidebar } from '../navigation/Sidebar';
import { TopStatusBar } from '../shell/TopStatusBar';
import { CompanyWorldCanvas } from '../world/CompanyWorldCanvas';

export function CommandCenter() {
  const [selectedAgentId, setSelectedAgentId] = useState(seedAgents[0]?.id ?? '');
  const selectedAgent = useMemo(
    () => seedAgents.find((agent) => agent.id === selectedAgentId) ?? seedAgents[0],
    [selectedAgentId],
  );

  if (!selectedAgent) return <main className="empty-state">No seeded agents configured.</main>;

  return <main className="command-center">
    <TopStatusBar agents={seedAgents} />
    <Sidebar />
    <section className="world-shell" aria-label="OC3 company world">
      <CompanyWorldCanvas agents={seedAgents} selectedAgentId={selectedAgent.id} onSelectAgent={setSelectedAgentId} />
    </section>
    <AgentPanel agent={selectedAgent} />
  </main>;
}

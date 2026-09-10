import type { Agent } from '@oc3/shared';
import { getAgentPresentation } from '../../lib/agent-presentation';
interface AgentPanelProps { agent: Agent; }
export function AgentPanel({ agent }: AgentPanelProps) {
  const presentation = getAgentPresentation(agent.state);
  return <aside className="agent-panel" aria-label="Selected agent details">
    <div className="panel-kicker">AGENT</div>
    <div className="agent-hero"><div className={`portrait portrait-${agent.id}`} aria-hidden="true"><div className="portrait-hair" /><div className="portrait-face"><span /><span /></div><div className="portrait-body" /></div><div><h2>{agent.name}</h2><div className="agent-role">{agent.role}</div><p className="agent-quote">“Turn ideas into impact.”</p></div></div>
    <dl className="agent-stats"><div><dt>Status</dt><dd><span className={`status-dot tone-${presentation.tone}`} />{presentation.label}</dd></div><div><dt>Current Task</dt><dd>{agent.currentTask ?? 'No active task'}</dd></div><div><dt>Model</dt><dd>{agent.model?.name ?? 'Unavailable'}</dd></div><div><dt>Uptime</dt><dd>{agent.uptimeLabel ?? 'Unavailable'}</dd></div><div><dt>Completed Today</dt><dd>{agent.completedToday ?? 0} tasks</dd></div></dl>
    <div className="preview-callout">PHASE 1 PREVIEW · runtime commands are not connected yet.</div>
    <div className="agent-actions"><button type="button" disabled>▤ View Logs</button><button type="button" disabled>▶ Assign Task</button><button type="button" disabled>Ⅱ Pause</button><button type="button" className="resume" disabled>▶ Resume</button></div>
    <div className="activity-block"><h3>RECENT ACTIVITY</h3>{agent.recentActivity?.length ? agent.recentActivity.map((event) => <p key={event.id}>{event.message}</p>) : <p>Seeded preview — no live activity yet.</p>}</div>
    <div className="panel-footer-quote">“GOOD SYSTEMS<br />FREE GOOD PEOPLE.”<br /><strong>— OC3</strong></div>
  </aside>;
}

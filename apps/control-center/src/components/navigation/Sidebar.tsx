const primaryItems = [['Agents', '◉'], ['Tasks', '▣'], ['Approvals', '✓'], ['Logs', '▤'], ['Models', '⌘']] as const;
const secondaryItems = [['Company', '▦'], ['Settings', '⚙']] as const;
export function Sidebar() {
  return <aside className="sidebar" aria-label="Primary navigation">
    <div className="nav-stack">{primaryItems.map(([label, icon], index) => <button className={`nav-item ${index === 0 ? 'active' : ''}`} type="button" key={label}><span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span>{label === 'Tasks' ? <span className="nav-badge">3</span> : null}{label === 'Approvals' ? <span className="nav-badge">2</span> : null}</button>)}</div>
    <div className="nav-divider" />
    <div className="nav-stack">{secondaryItems.map(([label, icon]) => <button className="nav-item" type="button" key={label}><span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span></button>)}</div>
    <div className="sidebar-motto">GOOD<br />WORK<br />HIGHER<br />POSSIBILITIES.</div>
  </aside>;
}

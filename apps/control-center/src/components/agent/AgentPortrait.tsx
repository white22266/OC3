import { getAgentCharacterProfile } from '../world/character-profiles';

interface AgentPortraitProps { agentId: string; }

function color(value: number) {
  return `#${value.toString(16).padStart(6, '0')}`;
}

function hairPath(style: string) {
  switch (style) {
    case 'layered-messy': return 'M13 35 L16 21 L25 24 L30 13 L39 22 L48 12 L55 22 L65 18 L69 34 L61 43 L54 36 L48 46 L40 37 L32 45 L24 35 L17 42 Z';
    case 'soft-spiky': return 'M12 36 L17 23 L26 26 L32 13 L39 23 L47 11 L52 24 L64 18 L69 34 L62 43 L54 37 L48 46 L39 38 L31 45 L23 36 L16 42 Z';
    case 'high-ponytail': return 'M13 35 L17 22 L29 16 L42 16 L55 21 L65 31 L63 43 L55 38 L49 45 L40 38 L31 45 L23 37 L17 42 Z';
    case 'sleepy-undercut': return 'M14 35 L19 23 L31 17 L47 18 L61 25 L67 35 L61 41 L51 37 L43 44 L32 39 L23 43 L16 39 Z';
    case 'side-swept-bob': return 'M12 35 L17 22 L29 15 L43 16 L56 22 L67 34 L66 51 L57 58 L52 40 L41 47 L29 40 L23 58 L14 50 Z';
    case 'shaggy-back': return 'M12 35 L18 22 L28 15 L39 21 L49 13 L59 23 L68 34 L64 49 L55 40 L48 52 L39 42 L30 52 L22 41 L15 47 Z';
    default: return 'M14 35 L18 22 L30 16 L49 16 L62 24 L67 37 L60 43 L50 39 L40 45 L29 39 L19 44 Z';
  }
}

export function AgentPortrait({ agentId }: AgentPortraitProps) {
  const profile = getAgentCharacterProfile(agentId);
  return <svg
    className="agent-portrait-svg"
    data-testid="agent-portrait"
    data-hair-style={profile.hairStyle}
    viewBox="0 0 80 80"
    width="80"
    height="80"
    style={{ imageRendering: 'pixelated', display: 'block', borderRadius: 4 }}
    role="img"
    aria-label={`${agentId} portrait`}
  >
    <defs>
      <linearGradient id={`bg-${agentId}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#315f89" />
        <stop offset="1" stopColor="#173754" />
      </linearGradient>
    </defs>
    <rect width="80" height="80" rx="4" fill={`url(#bg-${agentId})`} />
    <rect x="4" y="4" width="72" height="72" rx="3" fill="none" stroke="#66c7f6" strokeWidth="2" />

    {profile.hairStyle === 'high-ponytail' ? <circle cx="65" cy="20" r="10" fill={color(profile.hairShadow)} /> : null}
    {profile.hairStyle === 'shaggy-back' ? <path d="M16 31 L10 44 L17 58 L26 52 L33 64 L42 53 L51 63 L63 52 L69 39 L63 27 Z" fill={color(profile.hairShadow)} /> : null}

    <path d="M27 55 L22 62 L22 78 L58 78 L58 62 L53 55 Z" fill={color(profile.jacket)} stroke="#132338" strokeWidth="2" />
    <rect x="34" y="57" width="12" height="21" fill={color(profile.shirt)} />
    <rect x="39" y="59" width="3" height="15" fill={color(profile.accent)} />

    <rect x="21" y="28" width="38" height="35" rx="10" fill={color(profile.skin)} stroke="#1a2230" strokeWidth="2" />
    <path d={hairPath(profile.hairStyle)} fill={color(profile.hair)} stroke={color(profile.hairShadow)} strokeWidth="2" strokeLinejoin="round" />
    <path d="M22 31 L34 22 L47 23 L57 30" fill="none" stroke={color(profile.hairHighlight)} strokeWidth="4" strokeLinecap="square" opacity="0.7" />

    <rect x="29" y="43" width="5" height="8" rx="1" fill="#101722" />
    <rect x="46" y="43" width="5" height="8" rx="1" fill="#101722" />
    <rect x="30" y="44" width="2" height="2" fill="#ffffff" opacity="0.85" />
    <rect x="47" y="44" width="2" height="2" fill="#ffffff" opacity="0.85" />
    <rect x="37" y="56" width="7" height="2" fill="#bf5d67" />
    <rect x="24" y="53" width="5" height="2" fill={color(profile.blush)} opacity="0.55" />
    <rect x="51" y="53" width="5" height="2" fill={color(profile.blush)} opacity="0.55" />

    {profile.accessory === 'glasses' ? <g fill="none" stroke="#5e4937" strokeWidth="2"><rect x="25" y="40" width="12" height="12" rx="2" /><rect x="43" y="40" width="12" height="12" rx="2" /><path d="M37 45 H43" /></g> : null}
    {profile.accessory === 'earpiece' ? <circle cx="59" cy="47" r="3" fill="#4adfff" /> : null}
    {profile.accessory === 'hair-ribbon' ? <path d="M59 18 L66 14 L64 23 Z" fill={color(profile.accent)} /> : null}
  </svg>;
}

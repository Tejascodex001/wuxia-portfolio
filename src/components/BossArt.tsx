/** Small hand-drawn portraits of the three flagship bosses and the hero. */
type Props = { id: 'flame' | 'sanctum' | 'hum' | 'hero'; className?: string; title?: string };

const BossArt = ({ id, className, title }: Props) => {
  const common = { className, role: title ? 'img' : undefined, 'aria-label': title, 'aria-hidden': title ? undefined : true } as const;

  if (id === 'hero') {
    return (
      <svg viewBox="0 0 120 160" {...common}>
        <g stroke="#0f0d0b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M60 82L46 128M60 82L76 128" />
          <path d="M60 82V46" />
          <path d="M60 52L42 74M60 52L80 76" />
          <path d="M80 76L100 120" strokeWidth="7" />
          <path d="M80 76L94 104" stroke="#fff" strokeWidth="3" />
          <circle cx="60" cy="30" r="14" fill="#efe8d6" />
          <path d="M47 25a14 14 0 0126 0" stroke="#d62a1e" strokeWidth="5" />
          <path d="M48 28q-18-4-26 8" stroke="#d62a1e" strokeWidth="4" />
        </g>
      </svg>
    );
  }

  if (id === 'flame') {
    return (
      <svg viewBox="0 0 120 120" {...common}>
        <g stroke="#0f0d0b" strokeWidth="4" strokeLinejoin="round">
          <circle cx="60" cy="98" r="19" fill="#b5541f" />
          <circle cx="60" cy="98" r="9" fill="#6d2f10" />
          <path d="M60 79v-4M60 117v4M41 98h-4M79 98h4M46 84l-3-3M74 84l3-3M46 112l-3 3M74 112l3 3" stroke="#b5541f" strokeWidth="5" />
          <rect x="47" y="58" width="26" height="22" fill="#f3e3b5" />
          <path d="M50 80v8M60 80v11M70 80v7" stroke="#f3e3b5" strokeWidth="5" strokeLinecap="round" />
          <circle cx="60" cy="68" r="6" fill="#ffb347" />
          <rect x="38" y="30" width="44" height="28" fill="#e8e0c8" />
          <g stroke="none">
            <rect x="44" y="36" width="7" height="7" fill="#ff8a1f" /><rect x="53" y="36" width="7" height="7" fill="#ffb347" /><rect x="62" y="36" width="7" height="7" fill="#ff8a1f" />
            <rect x="44" y="45" width="7" height="7" fill="#ffb347" /><rect x="53" y="45" width="7" height="7" fill="#d62a1e" /><rect x="62" y="45" width="7" height="7" fill="#ffb347" /><rect x="71" y="45" width="7" height="7" fill="#ff8a1f" />
          </g>
          <circle cx="60" cy="18" r="12" fill="#ffd23f" />
          <circle cx="56" cy="16" r="2" fill="#0f0d0b" /><circle cx="64" cy="16" r="2" fill="#0f0d0b" />
          <path d="M50 4l3 6 4-8 3 8 4-8 3 6" fill="#ff8a1f" stroke="none" />
        </g>
      </svg>
    );
  }

  if (id === 'sanctum') {
    return (
      <svg viewBox="0 0 120 120" {...common}>
        <g strokeLinejoin="round" strokeLinecap="round">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#3ef2d0" strokeWidth="3" strokeDasharray="9 6" />
          <circle cx="60" cy="60" r="40" fill="none" stroke="#3ef2d0" strokeWidth="3" strokeDasharray="5 7" opacity=".7" />
          <path d="M44 38q-16 24-18 56l10-6 8 8 8-8 8 8 8-8 8 8 8-8 8 8 4-6q-4-32-20-56z" fill="#241d36" stroke="#efe8d6" strokeWidth="3" />
          <circle cx="60" cy="30" r="14" fill="#241d36" stroke="#efe8d6" strokeWidth="3" />
          <circle cx="60" cy="31" r="4" fill="#3ef2d0" /><path d="M57 34h6l2 8h-10z" fill="#3ef2d0" />
          <g fill="#3ef2d0"><rect x="51" y="52" width="6" height="6" /><rect x="63" y="52" width="6" height="6" /><rect x="45" y="60" width="6" height="6" /><rect x="69" y="60" width="6" height="6" /><rect x="57" y="68" width="6" height="6" /></g>
          <path d="M98 100V34" stroke="#efe8d6" strokeWidth="4" />
          <rect x="91" y="24" width="14" height="12" fill="#e0a82e" stroke="#0f0d0b" strokeWidth="2" />
          <path d="M94 24a4 4 0 018 0" fill="none" stroke="#0f0d0b" strokeWidth="2" />
          <circle cx="12" cy="60" r="5" fill="#fff" stroke="#3ef2d0" strokeWidth="2" /><circle cx="60" cy="8" r="5" fill="#fff" stroke="#3ef2d0" strokeWidth="2" /><circle cx="108" cy="60" r="5" fill="#fff" stroke="#3ef2d0" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" {...common}>
      <g strokeLinejoin="round" strokeLinecap="round">
        <g fill="#ff7aa8" stroke="#0f0d0b" strokeWidth="3">
          <rect x="22" y="94" width="8" height="20" /><rect x="33" y="100" width="8" height="14" /><rect x="44" y="90" width="8" height="24" /><rect x="55" y="98" width="8" height="16" />
          <rect x="66" y="88" width="8" height="26" /><rect x="77" y="100" width="8" height="14" /><rect x="88" y="94" width="8" height="20" />
        </g>
        <circle cx="60" cy="58" r="40" fill="#0b0b10" stroke="#0f0d0b" strokeWidth="5" />
        <circle cx="60" cy="58" r="33" fill="none" stroke="#fff" strokeOpacity=".2" /><circle cx="60" cy="58" r="27" fill="none" stroke="#fff" strokeOpacity=".2" /><circle cx="60" cy="58" r="21" fill="none" stroke="#fff" strokeOpacity=".2" />
        <circle cx="60" cy="58" r="15" fill="#e0245e" />
        <text x="60" y="63" textAnchor="middle" fontFamily="Bangers" fontSize="14" fill="#fff">HUM</text>
        <path d="M22 54a38 38 0 0176 0" fill="none" stroke="#e0245e" strokeWidth="9" />
        <rect x="10" y="48" width="15" height="30" rx="6" fill="#e0245e" stroke="#0f0d0b" strokeWidth="3" />
        <rect x="95" y="48" width="15" height="30" rx="6" fill="#e0245e" stroke="#0f0d0b" strokeWidth="3" />
        <g fill="#2b2b33" stroke="#0f0d0b" strokeWidth="3"><circle cx="18" cy="100" r="11" /><circle cx="102" cy="100" r="11" /></g>
        <g fill="#e0245e"><circle cx="18" cy="100" r="4" /><circle cx="102" cy="100" r="4" /></g>
        <rect x="39" y="55" width="5" height="5" fill="#d62a1e" /><rect x="76" y="55" width="5" height="5" fill="#d62a1e" />
      </g>
    </svg>
  );
};

export default BossArt;

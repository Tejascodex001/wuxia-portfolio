import { useRef, useState, type KeyboardEvent } from 'react';
import BossArt from '@/components/BossArt';
import { toast } from '@/components/ui/sonner';
import { background, featured, intro, otherWork, profile, toolbox, workshop } from '@/data/content';

type Tab = 'profile' | 'bosses' | 'moves' | 'saves' | 'contact';
const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'bosses', label: 'Bosses' },
  { id: 'moves', label: 'Moves' },
  { id: 'saves', label: 'Save files' },
  { id: 'contact', label: 'Contact' },
];

/* Fighting-game command for every tool, as direction keys plus one button. */
type Cmd = { dirs: string[]; btn: 'J' | 'K' | 'P' };
const CMD: Record<string, Cmd> = {
  Rust: { dirs: ['↓', '↘', '→'], btn: 'J' },
  Kotlin: { dirs: ['↓', '↙', '←'], btn: 'K' },
  'C++': { dirs: ['→', '↓', '↘'], btn: 'J' },
  Python: { dirs: ['↓', '↓'], btn: 'J' },
  Dart: { dirs: ['←', '↙', '↓'], btn: 'K' },
  PyTorch: { dirs: ['↓', '↘', '→'], btn: 'K' },
  Candle: { dirs: ['→', '↓', '↘'], btn: 'K' },
  CUDA: { dirs: ['↓', '↓'], btn: 'K' },
  TensorFlow: { dirs: ['←', '↓', '→'], btn: 'J' },
  'scikit-learn': { dirs: ['↓', '←', '→'], btn: 'J' },
  OpenCV: { dirs: ['→', '←', '→'], btn: 'P' },
  Flutter: { dirs: ['↓', '↘', '→'], btn: 'P' },
  Docker: { dirs: ['↓', '↙', '←'], btn: 'P' },
  'Linux (Arch)': { dirs: ['←', '→'], btn: 'P' },
  Git: { dirs: ['↓', '→'], btn: 'P' },
};

/** Focus areas shown as bars. These show where my time goes, they are not test scores. */
const FOCUS = [
  { label: 'Rust', tag: 'Main', pct: 92 },
  { label: 'Machine learning', tag: 'Main', pct: 88 },
  { label: 'Systems (C++, Linux)', tag: 'Strong', pct: 78 },
  { label: 'Mobile (Flutter, Kotlin)', tag: 'Strong', pct: 76 },
];

const BOSS_TAG: Record<string, string> = { flame: 'Language models', sanctum: 'Private messenger', hum: 'Music player' };

const ReadMode = () => {
  const [tab, setTab] = useState<Tab>('profile');
  const [boss, setBoss] = useState(featured[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[n].id);
    tabRefs.current[TABS[n].id]?.focus();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast('Email copied', { description: profile.email });
    } catch {
      toast(profile.email, { description: 'Copy it from here.' });
    }
  };

  const picked = featured.find((f) => f.id === boss) ?? featured[0];

  return (
    <div className="cs">
      <div className="cs-top">
        <span>SELECT YOUR <b>READING</b></span>
        <span className="cs-top-r">1P · TEJAS GOWDA S · ROUND 1</span>
      </div>

      <div className="cs-stage">
        {/* ------------ fighter card ------------ */}
        <aside className="cs-fighter" aria-label="Profile card">
          <div className="cs-moon" aria-hidden />
          <BossArt id="hero" className="cs-hero" />
          <h1>TEJAS</h1>
          <div className="cs-class">{profile.title.toUpperCase()}</div>
          <p className="cs-real">{profile.name}</p>

          <div className="cs-stat">
            <div><span>CGPA · B.E. AI &amp; DATA SCIENCE</span><span>9.5</span></div>
            <div className="cs-bar"><i style={{ ['--w' as string]: '95%' }} /></div>
          </div>
          <div className="cs-focus-h">FOCUS AREAS</div>
          {FOCUS.map((f) => (
            <div className="cs-stat" key={f.label}>
              <div><span>{f.label.toUpperCase()}</span><span>{f.tag.toUpperCase()}</span></div>
              <div className="cs-bar"><i style={{ ['--w' as string]: `${f.pct}%` }} /></div>
            </div>
          ))}
          <p className="cs-aff">KENPATH · RTENSORLABS</p>
        </aside>

        {/* ------------ tabs ------------ */}
        <section className="cs-main">
          <div className="cs-tabs" role="tablist" aria-label="Sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                ref={(el) => { tabRefs.current[t.id] = el; }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`pane-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={onTabKey}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* PROFILE */}
          <div className="cs-pane" role="tabpanel" id="pane-profile" aria-labelledby="tab-profile" hidden={tab !== 'profile'}>
            {intro.map((p) => <p key={p} className="cs-p">{p}</p>)}
            <h2 className="cs-h">SPARRING HALL · MORE WORK</h2>
            <ul className="cs-list">
              {otherWork.map((w) => (
                <li key={w.name}>
                  <a href={w.href} target="_blank" rel="noopener noreferrer">{w.name}</a>
                  <small>{w.tags.join(' · ')}</small>
                </li>
              ))}
            </ul>
            <h2 className="cs-h">ALSO IN THE WORKSHOP</h2>
            <ul className="cs-list cs-list-soft">
              {workshop.map((w) => (
                <li key={w.name}>
                  <a href={w.href} target="_blank" rel="noopener noreferrer">{w.name}</a>
                  <small>{w.note}</small>
                </li>
              ))}
            </ul>
          </div>

          {/* BOSSES */}
          <div className="cs-pane" role="tabpanel" id="pane-bosses" aria-labelledby="tab-bosses" hidden={tab !== 'bosses'}>
            <div className="cs-roster" role="group" aria-label="Choose a flagship project">
              {featured.map((f, i) => (
                <button key={f.id} type="button" className="cs-pick" aria-pressed={boss === f.id} onClick={() => setBoss(f.id)}>
                  <span className="cs-n">{String(i + 1).padStart(2, '0')}</span>
                  <BossArt id={f.id} />
                  <b>{f.name}</b>
                  <small>{BOSS_TAG[f.id].toUpperCase()}</small>
                </button>
              ))}
            </div>
            <article className="cs-detail" aria-live="polite">
              <h2>{picked.name}</h2>
              <p className="cs-kk">{picked.kicker.toUpperCase()}</p>
              <p className="cs-p">{picked.blurb}</p>
              <div className="cs-hp"><b>STACK</b>{picked.stack.map((s) => <span key={s}>{s}</span>)}</div>
              <div className="cs-links">
                {picked.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label.toUpperCase()}</a>
                ))}
              </div>
            </article>
          </div>

          {/* MOVES */}
          <div className="cs-pane" role="tabpanel" id="pane-moves" aria-labelledby="tab-moves" hidden={tab !== 'moves'}>
            <div className="cs-legend" aria-hidden>
              <span><kbd className="cs-k">↓</kbd><kbd className="cs-k">↘</kbd><kbd className="cs-k">→</kbd> direction</span>
              <span><i className="cs-btn cs-btn-J">J</i> strike</span>
              <span><i className="cs-btn cs-btn-K">K</i> kick</span>
              <span><i className="cs-btn cs-btn-P">P</i> power</span>
            </div>
            {toolbox.map((g) => (
              <section key={g.id} className="cs-mv" aria-label={g.name}>
                <h2 className="cs-h">{g.name.toUpperCase()}</h2>
                <div className="cs-mv-head" aria-hidden>
                  <span>INPUT</span><span>MOVE</span><span>USED FOR</span>
                </div>
                <ul className="cs-mv-list">
                  {g.items.map((it, i) => {
                    const c = CMD[it.name] ?? { dirs: ['↓'], btn: 'J' as const };
                    return (
                      <li key={it.name} className="cs-mv-row" style={{ ['--i' as string]: i }}>
                        <span className="cs-keys" aria-label={`Input ${c.dirs.join(' ')} plus ${c.btn}`}>
                          {c.dirs.map((d, k) => <kbd key={k} className="cs-k" style={{ ['--k' as string]: k }}>{d}</kbd>)}
                          <span className="cs-plus" aria-hidden>+</span>
                          <i className={`cs-btn cs-btn-${c.btn}`} style={{ ['--k' as string]: c.dirs.length }}>{c.btn}</i>
                        </span>
                        <b className="cs-mv-name">{it.name}</b>
                        <span className="cs-mv-note">{it.note}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {/* SAVE FILES */}
          <div className="cs-pane" role="tabpanel" id="pane-saves" aria-labelledby="tab-saves" hidden={tab !== 'saves'}>
            <ol className="cs-slots">
              {background.map((b, i) => (
                <li key={b.id} className="cs-slot">
                  <b className="cs-slot-n">SLOT {i + 1}</b>
                  <div>
                    <h3>{b.title} · {b.place}</h3>
                    <p>{b.note}</p>
                  </div>
                  <span className="cs-when">{b.when.toUpperCase()}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* CONTACT */}
          <div className="cs-pane" role="tabpanel" id="pane-contact" aria-labelledby="tab-contact" hidden={tab !== 'contact'}>
            <p className="cs-p">Open to collaborating on AI and systems work. The fastest route is email.</p>
            <div className="cs-links">
              <button type="button" onClick={copyEmail} className="cs-copy">{profile.email}<small>CLICK TO COPY</small></button>
            </div>
            <div className="cs-links">
              <a href={`mailto:${profile.email}`}>WRITE MAIL</a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">GITHUB</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
              <a href={profile.x} target="_blank" rel="noopener noreferrer">X</a>
              <a href={profile.lab.url} target="_blank" rel="noopener noreferrer">RTENSORLABS</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReadMode;

import { background, featured, intro, otherWork, profile, stats, toolbox } from '@/data/content';

/** The whole portfolio as plain, readable HTML. Used for Read Mode and by assistive tech. */
const ReadContent = () => (
  <div className="read">
    <header>
      <p className="k">{profile.title} · {profile.employer.name} · {profile.lab.name}</p>
      <h1>{profile.name}</h1>
      <p className="lead">{profile.headline}</p>
      <p className="row">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={profile.x} target="_blank" rel="noopener noreferrer">X</a>
      </p>
    </header>

    <section aria-labelledby="r-about">
      <h2 id="r-about">About</h2>
      {intro.map((p) => <p key={p}>{p}</p>)}
      <ul className="stats">
        {stats.map((s) => <li key={s.label}><b>{s.value}</b> {s.label}</li>)}
      </ul>
    </section>

    <section aria-labelledby="r-work">
      <h2 id="r-work">Selected work</h2>
      {featured.map((f) => (
        <article key={f.id}>
          <h3>{f.name}</h3>
          <p className="k">{f.kicker}</p>
          <p>{f.blurb}</p>
          <p className="tags">{f.stack.map((s) => <span key={s}>{s}</span>)}</p>
          <p className="row">
            {f.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
          </p>
        </article>
      ))}
      <h3>More work</h3>
      <ul className="plain">
        {otherWork.map((w) => (
          <li key={w.name}>
            <a href={w.href} target="_blank" rel="noopener noreferrer">{w.name}</a>
            <span> · {w.tags.join(', ')}. {w.blurb}</span>
          </li>
        ))}
      </ul>
    </section>

    <section aria-labelledby="r-stack">
      <h2 id="r-stack">Stack</h2>
      <div className="cols">
        {toolbox.map((g) => (
          <div key={g.id}>
            <h3>{g.name}</h3>
            <ul className="plain">
              {g.items.map((i) => <li key={i.name}><b>{i.name}</b> <span>{i.note}</span></li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>

    <section aria-labelledby="r-bg">
      <h2 id="r-bg">Background</h2>
      <ul className="plain">
        {background.map((b) => (
          <li key={b.id}><b>{b.title}</b>, {b.place} <span>({b.when}). {b.note}</span></li>
        ))}
      </ul>
    </section>
  </div>
);

export default ReadContent;

import type { ReactNode } from 'react';
import Reveal from './Reveal';

type Props = { index: string; kicker: string; children: ReactNode; sub?: string };

const SectionHeading = ({ index, kicker, children, sub }: Props) => (
  <Reveal className="mb-12 md:mb-16">
    <div className="mb-5 flex items-center gap-4">
      <span className="kicker">{index}</span>
      <span className="h-px flex-1 bg-border" aria-hidden />
      <span className="kicker">{kicker}</span>
    </div>
    <h2 className="section-title">{children}</h2>
    {sub && <p className="mt-5 max-w-xl text-lg text-muted-foreground">{sub}</p>}
  </Reveal>
);

export default SectionHeading;

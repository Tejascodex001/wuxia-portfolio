import type { ReactNode } from 'react';
import Reveal from './Reveal';

type Props = { kicker: string; zh: string; children: ReactNode; sub?: string };

const SectionHeading = ({ kicker, zh, children, sub }: Props) => (
  <Reveal className="relative mb-14 md:mb-20">
    <span
      aria-hidden
      className="font-display pointer-events-none absolute -top-10 -left-2 select-none text-[9rem] leading-none text-foreground/[0.05] md:-top-16 md:text-[16rem]"
    >
      {zh}
    </span>
    <p className="kicker relative mb-4">{kicker}</p>
    <h2 className="section-title relative">{children}</h2>
    {sub && <p className="relative mt-5 max-w-xl text-lg text-muted-foreground">{sub}</p>}
  </Reveal>
);

export default SectionHeading;

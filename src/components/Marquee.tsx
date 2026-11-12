import { toolbox } from '@/data/content';

const names = toolbox.flatMap((g) => g.items.map((i) => i.name));

const Row = ({ hidden }: { hidden?: boolean }) => (
  <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
    {names.map((n, i) => (
      <li key={n} className="flex items-center">
        <span
          className={`font-display text-5xl font-normal leading-none tracking-tight md:text-7xl ${
            i % 2 === 0 ? 'text-outline' : 'text-foreground'
          }`}
        >
          {n}
        </span>
        <span className="mx-6 h-2.5 w-2.5 shrink-0 rounded-full bg-primary md:mx-10" aria-hidden />
      </li>
    ))}
  </ul>
);

const Marquee = () => (
  <div
    className="marquee overflow-hidden border-y border-border py-6 md:py-8"
    style={{
      maskImage: 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)',
    }}
  >
    <div className="marquee-track flex w-max">
      <Row />
      <Row hidden />
    </div>
  </div>
);

export default Marquee;

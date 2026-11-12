import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
    <span aria-hidden className="font-display pointer-events-none absolute select-none text-[22rem] leading-none text-foreground/[0.05]">
      迷
    </span>
    <p className="kicker relative mb-4">Error 404</p>
    <h1 className="font-display relative text-6xl text-foreground md:text-8xl">
      Lost in the <span className="text-primary">mist</span>
    </h1>
    <p className="relative mt-6 max-w-md text-lg text-muted-foreground">
      This path leads nowhere, wanderer. Even masters take a wrong turn in the Jianghu.
    </p>
    <Link
      to="/"
      className="relative mt-10 inline-flex items-center border-2 border-foreground bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      Return to the gate
    </Link>
  </main>
);

export default NotFound;

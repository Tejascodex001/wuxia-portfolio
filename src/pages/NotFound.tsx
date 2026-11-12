import { Link } from 'react-router-dom';
import ParticleText from '@/components/ParticleText';

const NotFound = () => (
  <main className="flex min-h-screen flex-col justify-center bg-background px-5 sm:px-8">
    <div className="mx-auto w-full max-w-5xl">
      <p className="kicker mb-4">Error 404</p>
      <h1 aria-label="404 page not found">
        <ParticleText text="404" height={260} align="left" className="font-display font-normal text-ink" />
      </h1>
      <p className="mt-8 max-w-md text-lg text-muted-foreground">
        This page does not exist. Push the digits around while you decide where to go next.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:-translate-y-0.5"
      >
        Back to the homepage
      </Link>
    </div>
  </main>
);

export default NotFound;

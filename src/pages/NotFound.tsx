import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="read-wrap" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
    <div>
      <p className="font-display" style={{ fontSize: 'clamp(110px, 28vw, 260px)', lineHeight: 0.85, margin: 0, color: '#d62a1e', textShadow: '8px 8px 0 #0f0d0b' }}>404</p>
      <p style={{ font: "400 28px Bangers, Impact, sans-serif", letterSpacing: '.08em', margin: '18px 0 6px' }}>LOST IN THE MIST</p>
      <p style={{ font: '14px "JetBrains Mono", monospace', maxWidth: '40ch', margin: '0 auto 22px' }}>This path leads nowhere, wanderer. Even masters take a wrong turn in the Jianghu.</p>
      <Link to="/" className="mini" style={{ fontSize: 20, padding: '4px 18px', textDecoration: 'none' }}>BACK TO THE GATE</Link>
    </div>
  </main>
);

export default NotFound;

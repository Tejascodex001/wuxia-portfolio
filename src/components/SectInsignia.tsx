const SectInsignia = () => {
  return (
    <div className="fixed top-6 left-6 z-50 opacity-90 hover:opacity-100 transition-opacity">
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg hover:scale-110 transition-transform duration-300"
      >
        {/* Outer circle - crimson */}
        <circle
          cx="30"
          cy="30"
          r="28"
          stroke="hsl(var(--crimson-red))"
          strokeWidth="2"
          fill="hsl(var(--rice-paper))"
          opacity="0.95"
        />

        {/* Inner circle - gold */}
        <circle
          cx="30"
          cy="30"
          r="24"
          stroke="hsl(var(--ancient-gold))"
          strokeWidth="1"
          fill="none"
        />

        {/* Bamboo sword - vertical */}
        <rect
          x="28"
          y="15"
          width="4"
          height="30"
          fill="hsl(var(--crimson-red))"
          rx="2"
        />

        {/* Sword guard - horizontal */}
        <rect
          x="20"
          y="23"
          width="20"
          height="3"
          fill="hsl(var(--ancient-gold))"
          rx="1.5"
        />

        {/* Bamboo nodes on sword */}
        <circle cx="30" cy="20" r="1.5" fill="hsl(var(--ancient-gold))" />
        <circle cx="30" cy="30" r="1.5" fill="hsl(var(--ancient-gold))" />
        <circle cx="30" cy="40" r="1.5" fill="hsl(var(--ancient-gold))" />
      </svg>
    </div>
  );
};

export default SectInsignia;

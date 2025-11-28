import { useEffect, useRef, useState } from 'react';

const milestones = [
  {
    title: 'Early Training',
    description: 'Began the journey with Python, learning the fundamental arts of programming',
    tech: 'Python',
  },
  {
    title: 'Sect Specialization',
    description: 'Mastered the profound techniques of Machine Learning and Deep Learning',
    tech: 'ML · DL · AI',
  },
  {
    title: 'Forging Strength',
    description: 'Honed skills in the demanding disciplines of C++ and Data Structures',
    tech: 'C++ · DSA',
  },
  {
    title: 'Current Trial',
    description: 'Undertaking the challenge of Distributed AI Systems architecture',
    tech: 'Distributed Systems',
  },
];

const About = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => [...prev, index]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll('.milestone-item');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <section id="about" className="py-24 px-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-calligraphy text-center text-wuxia-crimson mb-4">
          My Cultivation Path
        </h2>
        <div className="h-1 w-32 mx-auto bg-wuxia-gold mb-16" />

        <div className="relative">
          {/* Bamboo Timeline */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-wuxia-gold via-wuxia-shadow to-wuxia-gold" />

          <div className="space-y-16">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                data-index={index}
                className={`milestone-item relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Bamboo Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-wuxia-gold border-4 border-background shadow-lg z-10">
                  <div className="absolute inset-1 rounded-full bg-wuxia-crimson" />
                </div>

                {/* Content Card */}
                <div
                  className={`w-5/12 ${
                    visibleItems.includes(index) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                  } transition-all duration-700`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="bg-card p-6 rounded-lg shadow-xl border-2 border-wuxia-gold/30 hover:border-wuxia-crimson/50 transition-all hover:shadow-2xl ink-splash">
                    <h3 className="text-2xl font-calligraphy text-wuxia-crimson mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground mb-3">{milestone.description}</p>
                    <span className="inline-block px-3 py-1 bg-wuxia-gold/20 text-wuxia-shadow rounded-full text-sm font-semibold">
                      {milestone.tech}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

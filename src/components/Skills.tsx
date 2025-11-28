const skills = [
  {
    name: 'Blade of Logic',
    tech: 'C++',
    description: 'Forging efficient algorithms with precision and power',
  },
  {
    name: 'Thousand-Petals Computation Palm',
    tech: 'Machine Learning',
    description: 'Unleashing the wisdom of data patterns',
  },
  {
    name: 'Silent Shadow Step',
    tech: 'Go',
    description: 'Swift concurrent execution in distributed realms',
  },
  {
    name: 'Heavenly Pattern Recognition Arts',
    tech: 'Deep Learning',
    description: 'Perceiving hidden structures in chaos',
  },
  {
    name: 'Data Swordsmanship',
    tech: 'DSA',
    description: 'Mastery of structures and algorithmic flows',
  },
  {
    name: 'Script-weaving Arts',
    tech: 'Python',
    description: 'Crafting elegant solutions with serpentine grace',
  },
];

const Skills = () => {
  return (
    <section className="py-24 px-4 rice-paper">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-calligraphy text-center text-wuxia-crimson mb-4">
          Martial Techniques
        </h2>
        <div className="h-1 w-32 mx-auto bg-wuxia-gold mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-lg p-8 border-2 border-wuxia-gold/30 hover:border-wuxia-crimson transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ink-splash opacity-0 fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Ink brush accent */}
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="w-full h-full bg-gradient-to-br from-wuxia-crimson to-transparent rounded-bl-full" />
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-calligraphy text-wuxia-crimson mb-2 group-hover:text-wuxia-gold transition-colors">
                  {skill.name}
                </h3>
                
                <div className="h-0.5 w-12 bg-wuxia-gold mb-4 group-hover:w-24 transition-all duration-300" />
                
                <p className="text-sm text-wuxia-gold font-semibold mb-3 uppercase tracking-wider">
                  {skill.tech}
                </p>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {skill.description}
                </p>
              </div>

              {/* Corner decoration */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-wuxia-gold/30 group-hover:border-wuxia-crimson transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;

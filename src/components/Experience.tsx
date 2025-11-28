const experiences = [
  {
    title: 'Software Engineer Intern',
    clan: 'CGI',
    period: '2025',
    description: 'Practiced OCR techniques to extract structured information from images with high accuracy.',
    achievements: [
      'Developed OCR pipeline using PaddleOCR to extract structured information from images with high accuracy',
      'Integrated extracted text into RAG (Retrieval-Augmented Generation) pipeline',
      'Automated preprocessing and text-to-answer mapping workflows',
    ],
  }
];

const Experience = () => {
  return (
    <section className="py-24 px-4 rice-paper">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-calligraphy text-center text-wuxia-crimson mb-4">
          Realms of Experience
        </h2>
        <div className="h-1 w-32 mx-auto bg-wuxia-gold mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="relative opacity-0 fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Clan Banner */}
              <div className="bg-gradient-to-br from-wuxia-crimson to-wuxia-shadow text-wuxia-paper p-6 rounded-t-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className="w-full h-full border-8 border-wuxia-paper rounded-full transform translate-x-8 -translate-y-8" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-widest text-wuxia-gold mb-2">
                    {exp.clan}
                  </div>
                  <h3 className="text-xl font-calligraphy mb-1">
                    {exp.title}
                  </h3>
                  <div className="text-sm opacity-90">{exp.period}</div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-card p-6 rounded-b-lg border-2 border-wuxia-gold/30 border-t-0">
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {exp.description}
                </p>

                <div className="space-y-2">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-wuxia-crimson mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom decoration */}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-r-4 border-b-4 border-wuxia-gold/30 rounded-br-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

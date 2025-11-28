import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    title: 'Legacy Codebase Explainer',
    description: 'An intelligent system using LoRA fine-tuning to automatically document and explain complex legacy code, making ancient codebases accessible to modern practitioners.',
    tech: ['LLM', 'LoRA', 'Python', 'NLP'],
    github: 'https://github.com',
  },
  {
    title: 'OCR Image Comparison Tool',
    description: 'Advanced optical character recognition system with intelligent comparison algorithms, detecting differences between document versions with martial precision.',
    tech: ['Computer Vision', 'OCR', 'Python', 'OpenCV'],
    github: 'https://github.com',
  },
  {
    title: 'Distributed Multi-LLM Node System',
    description: 'A distributed architecture coordinating multiple large language models across nodes, achieving harmony between computational power and efficiency.',
    tech: ['Distributed Systems', 'LLM', 'Go', 'Microservices'],
    github: 'https://github.com',
  },
  {
    title: 'Wuxia-UI Portfolio',
    description: 'This elegant portfolio website combining traditional wuxia aesthetics with modern web technologies, creating a bridge between ancient art and digital mastery.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    github: 'https://github.com',
  },
];

const Projects = () => {
  const [openScroll, setOpenScroll] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted to-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-calligraphy text-center text-wuxia-crimson mb-4">
          Scrolls of Mastery
        </h2>
        <div className="h-1 w-32 mx-auto bg-wuxia-gold mb-16" />

        <div className="space-y-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="relative bg-wuxia-paper border-2 border-wuxia-gold/40 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all opacity-0 fade-up parchment-texture"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Scroll Header */}
              <button
                onClick={() => setOpenScroll(openScroll === index ? null : index)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-wuxia-gold/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-wuxia-crimson" />
                  <h3 className="text-2xl font-calligraphy text-wuxia-crimson">
                    {project.title}
                  </h3>
                </div>
                <div className={`text-wuxia-crimson transition-transform duration-300 ${openScroll === index ? 'rotate-90' : ''}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>

              {/* Scroll Content */}
              <div
                className={`overflow-hidden transition-all duration-700 ease-out ${
                  openScroll === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`px-6 pb-6 pt-2 border-t-2 border-wuxia-gold/20 transition-all duration-700 ${
                  openScroll === index ? 'scroll-text-reveal' : ''
                }`}>
                  <p className="text-foreground mb-4 leading-relaxed font-calligraphy-alt">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-wuxia-crimson/10 text-wuxia-crimson rounded-full text-sm font-medium border border-wuxia-crimson/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-wuxia-crimson text-wuxia-crimson hover:bg-wuxia-crimson hover:text-wuxia-paper"
                      asChild
                    >
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        View Code
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scroll decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-bl from-wuxia-crimson to-transparent rounded-bl-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;

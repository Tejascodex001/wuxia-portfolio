import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Github, Linkedin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link
    const mailtoLink = `mailto:tejas@example.com?subject=Message from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(formData.message)}%0A%0AFrom: ${encodeURIComponent(formData.email)}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: 'Scroll Delivered',
      description: 'Your messenger pigeon has taken flight!',
    });

    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-calligraphy text-center text-wuxia-crimson mb-4">
          Join My Sect
        </h2>
        <div className="h-1 w-32 mx-auto bg-wuxia-gold mb-8" />
        
        <p className="text-center text-muted-foreground mb-16 text-lg">
          Send a message via messenger pigeon
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="opacity-0 fade-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Your Name
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-wuxia-gold/40 focus:border-wuxia-crimson rounded-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Your Email
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-wuxia-gold/40 focus:border-wuxia-crimson rounded-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Message
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="border-wuxia-gold/40 focus:border-wuxia-crimson rounded-none min-h-[150px]"
                  placeholder="Write your message here..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-wuxia-crimson hover:bg-wuxia-crimson/90 text-wuxia-paper rounded-none py-6 font-semibold border-2 border-wuxia-ink"
              >
                Deliver Scroll
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="opacity-0 fade-up space-y-8" style={{ animationDelay: '200ms' }}>
            <div className="bg-card p-8 rounded-lg border-2 border-wuxia-gold/30">
              <h3 className="text-2xl font-calligraphy text-wuxia-crimson mb-6">
                Find Me In The Jianghu
              </h3>

              <div className="space-y-4">
                <a
                  href="mailto:tejas@example.com"
                  className="flex items-center space-x-3 text-foreground hover:text-wuxia-crimson transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-wuxia-gold/20 flex items-center justify-center group-hover:bg-wuxia-crimson/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>tejas@example.com</span>
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-foreground hover:text-wuxia-crimson transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-wuxia-gold/20 flex items-center justify-center group-hover:bg-wuxia-crimson/20 transition-colors">
                    <Github className="w-5 h-5" />
                  </div>
                  <span>github.com/tejas</span>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-foreground hover:text-wuxia-crimson transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-wuxia-gold/20 flex items-center justify-center group-hover:bg-wuxia-crimson/20 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <span>linkedin.com/in/tejas</span>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-wuxia-crimson/10 to-wuxia-gold/10 p-6 rounded-lg border-2 border-wuxia-gold/30">
              <p className="text-sm text-foreground italic leading-relaxed">
                "In the Jianghu of code, every connection strengthens the sect. 
                Whether you seek collaboration, wisdom, or simply wish to exchange martial techniques, 
                my door is always open to fellow practitioners."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

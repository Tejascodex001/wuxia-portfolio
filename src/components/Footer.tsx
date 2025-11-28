const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-wuxia-ink text-wuxia-paper">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h3 className="text-3xl font-calligraphy text-wuxia-gold mb-4">
            Tejas
          </h3>
          <div className="h-0.5 w-24 mx-auto bg-wuxia-crimson mb-6" />
          
          <p className="text-sm opacity-80 mb-6 max-w-md mx-auto">
            A wanderer in the digital Jianghu, forever seeking to master the arts of code and algorithm.
          </p>

          <div className="flex justify-center space-x-6 mb-8">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-wuxia-gold transition-colors"
            >
              GitHub
            </a>
            <span className="opacity-50">·</span>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-wuxia-gold transition-colors"
            >
              LinkedIn
            </a>
            <span className="opacity-50">·</span>
            <a
              href="mailto:tejas@example.com"
              className="hover:text-wuxia-gold transition-colors"
            >
              Email
            </a>
          </div>

          <div className="text-xs opacity-60">
            © {new Date().getFullYear()} Tejas. All techniques mastered with honor.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

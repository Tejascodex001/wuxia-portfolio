export const profile = {
  name: 'Tejas Gowda S',
  short: 'Tejas',
  title: 'Junior AI Engineer',
  employer: { name: 'Kenpath', url: 'https://kenpath.io' },
  lab: { name: 'RTensorLabs', url: 'https://github.com/RTensorLabs' },
  tagline: 'Wanderer of Code',
  email: 'tejas12gowda@gmail.com',
  github: 'https://github.com/Tejascodex001',
  linkedin: 'https://linkedin.com/in/tejas-gowda-sridhara',
  x: 'https://twitter.com/tejas_gowda_001',
  site: 'https://github.com/Tejascodex001/wuxia-portfolio',
};

export const roles = [
  'Junior AI Engineer',
  'Rust & C++ Practitioner',
  'Language-Model Tinkerer',
  'Maintainer of RTensorLabs',
];

export const intro = [
  'I build across full-stack development and AI at Kenpath, and in the quiet hours I run RTensorLabs: an independent lab where the problem decides what we build next.',
  'My path runs from C and Python, through machine learning and CUDA, to writing a Transformer by hand in Rust, and shipping an end-to-end encrypted messenger in Flutter.',
];

export const stats = [
  { value: 9.5, decimals: 1, label: 'CGPA · B.E. AI & Data Science' },
  { value: 7, decimals: 0, label: 'Projects shipped' },
  { value: 4, decimals: 0, label: 'Languages wielded' },
  { value: 2026, decimals: 0, label: 'Joined Kenpath', plain: true },
];

export type Featured = {
  id: string;
  name: string;
  kicker: string;
  blurb: string;
  stack: string[];
  hue: number;
  links: { label: string; href: string }[];
  glyph: string;
};

export const featured: Featured[] = [
  {
    id: 'flame',
    name: 'FLAME',
    kicker: 'Language models from first principles',
    blurb:
      'A framework for building and training language models in Rust with Candle. Hand-written Transformer, tokenizer and optimizer, plus a learning site and interactive visualizer that explain every piece behind the model.',
    stack: ['Rust', 'Candle', 'Transformers', 'Hugging Face'],
    hue: 18,
    glyph: '焰',
    links: [
      { label: 'Explore FLAME', href: 'https://learn-rust-flame-site.vercel.app/' },
      { label: 'Try the visualizer', href: 'https://huggingface.co/spaces/Tejascodex001/flame-visualizer' },
    ],
  },
  {
    id: 'sanctum',
    name: 'Sanctum',
    kicker: 'A private space for your close circle',
    blurb:
      'An Android messenger built with Rust and Flutter. Chats, calls, photos and plans travel between phones with end-to-end encryption and Tor by default. Personal sigils, QR verification and safety numbers help friends check identities.',
    stack: ['Rust', 'Flutter', 'Dart', 'E2E Encryption', 'Tor'],
    hue: 262,
    glyph: '盾',
    links: [
      { label: 'Website', href: 'https://sanctum-rtensorlabs.vercel.app/' },
      { label: 'Source', href: 'https://github.com/RTensorLabs/sanctum' },
      { label: 'Android beta', href: 'https://github.com/RTensorLabs/sanctum/releases/latest' },
    ],
  },
];

export const otherWork = [
  {
    name: 'GuardLayer',
    blurb: 'Python middleware for screening LLM inputs and outputs: prompt injection, jailbreaks, toxicity and personal information.',
    tags: ['Python', 'LLM Safety'],
    href: 'https://github.com/Tejascodex001/GuardLayer',
  },
  {
    name: 'SmartGuard',
    blurb: 'An LLM firewall that uses a DeBERTa classifier to detect prompt injection.',
    tags: ['DeBERTa', 'NLP'],
    href: 'https://github.com/Tejascodex001/smartguard',
  },
  {
    name: 'Vision Engine',
    blurb: 'A real-time C++ image and video pipeline with hand-written convolutions.',
    tags: ['C++', 'OpenCV'],
    href: 'https://github.com/Tejascodex001/Cpp-image-and-video-processing-pipeline',
  },
  {
    name: 'Anomaly Detector',
    blurb: 'A multithreaded Linux telemetry collector that flags anomalies with rolling z-scores.',
    tags: ['C++', 'Linux'],
    href: 'https://github.com/Tejascodex001/System-anomaly-detector',
  },
  {
    name: 'Auto-Immunity',
    blurb: 'A cyber-defense simulation combining reinforcement learning with a RAG-backed language model.',
    tags: ['RL', 'RAG', 'Python'],
    href: 'https://github.com/Tejascodex001/Auto-immunity-for-systems',
  },
];

export type Skill = { name: string; note: string };
export type School = { id: string; name: string; zh: string; skills: Skill[] };

export const schools: School[] = [
  {
    id: 'languages',
    name: 'Languages',
    zh: '言',
    skills: [
      { name: 'Rust', note: 'FLAME, Sanctum core' },
      { name: 'C++', note: 'Vision Engine, Anomaly Detector' },
      { name: 'Python', note: 'ML, RAG, LLM tooling' },
      { name: 'Dart', note: 'Flutter apps' },
    ],
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    zh: '智',
    skills: [
      { name: 'PyTorch', note: 'Training and research' },
      { name: 'Candle', note: 'Rust-native inference and training' },
      { name: 'CUDA', note: 'GPU compute' },
      { name: 'TensorFlow', note: 'Deep learning' },
      { name: 'scikit-learn', note: 'Classical ML' },
      { name: 'OpenCV', note: 'Computer vision' },
    ],
  },
  {
    id: 'dev',
    name: 'Development',
    zh: '器',
    skills: [
      { name: 'Flutter', note: 'Cross-platform mobile' },
      { name: 'Docker', note: 'Shipping and isolation' },
      { name: 'Linux (Arch)', note: 'Daily driver' },
      { name: 'Git', note: 'Version control' },
    ],
  },
];

export type Chapter = {
  period: string;
  title: string;
  place: string;
  kind: 'work' | 'edu';
  points: string[];
  current?: boolean;
};

export const journey: Chapter[] = [
  {
    period: 'Sep 2026 – Present',
    title: 'Junior AI Engineer',
    place: 'Kenpath',
    kind: 'work',
    current: true,
    points: ['Full-stack development and AI engineering.', 'Shipping product features where applied AI meets real users.'],
  },
  {
    period: '2026',
    title: 'B.E. in AI & Data Science',
    place: 'Global Academy of Technology',
    kind: 'edu',
    points: ['Graduated with a CGPA of 9.5.'],
  },
  {
    period: '2025',
    title: 'Software Engineer Intern',
    place: 'CGI',
    kind: 'work',
    points: [
      'Built an OCR pipeline with PaddleOCR to extract structured information from images with high accuracy.',
      'Fed the extracted documents into a RAG system for question answering.',
      'Automated preprocessing and text-to-answer mapping workflows.',
    ],
  },
];

export const sections = [
  { id: 'top', label: 'Gate' },
  { id: 'about', label: 'Path' },
  { id: 'skills', label: 'Techniques' },
  { id: 'projects', label: 'Scrolls' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Sect' },
];

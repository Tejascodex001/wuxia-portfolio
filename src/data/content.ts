export const profile = {
  name: 'Tejas Gowda S',
  short: 'Tejas',
  title: 'Junior AI Engineer',
  employer: { name: 'Kenpath', url: 'https://kenpath.io' },
  lab: { name: 'RTensorLabs', url: 'https://github.com/RTensorLabs' },
  tagline: 'Wanderer of Code',
  headline: 'I build language models from scratch.',
  email: 'tejas12gowda@gmail.com',
  github: 'https://github.com/Tejascodex001',
  linkedin: 'https://linkedin.com/in/tejas-gowda-sridhara',
  x: 'https://twitter.com/tejas_gowda_001',
  repo: 'https://github.com/Tejascodex001/wuxia-portfolio',
};

export const intro = [
  'I am a Junior AI Engineer at Kenpath, working across full-stack development and applied AI. Outside work I maintain RTensorLabs, an independent lab where the problem decides what we build next.',
  'My path runs from C and Python, through machine learning and CUDA, to writing a Transformer by hand in Rust, shipping an end-to-end encrypted messenger in Flutter, and a native Android music player in Kotlin.',
];

export const stats = [
  { value: 9.5, decimals: 1, label: 'CGPA, B.E. AI & Data Science' },
  { value: 3, decimals: 0, label: 'Flagship projects: FLAME, Sanctum, Hum' },
  { value: 5, decimals: 0, label: 'Languages used daily' },
];

export type Featured = {
  id: 'flame' | 'sanctum' | 'hum';
  name: string;
  kicker: string;
  blurb: string;
  stack: string[];
  links: { label: string; href: string }[];
};

export const featured: Featured[] = [
  {
    id: 'flame',
    name: 'FLAME',
    kicker: 'Language models from first principles',
    blurb:
      'A framework for building and training language models in Rust with Candle. Hand-written Transformer, tokenizer and optimizer, plus a learning site and interactive visualizer that explain every piece behind the model.',
    stack: ['Rust', 'Candle', 'Transformers', 'Hugging Face'],
    links: [
      { label: 'Explore FLAME', href: 'https://learn-rust-flame-site.vercel.app/' },
      { label: 'Try the visualizer', href: 'https://huggingface.co/spaces/Tejascodex001/flame-visualizer' },
    ],
  },
  {
    id: 'sanctum',
    name: 'SANCTUM',
    kicker: 'A private space for your close circle',
    blurb:
      'An Android messenger built with Rust and Flutter. Chats, calls, photos and plans travel between phones with end-to-end encryption and Tor by default. Personal sigils, QR verification and safety numbers help friends check identities.',
    stack: ['Rust', 'Flutter', 'Dart', 'E2E encryption', 'Tor'],
    links: [
      { label: 'Website', href: 'https://sanctum-rtensorlabs.vercel.app/' },
      { label: 'Source', href: 'https://github.com/RTensorLabs/sanctum' },
      { label: 'Android beta', href: 'https://github.com/RTensorLabs/sanctum/releases/latest' },
    ],
  },
  {
    id: 'hum',
    name: 'HUM',
    kicker: 'Find what you enjoy, then play the best matching recording',
    blurb:
      'A native Android music player from RTensorLabs. It discovers music through YouTube Music or Spotify, finds the best matching recording among your files and connected sources, and renders supported surround audio to stereo with its own Downmix Renderer. Lyrics follow the song in original or English letters, with playlist import and Android Auto.',
    stack: ['Kotlin', 'Android', 'Downmix Renderer', 'YouTube Music · Spotify'],
    links: [
      { label: 'Source', href: 'https://github.com/RTensorLabs/Hum' },
      { label: 'Download beta', href: 'https://github.com/RTensorLabs/music-app/releases' },
    ],
  },
];

/** Smaller projects, listed in Read Mode only. */
export const workshop = [
  { name: 'Delivery Route App', note: 'Python route and delivery app with Mapbox maps and live traffic.', href: 'https://github.com/Tejascodex001/delivery-route-app' },
  { name: 'Music FFAC', note: 'A terminal music player in C++ on miniaudio, built to learn threads and atomics. Complete.', href: 'https://github.com/Tejascodex001/music-ffac' },
  { name: 'Lintless', note: 'Rust, from RTensorLabs.', href: 'https://github.com/RTensorLabs/lintless' },
  { name: 'Audiobook Studio', note: 'Python.', href: 'https://github.com/Tejascodex001/audiobook-studio' },
  { name: 'RecyclePro', note: 'JavaScript.', href: 'https://github.com/Tejascodex001/recylepro' },
  { name: 'Sign Language, Face Attendance, FaceNet', note: 'Earlier computer-vision projects in Python.', href: 'https://github.com/Tejascodex001/sign-language' },
];

/** Flagship projects: each is a boss in the film. */
export const flagshipNote = 'The three flagship projects of RTensorLabs, my independent lab.';

export const otherWork = [
  {
    name: 'GuardLayer',
    blurb: 'Python middleware for screening LLM inputs and outputs: prompt injection, jailbreaks, toxicity and personal information.',
    tags: ['Python', 'LLM safety'],
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

export type ToolGroup = { id: string; name: string; items: { name: string; note: string }[] };

export const toolbox: ToolGroup[] = [
  {
    id: 'languages',
    name: 'Languages',
    items: [
      { name: 'Rust', note: 'FLAME, Sanctum core' },
      { name: 'Kotlin', note: 'Hum, native Android' },
      { name: 'C++', note: 'Vision Engine, Anomaly Detector' },
      { name: 'Python', note: 'ML, RAG, LLM tooling' },
      { name: 'Dart', note: 'Flutter apps' },
    ],
  },
  {
    id: 'ml',
    name: 'Machine learning',
    items: [
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
    items: [
      { name: 'Flutter', note: 'Cross-platform mobile' },
      { name: 'Docker', note: 'Shipping and isolation' },
      { name: 'Linux (Arch)', note: 'Daily driver' },
      { name: 'Git', note: 'Version control' },
    ],
  },
];

export const background = [
  {
    id: 'now',
    label: 'Now',
    title: 'Junior AI Engineer',
    place: 'Kenpath',
    when: 'Sep 2026 to present',
    note: 'Full-stack development and AI engineering.',
  },
  {
    id: 'before',
    label: 'Before',
    title: 'Software Engineer Intern',
    place: 'CGI',
    when: '2025',
    note: 'Built an OCR pipeline with PaddleOCR and fed the extracted documents into a RAG system for question answering.',
  },
  {
    id: 'studied',
    label: 'Studied',
    title: 'B.E. in AI & Data Science',
    place: 'Global Academy of Technology',
    when: 'Graduated 2026',
    note: 'CGPA of 9.5.',
  },
];

export const sections = [
  { id: 'top', label: 'Gate' },
  { id: 'work', label: 'Scrolls' },
  { id: 'stack', label: 'Techniques' },
  { id: 'about', label: 'Path' },
  { id: 'contact', label: 'Sect' },
];

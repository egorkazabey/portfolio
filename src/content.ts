// All site copy lives here. Edit this file to make the portfolio yours.

export const profile = {
  firstName: 'Egor',
  lastName: 'Kazabey',
  role: 'Creative Developer',
  location: 'Remote · Worldwide',
  timezone: 'Europe/Moscow',
  email: 'hello@example.com',
  intro:
    'I build fast, tactile interfaces where motion carries meaning — from WebGL experiments to product design systems that ship.',
  about:
    'I sit between design and engineering. For the last years I have been turning ambitious ideas into websites and products that feel alive: smooth, precise, and impossible to scroll past. I care about the details nobody asks for — easing curves, frame budgets, typographic rhythm — because that is where good work becomes memorable.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/egorkazabey' },
    { label: 'Telegram', href: 'https://t.me/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Dribbble', href: 'https://dribbble.com/' },
  ],
}

export const skills = [
  'TypeScript',
  'React',
  'WebGL',
  'GSAP',
  'Three.js',
  'Node.js',
  'Motion Design',
  'Design Systems',
  'GLSL',
  'Next.js',
]

export type Project = {
  title: string
  kind: string
  year: string
  description: string
  stack: string[]
  href: string
  hue: number
}

export const projects: Project[] = [
  {
    title: 'Aurora',
    kind: 'WebGL Experience',
    year: '2026',
    description: 'Real-time shader landscape for a music label launch, 60fps on mid-range phones.',
    stack: ['GLSL', 'Three.js', 'GSAP'],
    href: '#',
    hue: 14,
  },
  {
    title: 'Monolith',
    kind: 'Product Design System',
    year: '2025',
    description: 'Token-driven component library powering four products and 120k daily users.',
    stack: ['React', 'TypeScript', 'Storybook'],
    href: '#',
    hue: 260,
  },
  {
    title: 'Pulse',
    kind: 'Fintech Dashboard',
    year: '2025',
    description: 'Streaming analytics UI with sub-100ms updates and motion-led data storytelling.',
    stack: ['Next.js', 'D3', 'WebSockets'],
    href: '#',
    hue: 160,
  },
  {
    title: 'Kinetik',
    kind: 'Brand Website',
    year: '2024',
    description: 'Scroll-choreographed site for a sports brand. Awwwards Site of the Day.',
    stack: ['Astro', 'GSAP', 'Lenis'],
    href: '#',
    hue: 45,
  },
]

export const services = [
  { title: 'Creative Development', text: 'Immersive websites, scroll storytelling, WebGL and interaction design.' },
  { title: 'Frontend Engineering', text: 'Scalable React and TypeScript apps with performance budgets that hold.' },
  { title: 'Design Systems', text: 'Tokens, components and documentation teams actually adopt.' },
  { title: 'Motion & Prototyping', text: 'Interaction prototypes that sell the idea before a line of production code.' },
]

export const stats = [
  { value: 6, suffix: '+', label: 'Years shipping' },
  { value: 40, suffix: '+', label: 'Projects launched' },
  { value: 12, suffix: '', label: 'Industry awards' },
]

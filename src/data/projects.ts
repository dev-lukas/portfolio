export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  tech: TechBadge[];
  links: { label: string; url: string; icon: string }[];
  theme: 'fire' | 'terminal' | 'corporate';
}

export interface TechBadge {
  name: string;
  color: string;
}

export const projects: Project[] = [
  {
    id: 'firephenix',
    title: 'FirePhenix',
    subtitle: 'Gaming Community Platform',
    description:
      'A full-stack gaming community platform serving ~1000 users across multiple services. Built from scratch with a Flask/Valkey backend, Vue 3 frontend, custom Discord and TeamSpeak bots, and automated CI/CD, all running on self-managed infrastructure.',
    features: [
      'Flask REST API with Valkey-backed caching, rate limiting & pub/sub messaging',
      'MariaDB with parameterized queries, batch upserts & cross-platform data aggregation',
      'Custom Discord & TeamSpeak bots with real-time voice tracking and event-driven architecture',
      'Vue 3 + TypeScript + Pinia SPA with Chart.js dashboards and activity heatmaps',
      'Steam OpenID authentication with cross-platform account linking via verification codes',
      'Docker Compose orchestration: MariaDB, Valkey, TeamSpeak, Flask API, Vite frontend',
      'GitHub Actions CI/CD building images, publishing them, and triggering the self-hosted runner to update the Docker Compose stack',
    ],
    tech: [
      { name: 'Flask', color: '#E8E8ED' },
      { name: 'Python', color: '#3776AB' },
      { name: 'Vue 3', color: '#42B883' },
      { name: 'TypeScript', color: '#3178C6' },
      { name: 'MariaDB', color: '#003545' },
      { name: 'Valkey/Redis', color: '#FF6B35' },
      { name: 'Docker', color: '#2496ED' },
      { name: 'GitHub Actions', color: '#2088FF' },
      { name: 'Nginx', color: '#009639' },
      { name: 'Discord API', color: '#5865F2' },
      { name: 'TeamSpeak 3', color: '#4A90D9' },
      { name: 'Steam OpenID', color: '#1B2838' },
    ],
    links: [
      { label: 'Backend', url: 'https://github.com/dev-lukas/firephenix-backend', icon: 'github' },
      { label: 'Frontend', url: 'https://github.com/dev-lukas/firephenix-website', icon: 'github' },
    ],
    theme: 'fire',
  },
  {
    id: 'homeserver',
    title: 'Homeserver Ansible',
    subtitle: 'Infrastructure as Code',
    description:
      'Ansible-based automation for managing my Proxmox homeserver. Handles SSH key deployment, power optimization with Powertop and Intel LTR, Docker service installation, and security hardening,all through a modular, role-based architecture.',
    features: [
      'Automated SSH key deployment across all hosts',
      'Powertop auto-tuning & Intel LTR for deep C-states',
      'Security hardening with firewall rules & unattended upgrades',
      'Container registry for all personal projects',
      'GitHub Actions self-hosted runner for CI/CD',
      'Modular role-based Ansible architecture',
    ],
    tech: [
      { name: 'Ansible', color: '#EE0000' },
      { name: 'Proxmox', color: '#E57000' },
      { name: 'Jinja2', color: '#B41717' },
      { name: 'Shell', color: '#4EAA25' },
      { name: 'SSH', color: '#E8E8ED' },
    ],
    links: [
      { label: 'Repository', url: 'https://github.com/dev-lukas/homeserver-ansible', icon: 'github' },
    ],
    theme: 'terminal',
  },
];

export const stratoExperience = {
  title: 'DevOps Engineer',
  company: 'Strato GmbH',
  type: 'Working Student',
  description:
    'Building automated infrastructure for secure OS images, hardened containers, and platform migrations at one of Germany\'s largest hosting providers.',
  highlights: [
    {
      title: 'Automated OS Image Builds',
      detail: 'Built pipelines for automatically building safe, production-ready Linux images delivered to end customers.',
      icon: 'image',
    },
    {
      title: 'Hardened Container Security',
      detail: 'Created CI/CD pipelines for secure container builds,triaging and fixing CVEs, attesting VEX files for supply chain transparency.',
      icon: 'shield',
    },
    {
      title: 'Virtuozzo → KVM Migration',
      detail: 'Developed a converter to migrate legacy customer VMs from Virtuozzo to KVM, enabling platform modernization at scale.',
      icon: 'convert',
    },
  ],
  stations: [
    { name: 'OS Images', detail: 'Automated building of secure Linux images for customers' },
    { name: 'Container Security', detail: 'Hardened container builds with CVE fixes & VEX attestation' },
    { name: 'VM Migration', detail: 'Virtuozzo to KVM conversion tooling' },
    { name: 'CI/CD', detail: 'Build and delivery pipelines with GitLab CI' },
    { name: 'Automation', detail: 'Scripting and automating operational workflows' },
  ],
};

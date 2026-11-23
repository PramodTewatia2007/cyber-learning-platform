import { TrackConfig, CourseSource } from '@/types';

export const TRACKS: TrackConfig[] = [
  {
    id: 'track-1-fundamentals',
    title: 'Cybersecurity Fundamentals',
    subtitle: 'Core principles, networking architectures, threat modeling & security hygiene',
    accent: '#10B981', // Emerald
    accentBg: 'rgba(16, 185, 129, 0.1)',
    borderAccent: 'rgba(16, 185, 129, 0.3)',
    icon: 'Shield',
    courses: [
      {
        slug: 'cybersecurity-fundamentals',
        title: 'Cybersecurity Basics – Foundation Notes',
        trackId: 'track-1-fundamentals',
        folderId: '1Drf74G5L-CPzvikrW54Cuq6SawAcynva',
        sourceType: 'drive_folder',
        description: 'Comprehensive foundation covering OSI models, TCP/IP handshakes, symmetric & asymmetric cryptography, attack vectors, and defensive controls.',
        accentColor: '#10B981',
        recommendedStep: 1,
        tags: ['Networking', 'OSI Model', 'Cryptography', 'Basics', 'Security Concepts'],
      },
    ],
  },
  {
    id: 'track-2-red-team',
    title: 'Red Team & Ethical Hacking',
    subtitle: 'Offensive operations, vulnerability exploitation, payload crafting & interactive roadmap',
    accent: '#EF4444', // Crimson
    accentBg: 'rgba(239, 68, 68, 0.1)',
    borderAccent: 'rgba(239, 68, 68, 0.3)',
    icon: 'Terminal',
    courses: [
      {
        slug: 'learn-ethical-hacking',
        title: 'Learn Ethical Hacking from Scratch',
        trackId: 'track-2-red-team',
        folderId: '1if6MCeBCj8sxWwJIKhtgwU0GBuBW8uLx',
        sourceType: 'drive_folder',
        description: 'Zero-to-hero offensive curriculum: port scanning, wireless packet injection, web application exploitation, and privilege escalation.',
        accentColor: '#EF4444',
        recommendedStep: 2,
        tags: ['Recon', 'Exploitation', 'Metasploit', 'Web Hacking', 'Privilege Escalation'],
      },
      {
        slug: 'red-team-roadmap',
        title: 'Red Team Roadmap (Interactive Guide)',
        trackId: 'track-2-red-team',
        sourceType: 'github_markdown',
        githubRawUrl: 'https://raw.githubusercontent.com/soheilsec/Red-Team-Roadmap/main/English.md',
        description: 'Live interactive roadmap tracking every offensive security milestone with native progress persistence and categorized checklists.',
        accentColor: '#EF4444',
        recommendedStep: 3,
        tags: ['Interactive Roadmap', 'C2 Frameworks', 'Active Directory', 'Evasion', 'OPSEC'],
      },
      {
        slug: 'red-team-resources',
        title: 'Red Team Resources',
        trackId: 'track-2-red-team',
        folderId: '1uFt09G20WAskczk4Mk1U0OqW8N2COsZ5',
        sourceType: 'drive_folder',
        description: 'Curated toolkits, adversary emulation cheat sheets, payload delivery techniques, and red team playbooks.',
        accentColor: '#EF4444',
        recommendedStep: 5,
        tags: ['Red Team', 'C2', 'Cheat Sheets', 'Toolkits', 'Adversary Emulation'],
      },
    ],
  },
  {
    id: 'track-3-ceh',
    title: 'EC-Council CEH Complete Suite',
    subtitle: 'Certified Ethical Hacker v12 full study bundle: lectures, theory notes, and hands-on labs',
    accent: '#F59E0B', // Amber
    accentBg: 'rgba(245, 158, 11, 0.1)',
    borderAccent: 'rgba(245, 158, 11, 0.3)',
    icon: 'Award',
    courses: [
      {
        slug: 'ceh-study-materials',
        title: 'CEH Study Materials',
        trackId: 'track-3-ceh',
        folderId: '1Vgdtm5l9PEnHUU-g8caa3PjaZEMJltQ5',
        sourceType: 'drive_folder',
        description: 'Official candidate study guides, module breakdown books, exam objectives, and theoretical deep dives.',
        accentColor: '#F59E0B',
        recommendedStep: 4,
        tags: ['CEH v12', 'Study Guide', 'Official Modules', 'Exam Objectives'],
      },
      {
        slug: 'ceh-video-lectures',
        title: 'CEH Video Lectures',
        trackId: 'track-3-ceh',
        folderId: '1YdnlgS_1QRhXidJQHd2V3SpuO7G0Ywv7',
        sourceType: 'drive_folder',
        description: 'High-definition instructor video modules covering scanning networks, enumeration, system hacking, malware threats, and sniffers.',
        accentColor: '#F59E0B',
        tags: ['Video Course', 'Instructor Led', 'Scanning', 'Enumeration', 'Sniffing'],
      },
      {
        slug: 'ceh-notes',
        title: 'CEH Notes',
        trackId: 'track-3-ceh',
        folderId: '1bkMeKQ8PfYKrKmnl-evVj3h36caS9BIY',
        sourceType: 'drive_folder',
        description: 'Quick-reference revision summaries, command cheat sheets, port numbers, cryptography formulas, and attack blueprints.',
        accentColor: '#F59E0B',
        tags: ['Revision Notes', 'Port Lists', 'Commands', 'Summary'],
      },
      {
        slug: 'ceh-labs',
        title: 'CEH Labs',
        trackId: 'track-3-ceh',
        folderId: '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS',
        sourceType: 'drive_folder',
        description: 'Target virtual machines, lab manuals, vulnerability assessment scenarios, and live attack-defense walk-throughs.',
        accentColor: '#F59E0B',
        tags: ['Virtual Labs', 'Hands-on', 'Vulnerability Assessment', 'VMs'],
      },
      {
        slug: 'ceh-practical-resources',
        title: 'CEH Practical Resources',
        trackId: 'track-3-ceh',
        folderId: '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS',
        sourceType: 'drive_folder',
        description: 'Hands-on practical exam preparation scripts, challenge walkthroughs, and tool automation assets.',
        accentColor: '#F59E0B',
        tags: ['Practical Exam', 'Challenge Labs', 'Tool Configs', 'Scripts'],
      },
    ],
  },
  {
    id: 'track-4-offsec',
    title: 'Offensive Security (OffSec)',
    subtitle: 'Penetration testing with Kali Linux, OSCP-level exploitation, buffer overflows & privilege escalation',
    accent: '#EF4444', // Crimson
    accentBg: 'rgba(239, 68, 68, 0.1)',
    borderAccent: 'rgba(239, 68, 68, 0.3)',
    icon: 'Crosshair',
    courses: [
      {
        slug: 'offsec-resources',
        title: 'OffSec Resources',
        trackId: 'track-4-offsec',
        folderId: '1ySTW2ZEuPPTqKD_-SPY9VHxb2wQeUb2D',
        sourceType: 'drive_folder',
        description: 'Elite offensive methodology guides: manual exploitation, memory corruptions, tunnel pivoting, and active directory exploitation.',
        accentColor: '#EF4444',
        recommendedStep: 6,
        tags: ['OSCP', 'OffSec', 'Buffer Overflow', 'Pivoting', 'Active Directory'],
      },
    ],
  },
  {
    id: 'track-5-blue-team',
    title: 'Blue Team Resources',
    subtitle: 'Defensive engineering, digital forensics, incident response runbooks & malware analysis',
    accent: '#06B6D4', // Cyan
    accentBg: 'rgba(6, 182, 212, 0.1)',
    borderAccent: 'rgba(6, 182, 212, 0.3)',
    icon: 'Lock',
    courses: [
      {
        slug: 'blue-team-kit',
        title: 'Blue Team Kit – Books',
        trackId: 'track-5-blue-team',
        folderId: '1v4dQsqYe6ekjgaoImDuU0CcEJKymx1Vs',
        sourceType: 'drive_folder',
        description: 'Authoritative defensive engineering literature: Incident Response field guides, Windows internals, network traffic analysis, and hardening benchmarks.',
        accentColor: '#06B6D4',
        recommendedStep: 7,
        tags: ['Digital Forensics', 'Incident Response', 'Hardening', 'Memory Analysis', 'PCAP'],
      },
    ],
  },
  {
    id: 'track-6-soc',
    title: 'SOC (Security Operations Center)',
    subtitle: 'SIEM management, EDR investigation, threat hunting, alert triage & log engineering',
    accent: '#06B6D4', // Cyan
    accentBg: 'rgba(6, 182, 212, 0.1)',
    borderAccent: 'rgba(6, 182, 212, 0.3)',
    icon: 'Radio',
    courses: [
      {
        slug: 'soc-resources',
        title: 'SOC Resources',
        trackId: 'track-6-soc',
        folderId: '1bz7uOtUy7cO87tBNewnFzDy1nRgwO7Gl',
        sourceType: 'drive_folder',
        description: 'SOC Analyst Tier 1-3 manuals: Splunk/ELK detection rules, Sigma queries, YARA signatures, MITRE ATT&CK mapping, and playbook automation.',
        accentColor: '#06B6D4',
        recommendedStep: 7,
        tags: ['SIEM', 'SOC Analyst', 'Splunk', 'YARA', 'Sigma Rules', 'Threat Hunting'],
      },
    ],
  },
];

export const ALL_COURSES: CourseSource[] = TRACKS.flatMap((t) => t.courses);

export function getCourseBySlug(slug: string): CourseSource | undefined {
  return ALL_COURSES.find((c) => c.slug === slug);
}

export function getTrackByCourseSlug(slug: string): TrackConfig | undefined {
  return TRACKS.find((t) => t.courses.some((c) => c.slug === slug));
}

export function getRecommendedPath(): CourseSource[] {
  return [
    getCourseBySlug('cybersecurity-fundamentals')!,
    getCourseBySlug('learn-ethical-hacking')!,
    getCourseBySlug('red-team-roadmap')!,
    getCourseBySlug('ceh-study-materials')!,
    getCourseBySlug('red-team-resources')!,
    getCourseBySlug('offsec-resources')!,
    getCourseBySlug('blue-team-kit')!,
  ].filter(Boolean);
}

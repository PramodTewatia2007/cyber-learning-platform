'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Terminal,
  Flame,
  Award,
  Crosshair,
  Lock,
  Radio,
  ArrowRight,
  Clock
} from 'lucide-react';

interface LearningPathStep {
  step: number;
  title: string;
  category: string;
  description: string;
  slug: string;
  url: string;
  accent: string;
  duration: string;
  tag: string;
}

const PATH_STEPS: LearningPathStep[] = [
  {
    step: 1,
    title: 'Cybersecurity Fundamentals',
    category: 'Foundation Bedrock',
    description: 'OSI 7 layers, TCP/IP handshakes, symmetric & asymmetric cryptography, and network traffic mechanics.',
    slug: 'cybersecurity-fundamentals',
    url: '/course/cybersecurity-fundamentals',
    accent: '#10B981',
    duration: '2-3 Weeks',
    tag: 'Core Bedrock',
  },
  {
    step: 2,
    title: 'Learn Ethical Hacking from Scratch',
    category: 'Offensive Foundations',
    description: 'Hands-on port scanning, Metasploit exploitation, wireless sniffing, and web application attacks.',
    slug: 'ethical-hacking-scratch',
    url: '/course/ethical-hacking-scratch',
    accent: '#EF4444',
    duration: '3-4 Weeks',
    tag: 'Hands-On Recon',
  },
  {
    step: 3,
    title: 'Red Team Roadmap',
    category: 'Career & Operator Roadmap',
    description: 'Self-owned interactive roadmap tracking offensive milestones, C2 setup, and Active Directory dominance.',
    slug: 'red-team-roadmap',
    url: '/roadmap',
    accent: '#EF4444',
    duration: 'Interactive',
    tag: 'Operator Roadmap',
  },
  {
    step: 4,
    title: 'CEH Study Materials',
    category: 'Certification Suite',
    description: 'Official EC-Council CEH v12 courseware volumes, exam blueprints, and structured theoretical notes.',
    slug: 'ceh-study-materials',
    url: '/course/ceh-study-materials',
    accent: '#F59E0B',
    duration: '3-4 Weeks',
    tag: 'CEH v12 Official',
  },
  {
    step: 5,
    title: 'Red Team Practical Labs',
    category: 'Advanced Offense & Practice',
    description: 'Deduplicated single storage path for CEH hands-on labs, challenge virtual machines, and practical exam prep.',
    slug: 'ceh-labs-practical',
    url: '/course/ceh-labs-practical',
    accent: '#F59E0B',
    duration: '2-3 Weeks',
    tag: 'Virtual Labs',
  },
  {
    step: 6,
    title: 'OffSec Resources',
    category: 'Elite Penetration Testing',
    description: 'OSCP methodology: 32/64-bit stack buffer overflows, privilege escalation vectors, and tunnel pivoting.',
    slug: 'offsec-resources',
    url: '/course/offsec-resources',
    accent: '#EF4444',
    duration: '4-6 Weeks',
    tag: 'OSCP Aligned',
  },
  {
    step: 7,
    title: 'Blue Team & SOC Resources',
    category: 'Defensive Engineering & SIEM',
    description: 'Digital forensics with Volatility, incident response runbooks, SIEM log correlation, and Sigma rule authoring.',
    slug: 'blue-team-books',
    url: '/course/blue-team-books',
    accent: '#06B6D4',
    duration: '3-4 Weeks',
    tag: 'Threat Hunting',
  },
];

export function LearningPath() {
  return (
    <section id="learning-path" className="py-16 border-t border-[#1F2937]/80 bg-[#070B14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Recommended Curriculum Timeline</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              The 7-Step Operational Cybersecurity Journey
            </h2>
          </div>
          <p className="text-xs md:text-sm text-gray-400 max-w-md">
            Follow this progressive step-by-step path designed to transition you from core networking fundamentals all the way to advanced red team operations and enterprise SOC defense.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {PATH_STEPS.map((item) => (
            <Link
              key={item.step}
              href={item.url}
              className="bg-[#0E1524] rounded-2xl border border-[#1F2937] p-5 flex flex-col justify-between hover:border-gray-600 transition-all duration-200 group relative overflow-hidden shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  style={{ backgroundColor: `${item.accent}20`, color: item.accent, borderColor: `${item.accent}40` }}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center font-mono font-bold text-xs"
                >
                  0{item.step}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>{item.duration}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-gray-100 group-hover:text-white transition-colors mt-0.5">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-2 line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                <span
                  style={{ color: item.accent }}
                  className="text-[10px] font-mono font-semibold"
                >
                  {item.tag}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-white transition-colors">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

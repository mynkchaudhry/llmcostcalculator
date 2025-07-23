'use client';

import { Heart, Star, GitFork, Code, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const repoUrl = 'https://github.com/mynkchaudhry/llmcostcalculator';

  return (
    <footer className="border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-400" />
              LLM Price Calculator
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional tool for comparing and calculating AI model costs. 
              Built with Next.js, React, and modern web technologies.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>by the open source community</span>
            </div>
          </div>

          {/* GitHub Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Open Source</h3>
            <div className="space-y-3">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <Star className="h-4 w-4 group-hover:text-yellow-400 transition-colors" />
                <span className="text-sm">Star on GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              <a
                href={`${repoUrl}/fork`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <GitFork className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
                <span className="text-sm">Fork & Contribute</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              <a
                href={`${repoUrl}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <Code className="h-4 w-4 group-hover:text-green-400 transition-colors" />
                <span className="text-sm">Report Issues</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Built With</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 
                'Framer Motion', 'Zustand', 'MongoDB', 'NextAuth'
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 hover:bg-white/10 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © {currentYear} LLM Price Calculator. Licensed under MIT License.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a
              href={`${repoUrl}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              MIT License
            </a>
            <a
              href={`${repoUrl}/blob/main/README.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/mynkchaudhry"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              @mynkchaudhry
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
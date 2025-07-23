'use client';

import { useState, useEffect } from 'react';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface GitHubBannerProps {
  owner?: string;
  repo?: string;
  className?: string;
}

export default function GitHubBanner({ 
  owner = 'mynkchaudhry', 
  repo = 'llmcostcalculator',
  className = ''
}: GitHubBannerProps) {
  const [stars, setStars] = useState<number>(0);
  const [forks, setForks] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const repoUrl = `https://github.com/${owner}/${repo}`;

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count || 0);
          setForks(data.forks_count || 0);
        }
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [owner, repo]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
      >
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-semibold text-sm">
            {loading ? '...' : formatNumber(stars)}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-blue-400">
          <GitFork className="h-4 w-4" />
          <span className="font-semibold text-sm">
            {loading ? '...' : formatNumber(forks)}
          </span>
        </div>
        
        <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-white transition-colors" />
      </a>
    </motion.div>
  );
}
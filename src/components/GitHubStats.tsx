'use client';

import { useState, useEffect } from 'react';
import { Star, GitFork, Users, ExternalLink, Code, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './ui/Button';

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  contributors_url: string;
}

interface GitHubStatsProps {
  owner?: string;
  repo?: string;
  className?: string;
  showContributeButton?: boolean;
}

export default function GitHubStats({ 
  owner = 'mynkchaudhry', 
  repo = 'llmcostcalculator',
  className = '',
  showContributeButton = true
}: GitHubStatsProps) {
  const [repoData, setRepoData] = useState<GitHubRepo | null>(null);
  const [contributorsCount, setContributorsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const repoUrl = `https://github.com/${owner}/${repo}`;

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        // Fetch repository data
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (repoResponse.ok) {
          const data = await repoResponse.json();
          setRepoData(data);

          // Fetch contributors count
          const contributorsResponse = await fetch(data.contributors_url);
          if (contributorsResponse.ok) {
            const contributors = await contributorsResponse.json();
            setContributorsCount(Array.isArray(contributors) ? contributors.length : 0);
          }
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
    <div className={`${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-400" />
            Open Source Project
          </h3>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xl font-bold">{formatNumber(repoData?.stargazers_count || 0)}</span>
                </div>
                <p className="text-xs text-gray-400">Stars</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                  <GitFork className="h-4 w-4" />
                  <span className="text-xl font-bold">{formatNumber(repoData?.forks_count || 0)}</span>
                </div>
                <p className="text-xs text-gray-400">Forks</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xl font-bold">{contributorsCount}</span>
                </div>
                <p className="text-xs text-gray-400">Contributors</p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  Star on GitHub
                </Button>
              </a>

              {showContributeButton && (
                <a
                  href={`${repoUrl}/fork`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                  >
                    <GitFork className="h-4 w-4 mr-2" />
                    Fork & Contribute
                  </Button>
                </a>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                Built with <Heart className="h-3 w-3 inline text-red-400 fill-current" /> by the community
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                MIT License • Free & Open Source
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
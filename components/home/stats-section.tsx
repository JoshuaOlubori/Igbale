// components/common/stats-section.tsx
"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getGlobalStats, GlobalStats } from '@/server/actions/general-stats';
import { ClipLoader } from 'react-spinners'; // For loading indicator

export default function StatsSection() {
  const [statsData, setStatsData] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getGlobalStats();
        if ('error' in result) {
          setError(result.error);
          setStatsData(null);
        } else {
          setStatsData(result);
        }
      } catch (err) {
        console.error("Error fetching global stats:", err);
        setError("Failed to load statistics.");
        setStatsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means this runs once on mount

  const stats = [
    { value: statsData ? `${(statsData.activeUsers / 1000).toFixed(0)}K+` : "...", label: "Active Users" },
    { value: statsData ? `${(statsData.totalTrashCollectedKg / 1000).toFixed(0)}K+` : "...", label: "Trash Collected (kg)" },
    { value: statsData ? `${statsData.totalCommunities}+` : "...", label: "Communities" },
    { value: statsData ? `${(statsData.totalCleanupActivities / 1000).toFixed(0)}K+` : "...", label: "Cleanup Activities" }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <ClipLoader color="#36d7b7" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        <p>{error}</p>
        <p>Could not load global statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Making a Difference Together</h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          See the impact our community is making worldwide.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4 md:p-6 bg-gradient-to-br from-background to-muted/50"
          >
            <div className="text-2xl font-bold sm:text-3xl md:text-4xl text-green-600 dark:text-green-400">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-muted-foreground md:text-base">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client"

import { motion } from 'framer-motion';

export default function StatsSection() {
  const stats = [
    { value: "15K+", label: "Active Users" },
    { value: "120K+", label: "Trash Collected (kg)" },
    { value: "350+", label: "Communities" },
    { value: "28K+", label: "Cleanup Activities" }
  ];

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
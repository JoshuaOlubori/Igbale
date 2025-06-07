"use client";

import { motion } from "@/lib/framer-motion";
import { Scale, Trash2 } from "lucide-react";
import { calculatePoints } from "@/lib/points";

interface TrashAnalysisResultProps {
  result: {
    weight: number;
    type: string;
  };
}

export default function TrashAnalysisResult({
  result,
}: TrashAnalysisResultProps) {
  const pointsToEarn = calculatePoints(result.weight);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center"
      >
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
          <Trash2 className="h-8 w-8" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-1"
      >
        <h3 className="text-xl font-bold">Analysis Complete!</h3>
        <p className="text-muted-foreground">
          Our AI has analyzed your trash collection
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium">Estimated Weight</div>
            <div className="text-lg font-bold">{result.weight} kg</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Trash2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium">Trash Type</div>
            <div className="text-lg font-bold">{result.type}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30 text-center"
      >
        <div className="text-sm text-green-800 dark:text-green-300">
          You will earn
        </div>
        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
          +{pointsToEarn} points
        </div>
        <div className="text-xs text-green-700 dark:text-green-300 mt-1">
          when you collect this trash
        </div>
      </motion.div>
    </div>
  );
}

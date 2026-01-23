"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FinancialHealthGaugeProps {
  score: number; // 0 to 100
}

export function FinancialHealthGauge({ score }: FinancialHealthGaugeProps) {
  // Clamp score
  const clampedScore = Math.min(100, Math.max(0, score));
  
  // Calculate color based on score
  let color = "#ef4444"; // Red
  let status = "Crítico";
  if (clampedScore > 50) {
    color = "#f59e0b"; // Amber
    status = "Atenção";
  }
  if (clampedScore > 80) {
    color = "#10b981"; // Emerald
    status = "Saudável";
  }

  // Circle properties
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // We want a semi-circle (50% of circumference)
  const strokeDashoffset = circumference - (clampedScore / 100) * (circumference / 2);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <h3 className="text-lg font-bold mb-4 tracking-tight text-white/90">Saúde Financeira</h3>
      
      <div className="relative w-[200px] h-[100px] overflow-hidden">
         {/* Background Arc (Gray) */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="absolute left-1/2 -translate-x-1/2 rotate-[180deg]"
        >
          <circle
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference / 2} ${circumference}`}
          />
        </svg>

        {/* Foreground Arc (Colored) */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="absolute left-1/2 -translate-x-1/2 rotate-[180deg]"
        >
          <motion.circle
            stroke={color}
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference / 2} ${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        
         {/* Score Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-black text-white"
            >
                {clampedScore}
            </motion.div>
        </div>
      </div>
      
       <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-2 text-sm font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5"
            style={{ color: color }}
        >
            {status}
        </motion.div>
    </div>
  );
}

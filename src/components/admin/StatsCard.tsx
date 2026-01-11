import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  highlight?: boolean;
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  highlight,
  delay = 0 
}: StatsCardProps) {
  return (
    <motion.div 
      className={cn(
        "premium-card p-6 relative overflow-hidden",
        highlight && "border-primary/20"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-[13px] text-muted-foreground font-medium tracking-wide uppercase">
            {title}
          </p>
          <p className="text-[28px] font-semibold text-foreground tabular-nums tracking-tight">
            {value}
          </p>
          {change && (
            <div className={cn(
              "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-md",
              changeType === "positive" && "text-primary bg-primary/10",
              changeType === "negative" && "text-red-400 bg-red-400/10",
              changeType === "neutral" && "text-muted-foreground bg-muted"
            )}>
              {changeType === "positive" && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                </svg>
              )}
              {changeType === "negative" && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5M17 17l-5-5-5 5" />
                </svg>
              )}
              {change}
            </div>
          )}
        </div>
        <motion.div 
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            highlight 
              ? "bg-primary/10 text-primary" 
              : "bg-muted text-muted-foreground"
          )}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}

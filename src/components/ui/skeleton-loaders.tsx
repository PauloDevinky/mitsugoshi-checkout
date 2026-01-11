import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Base skeleton with shimmer effect
function SkeletonBase({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/50",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      style={style}
    />
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <motion.div 
      className="premium-card p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <SkeletonBase className="h-3 w-24" />
          <SkeletonBase className="h-8 w-32" />
          <SkeletonBase className="h-5 w-28 rounded-md" />
        </div>
        <SkeletonBase className="w-11 h-11 rounded-xl" />
      </div>
    </motion.div>
  );
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <motion.div 
      className="premium-card p-6 h-[360px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonBase className="h-4 w-40" />
          <SkeletonBase className="h-3 w-32" />
        </div>
        <div className="flex gap-4">
          <SkeletonBase className="h-3 w-16" />
          <SkeletonBase className="h-3 w-16" />
        </div>
      </div>
      <div className="h-[280px] flex items-end gap-2 pt-8">
        {[40, 65, 45, 80, 55, 70, 60, 75, 50, 85, 65, 70].map((h, i) => (
          <SkeletonBase 
            key={i} 
            className="flex-1 rounded-t-md" 
            style={{ height: `${h}%` }} 
          />
        ))}
      </div>
    </motion.div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <SkeletonBase className={cn(
            "h-4",
            i === 0 ? "w-32" : i === columns - 1 ? "w-20" : "w-24"
          )} />
        </td>
      ))}
    </motion.tr>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <motion.div 
      className="premium-card p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <SkeletonBase className="w-16 h-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
        <SkeletonBase className="h-8 w-20 rounded-md" />
      </div>
    </motion.div>
  );
}

// Funnel Skeleton
export function FunnelSkeleton() {
  return (
    <motion.div 
      className="premium-card p-6 h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8 space-y-2">
        <SkeletonBase className="h-4 w-36" />
        <SkeletonBase className="h-3 w-24" />
      </div>
      <div className="space-y-5">
        {[100, 75, 50, 25].map((w, i) => (
          <div key={i} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <SkeletonBase className="h-3 w-28" />
              <div className="flex gap-2">
                <SkeletonBase className="h-3 w-8" />
                <SkeletonBase className="h-4 w-10 rounded-md" />
              </div>
            </div>
            <SkeletonBase className="h-1.5 rounded-full" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Transaction List Skeleton
export function TransactionListSkeleton() {
  return (
    <motion.div 
      className="premium-card p-6 h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonBase className="h-4 w-40" />
          <SkeletonBase className="h-3 w-24" />
        </div>
        <SkeletonBase className="h-8 w-24 rounded-lg" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <SkeletonBase className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5">
                <SkeletonBase className="h-3 w-28" />
                <SkeletonBase className="h-2.5 w-20" />
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <SkeletonBase className="h-3 w-20 ml-auto" />
              <SkeletonBase className="h-5 w-16 rounded-full ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Top Products Skeleton
export function TopProductsSkeleton() {
  return (
    <motion.div 
      className="premium-card p-6 h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8 space-y-2">
        <SkeletonBase className="h-4 w-28" />
        <SkeletonBase className="h-3 w-24" />
      </div>
      <div className="space-y-5">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBase className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <SkeletonBase className="h-3 w-32" />
                <SkeletonBase className="h-3 w-20" />
              </div>
              <SkeletonBase className="h-1.5 rounded-full" style={{ width: `${90 - i * 15}%` }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

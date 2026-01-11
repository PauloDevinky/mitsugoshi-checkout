import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { FunnelSkeleton } from "@/components/ui/skeleton-loaders";
import { motion } from "framer-motion";

interface FunnelStep {
  label: string;
  value: number;
  percentage: number;
}

export function ConversionFunnel() {
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnelData = async () => {
      setLoading(true);
      
      const last7Days = subDays(new Date(), 7);
      
      // Fetch leads (visitors who started checkout)
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("id, step_abandoned, recovered")
        .gte("created_at", last7Days.toISOString());

      // Fetch transactions
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("id, status, payment_method")
        .gte("created_at", last7Days.toISOString());

      if (leadsError || txError) {
        console.error("Error fetching funnel data:", leadsError || txError);
        setLoading(false);
        return;
      }

      const allLeads = leads || [];
      const allTx = transactions || [];

      // Calculate funnel stages
      const totalLeads = allLeads.length + allTx.length; // All who started checkout
      const filledInfo = allLeads.filter(l => (l.step_abandoned || 0) >= 2).length + allTx.length;
      const pixGenerated = allTx.filter(t => t.payment_method === 'pix').length;
      const salesMade = allTx.filter(t => t.status === 'paid').length;

      // Create funnel with percentages based on initial step
      const baseValue = Math.max(totalLeads, 1);
      
      const funnel: FunnelStep[] = [
        { 
          label: "Iniciaram Checkout", 
          value: totalLeads, 
          percentage: 100 
        },
        { 
          label: "Preencheram Dados", 
          value: filledInfo, 
          percentage: Math.round((filledInfo / baseValue) * 100) 
        },
        { 
          label: "PIX Gerado", 
          value: pixGenerated, 
          percentage: Math.round((pixGenerated / baseValue) * 100) 
        },
        { 
          label: "Venda Realizada", 
          value: salesMade, 
          percentage: Math.round((salesMade / baseValue) * 100) 
        },
      ];

      setFunnelData(funnel);
      setLoading(false);
    };

    fetchFunnelData();
  }, []);

  if (loading) {
    return <FunnelSkeleton />;
  }

  const hasData = funnelData.some(d => d.value > 0);

  return (
    <motion.div 
      className="premium-card p-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="mb-8">
        <h3 className="text-base font-semibold text-foreground">Funil de Conversão</h3>
        <p className="text-[13px] text-muted-foreground mt-1">
          {hasData ? "Últimos 7 dias" : "Sem dados no período"}
        </p>
      </div>
      
      <div className="space-y-5">
        {funnelData.map((item, index) => {
          const isLast = index === funnelData.length - 1;
          return (
            <motion.div 
              key={item.label} 
              className="space-y-2.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-foreground tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                  <span className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-md tabular-nums",
                    isLast 
                      ? "bg-primary/15 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="progress-premium">
                <motion.div 
                  className={cn(
                    "progress-premium-fill",
                    isLast && "shadow-[0_0_12px_hsl(338,82%,42%,0.4)]"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + 0.1 * index, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

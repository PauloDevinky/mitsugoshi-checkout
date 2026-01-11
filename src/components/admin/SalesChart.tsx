import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format, parseISO, eachHourOfInterval, startOfHour } from "date-fns";
import { ChartSkeleton } from "@/components/ui/skeleton-loaders";
import { motion } from "framer-motion";

interface ChartData {
  time: string;
  vendas: number;
  transacoes: number;
}

export function SalesChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      
      const today = new Date();
      const startDate = startOfDay(today);
      
      // Fetch today's transactions
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("created_at, amount, status")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching sales data:", error);
        setLoading(false);
        return;
      }

      // Create hourly intervals for today
      const hours = eachHourOfInterval({
        start: startDate,
        end: today
      });

      // Aggregate data by hour
      const hourlyData: ChartData[] = hours.map(hour => {
        const hourStr = format(hour, "HH:00");
        const hourStart = startOfHour(hour);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

        const hourTransactions = (transactions || []).filter(t => {
          const txDate = parseISO(t.created_at);
          return txDate >= hourStart && txDate < hourEnd;
        });

        const paidTransactions = hourTransactions.filter(t => t.status === "paid");
        const totalRevenue = paidTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

        return {
          time: hourStr,
          vendas: totalRevenue,
          transacoes: hourTransactions.length
        };
      });

      setData(hourlyData);
      setLoading(false);
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return <ChartSkeleton />;
  }

  const hasData = data.some(d => d.vendas > 0 || d.transacoes > 0);

  return (
    <motion.div 
      className="premium-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-base font-semibold text-foreground">Performance do Dia</h3>
          <p className="text-[13px] text-muted-foreground mt-1">
            {hasData ? "Vendas e transações por hora" : "Nenhuma venda registrada hoje"}
          </p>
        </div>
        <div className="flex items-center gap-5 text-[12px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Vendas (R$)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
            <span className="text-muted-foreground">Transações</span>
          </div>
        </div>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(338, 82%, 42%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(338, 82%, 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="transactionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(338, 82%, 42%)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="hsl(338, 82%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 14%)" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 11 }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 10%)',
                border: '1px solid hsl(0 0% 100% / 0.1)',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                padding: '12px 16px',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 95%)', fontWeight: 500, marginBottom: 8 }}
              itemStyle={{ color: 'hsl(338, 82%, 42%)', fontSize: 13 }}
              formatter={(value: number, name: string) => [
                name === 'vendas' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : value,
                name === 'vendas' ? 'Vendas' : 'Transações'
              ]}
            />
            <Area
              type="monotone"
              dataKey="transacoes"
              stroke="hsl(338, 82%, 42%)"
              strokeOpacity={0.2}
              strokeWidth={1.5}
              fill="url(#transactionsGradient)"
            />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="hsl(338, 82%, 42%)"
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

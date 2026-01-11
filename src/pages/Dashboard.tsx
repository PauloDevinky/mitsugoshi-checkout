import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { SalesChart } from "@/components/admin/SalesChart";
import { ConversionFunnel } from "@/components/admin/ConversionFunnel";
import { TopProducts } from "@/components/admin/TopProducts";
import { RecentTransactions } from "@/components/admin/RecentTransactions";
import { supabase } from "@/integrations/supabase/client";
import { StatsCardSkeleton } from "@/components/ui/skeleton-loaders";
import { PageTransition } from "@/components/ui/page-transition";
import { 
  DollarSign, 
  TrendingUp, 
  QrCode, 
  BarChart3,
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { motion } from "framer-motion";

const dateFilters = [
  { label: "Hoje", value: "today" },
  { label: "Ontem", value: "yesterday" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Custom", value: "custom" },
];

interface Stats {
  totalRevenue: number;
  averageTicket: number;
  pixApprovalRate: number;
  estimatedProfit: number;
  revenueChange: number;
  ticketChange: number;
  pixRateChange: number;
  profitChange: number;
}

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    averageTicket: 0,
    pixApprovalRate: 0,
    estimatedProfit: 0,
    revenueChange: 0,
    ticketChange: 0,
    pixRateChange: 0,
    profitChange: 0,
  });
  const [loading, setLoading] = useState(true);

  const getDateRange = (filter: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (filter) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "yesterday":
        startDate = startOfDay(subDays(now, 1));
        endDate = endOfDay(subDays(now, 1));
        break;
      case "7d":
        startDate = startOfDay(subDays(now, 7));
        break;
      case "30d":
        startDate = startOfDay(subDays(now, 30));
        break;
      case "custom":
        if (customDateRange?.from) {
          startDate = startOfDay(customDateRange.from);
          endDate = customDateRange.to ? endOfDay(customDateRange.to) : endOfDay(customDateRange.from);
        } else {
          startDate = startOfDay(now);
        }
        break;
      default:
        startDate = startOfDay(now);
    }

    return { startDate, endDate };
  };

  const fetchStats = async () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange(activeFilter);

    try {
      // Fetch transactions within date range
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      const txns = transactions || [];
      
      // Calculate stats
      const paidTxns = txns.filter(t => t.status === "paid");
      const pixTxns = txns.filter(t => t.payment_method === "pix");
      const paidPixTxns = pixTxns.filter(t => t.status === "paid");

      const totalRevenue = paidTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const averageTicket = paidTxns.length > 0 ? totalRevenue / paidTxns.length : 0;
      const pixApprovalRate = pixTxns.length > 0 ? (paidPixTxns.length / pixTxns.length) * 100 : 0;
      
      // Estimated profit (80% margin - simplified)
      const estimatedProfit = totalRevenue * 0.8;

      // Fetch previous period for comparison
      const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const prevStart = subDays(startDate, periodLength);
      const prevEnd = subDays(startDate, 1);

      const { data: prevTransactions } = await supabase
        .from("transactions")
        .select("*")
        .gte("created_at", prevStart.toISOString())
        .lte("created_at", prevEnd.toISOString());

      const prevTxns = prevTransactions || [];
      const prevPaidTxns = prevTxns.filter(t => t.status === "paid");
      const prevPixTxns = prevTxns.filter(t => t.payment_method === "pix");
      const prevPaidPixTxns = prevPixTxns.filter(t => t.status === "paid");

      const prevRevenue = prevPaidTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const prevAvgTicket = prevPaidTxns.length > 0 ? prevRevenue / prevPaidTxns.length : 0;
      const prevPixRate = prevPixTxns.length > 0 ? (prevPaidPixTxns.length / prevPixTxns.length) * 100 : 0;
      const prevProfit = prevRevenue * 0.8;

      // Calculate changes
      const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      setStats({
        totalRevenue,
        averageTicket,
        pixApprovalRate,
        estimatedProfit,
        revenueChange: calcChange(totalRevenue, prevRevenue),
        ticketChange: calcChange(averageTicket, prevAvgTicket),
        pixRateChange: calcChange(pixApprovalRate, prevPixRate),
        profitChange: calcChange(estimatedProfit, prevProfit),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activeFilter, customDateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCustomDateLabel = () => {
    if (!customDateRange?.from) return null;
    if (!customDateRange.to || customDateRange.from.getTime() === customDateRange.to.getTime()) {
      return format(customDateRange.from, "dd/MM", { locale: ptBR });
    }
    return `${format(customDateRange.from, "dd/MM", { locale: ptBR })} - ${format(customDateRange.to, "dd/MM", { locale: ptBR })}`;
  };

  return (
    <AdminLayout>
      <PageTransition>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1.5">
              Visão geral das suas vendas e métricas
            </p>
          </motion.div>

          {/* Date Filters */}
          <motion.div 
            className="flex items-center gap-1.5 p-1.5 rounded-xl bg-surface-1 border border-border"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {dateFilters.filter(f => f.value !== "custom").map((filter) => (
              <motion.button
                key={filter.value}
                onClick={() => {
                  setActiveFilter(filter.value);
                  setCustomDateRange(undefined);
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                  activeFilter === filter.value && filter.value !== "custom"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {filter.label}
              </motion.button>
            ))}
            
            {/* Custom Date Picker */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <motion.button
                  className={cn(
                    "px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-2",
                    activeFilter === "custom"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {activeFilter === "custom" && customDateRange?.from ? getCustomDateLabel() : null}
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange?.from}
                  selected={customDateRange}
                  onSelect={(range) => {
                    setCustomDateRange(range);
                    if (range?.from) {
                      setActiveFilter("custom");
                    }
                    if (range?.from && range?.to) {
                      setCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {loading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Faturamento Total"
                value={formatCurrency(stats.totalRevenue)}
                change={`${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange.toFixed(1)}% vs período anterior`}
                changeType={stats.revenueChange >= 0 ? "positive" : "negative"}
                icon={DollarSign}
                highlight
                delay={0}
              />
              <StatsCard
                title="Ticket Médio"
                value={formatCurrency(stats.averageTicket)}
                change={`${stats.ticketChange >= 0 ? "+" : ""}${stats.ticketChange.toFixed(1)}% vs período anterior`}
                changeType={stats.ticketChange >= 0 ? "positive" : "negative"}
                icon={TrendingUp}
                delay={0.1}
              />
              <StatsCard
                title="Taxa Aprovação Pix"
                value={`${stats.pixApprovalRate.toFixed(1)}%`}
                change={`${stats.pixRateChange >= 0 ? "+" : ""}${stats.pixRateChange.toFixed(1)}% vs período anterior`}
                changeType={stats.pixRateChange >= 0 ? "positive" : "negative"}
                icon={QrCode}
                delay={0.2}
              />
              <StatsCard
                title="Lucro Estimado"
                value={formatCurrency(stats.estimatedProfit)}
                change={`${stats.profitChange >= 0 ? "+" : ""}${stats.profitChange.toFixed(1)}% vs período anterior`}
                changeType={stats.profitChange >= 0 ? "positive" : "negative"}
                icon={BarChart3}
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div>
            <ConversionFunnel />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProducts />
          <RecentTransactions />
        </div>
      </PageTransition>
    </AdminLayout>
  );
}

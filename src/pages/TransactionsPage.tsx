import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  Mail,
  MoreHorizontal,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

interface Transaction {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_whatsapp: string | null;
  amount: number;
  status: string;
  payment_method: string;
  utm_source: string | null;
  created_at: string;
  pix_code: string | null;
  pix_qr_url: string | null;
  product: {
    name: string;
  } | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    setLoading(true);
    
    let query = supabase
      .from("transactions")
      .select(`
        id,
        customer_name,
        customer_email,
        customer_whatsapp,
        amount,
        status,
        payment_method,
        utm_source,
        created_at,
        pix_code,
        pix_qr_url,
        product:products(name)
      `)
      .order("created_at", { ascending: false });

    if (dateRange?.from) {
      query = query.gte("created_at", startOfDay(dateRange.from).toISOString());
    }
    if (dateRange?.to) {
      query = query.lte("created_at", endOfDay(dateRange.to).toISOString());
    }

    const { data, error } = await query;

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch = t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatPrice = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      refused: "bg-red-500/20 text-red-400 border-red-500/30",
      refunded: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    };
    const labels = {
      paid: "Pago",
      pending: "Pendente",
      refused: "Recusado",
      refunded: "Reembolsado",
    };
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border",
        styles[status as keyof typeof styles] || styles.pending
      )}>
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "paid" ? "bg-emerald-400" :
          status === "pending" ? "bg-amber-400" :
          status === "refused" ? "bg-red-400" : "bg-zinc-400"
        )} />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const displayData = filteredTransactions;

  // Calculate stats
  const stats = {
    total: displayData.reduce((sum, t) => t.status === 'paid' ? sum + t.amount : sum, 0),
    paid: displayData.filter(t => t.status === 'paid').length,
    pending: displayData.filter(t => t.status === 'pending').length,
    refused: displayData.filter(t => t.status === 'refused').length,
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handleResendEmail = (transaction: Transaction) => {
    toast.success(`E-mail reenviado para ${transaction.customer_email}`);
  };

  // CSV Export function
  const handleExportCSV = () => {
    if (displayData.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    const headers = [
      "ID",
      "Data",
      "Cliente",
      "Email",
      "WhatsApp",
      "Produto",
      "Valor",
      "Status",
      "Método",
      "UTM Source"
    ];

    const rows = displayData.map(t => [
      t.id,
      format(new Date(t.created_at), "dd/MM/yyyy HH:mm"),
      t.customer_name,
      t.customer_email || "",
      t.customer_whatsapp || "",
      t.product?.name || "",
      t.amount.toFixed(2),
      t.status,
      t.payment_method || "",
      t.utm_source || ""
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transacoes_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${displayData.length} transações exportadas!`);
  };

  const getDateRangeLabel = () => {
    if (!dateRange?.from) return "Selecionar período";
    if (!dateRange.to) return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM", { locale: ptBR })}`;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Transações
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">
            Acompanhe todas as vendas e pagamentos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="p-2.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button 
            onClick={handleExportCSV}
            className="p-2.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Exportar CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards at TOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="premium-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-1">Faturamento</p>
          <p className="text-2xl font-bold text-primary tabular-nums">{formatPrice(stats.total)}</p>
        </div>
        <div className="premium-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-1">Aprovadas</p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">{stats.paid}</p>
        </div>
        <div className="premium-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">{stats.pending}</p>
        </div>
        <div className="premium-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-1">Recusadas</p>
          <p className="text-2xl font-bold text-red-400 tabular-nums">{stats.refused}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-10 rounded-xl bg-muted border-border text-[13px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-[13px]">Todos os Status</SelectItem>
            <SelectItem value="paid" className="text-[13px]">Pago</SelectItem>
            <SelectItem value="pending" className="text-[13px]">Pendente</SelectItem>
            <SelectItem value="refused" className="text-[13px]">Recusado</SelectItem>
            <SelectItem value="refunded" className="text-[13px]">Reembolsado</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl bg-muted border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {getDateRangeLabel()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                if (range?.from && range?.to) {
                  setCalendarOpen(false);
                }
              }}
              numberOfMonths={2}
              locale={ptBR}
              className="pointer-events-auto"
            />
            <div className="p-3 border-t border-border flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange({ from: subDays(new Date(), 7), to: new Date() });
                  setCalendarOpen(false);
                }}
              >
                7 dias
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                  setCalendarOpen(false);
                }}
              >
                30 dias
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange({ from: subDays(new Date(), 90), to: new Date() });
                  setCalendarOpen(false);
                }}
              >
                90 dias
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Transactions Table */}
      <div className="premium-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Data
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Cliente
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Produto
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Valor
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                UTM Source
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <RefreshCw className="w-8 h-8 animate-spin opacity-40" />
                    <p className="text-[14px]">Carregando transações...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <RefreshCw className="w-10 h-10 opacity-40" />
                    <p className="text-[14px]">Nenhuma transação encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((transaction) => (
                <TableRow 
                  key={transaction.id} 
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-[13px] text-foreground">
                        {format(new Date(transaction.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(transaction.created_at), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-medium text-foreground">{transaction.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{transaction.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-[13px] text-foreground">{transaction.product?.name || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-[14px] font-semibold text-primary tabular-nums">
                      {formatPrice(transaction.amount)}
                    </p>
                  </TableCell>
                  <TableCell>
                    {transaction.utm_source ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-[11px] font-medium text-muted-foreground border border-border">
                        {transaction.utm_source}
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-card border-border">
                        <DropdownMenuItem 
                          onClick={() => handleViewDetails(transaction)}
                          className="text-[13px] cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleResendEmail(transaction)}
                          className="text-[13px] cursor-pointer"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Reenviar E-mail
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalhes da Transação</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="mt-4">
              <pre className="p-4 rounded-xl bg-muted text-[12px] text-foreground overflow-auto max-h-96 font-mono border border-border">
                {JSON.stringify(selectedTransaction, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

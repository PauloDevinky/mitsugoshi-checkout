import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  Search, 
  MoreHorizontal, 
  MessageCircle, 
  Mail, 
  Eye,
  RefreshCw,
  CheckCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string;
  step_abandoned: number | null;
  recovered: boolean | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  product_id: string | null;
}

export default function RecoveryPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "recovered">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      toast.error("Erro ao carregar leads");
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.whatsapp.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "recovered" && lead.recovered) ||
      (statusFilter === "pending" && !lead.recovered);
    
    return matchesSearch && matchesStatus;
  });

  const markAsRecovered = async (id: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ recovered: true })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao marcar como recuperado");
    } else {
      toast.success("Lead marcado como recuperado!");
      fetchLeads();
    }
  };

  const openWhatsApp = (lead: Lead) => {
    const message = encodeURIComponent(
      `Olá ${lead.name}! Vi que você estava interessado em nosso produto. Posso te ajudar a finalizar sua compra?`
    );
    const phone = lead.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  const getStepLabel = (step: number | null) => {
    switch (step) {
      case 1: return "Dados Pessoais";
      case 2: return "Endereço/Frete";
      case 3: return "Pagamento";
      default: return "N/A";
    }
  };

  const stats = {
    total: leads.length,
    pending: leads.filter(l => !l.recovered).length,
    recovered: leads.filter(l => l.recovered).length,
    recoveryRate: leads.length > 0 
      ? Math.round((leads.filter(l => l.recovered).length / leads.length) * 100) 
      : 0
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-primary" />
            Recuperação de Carrinho
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">
            Leads que abandonaram o checkout antes de finalizar
          </p>
        </div>

        <Button onClick={fetchLeads} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="premium-card p-5">
          <p className="text-sm text-muted-foreground">Total de Abandonos</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-semibold text-orange-400 mt-1">{stats.pending}</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm text-muted-foreground">Recuperados</p>
          <p className="text-2xl font-semibold text-primary mt-1">{stats.recovered}</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm text-muted-foreground">Taxa de Recuperação</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{stats.recoveryRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-white/[0.06]"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { value: "all", label: "Todos" },
            { value: "pending", label: "Pendentes" },
            { value: "recovered", label: "Recuperados" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(option.value as typeof statusFilter)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Cliente</TableHead>
              <TableHead className="text-muted-foreground font-medium">WhatsApp</TableHead>
              <TableHead className="text-muted-foreground font-medium">Etapa Abandonada</TableHead>
              <TableHead className="text-muted-foreground font-medium">UTM Source</TableHead>
              <TableHead className="text-muted-foreground font-medium">Data</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Carregando leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-white/[0.06]">
                  <TableCell>
                    {lead.recovered ? (
                      <Badge className="bg-primary/20 text-primary border-0 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Recuperado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400 gap-1">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{lead.whatsapp}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {getStepLabel(lead.step_abandoned)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.utm_source || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem 
                          onClick={() => openWhatsApp(lead)}
                          className="gap-2 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          Abrir WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedLead(lead);
                            setDetailsOpen(true);
                          }}
                          className="gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {!lead.recovered && (
                          <DropdownMenuItem 
                            onClick={() => markAsRecovered(lead.id)}
                            className="gap-2 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 text-primary" />
                            Marcar Recuperado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(selectedLead, null, 2)}
              </pre>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  variant="outline"
                  onClick={() => openWhatsApp(selectedLead)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir WhatsApp
                </Button>
                {!selectedLead.recovered && (
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => {
                      markAsRecovered(selectedLead.id);
                      setDetailsOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Recuperar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const transactions = [
  { 
    id: "TXN001", 
    customer: "João Silva", 
    product: "Kit Premium", 
    value: 19700, 
    status: "approved", 
    time: "2 min", 
    utm: "tiktok_ads" 
  },
  { 
    id: "TXN002", 
    customer: "Maria Santos", 
    product: "Curso Trader Pro", 
    value: 29700, 
    status: "pending", 
    time: "5 min", 
    utm: "google_cpc" 
  },
  { 
    id: "TXN003", 
    customer: "Pedro Costa", 
    product: "Suplemento VitaMax", 
    value: 9900, 
    status: "approved", 
    time: "8 min", 
    utm: "facebook_ads" 
  },
  { 
    id: "TXN004", 
    customer: "Ana Oliveira", 
    product: "E-book Investimentos", 
    value: 4700, 
    status: "rejected", 
    time: "12 min", 
    utm: "organic" 
  },
  { 
    id: "TXN005", 
    customer: "Lucas Ferreira", 
    product: "Kit Premium", 
    value: 19700, 
    status: "approved", 
    time: "15 min", 
    utm: "tiktok_ads" 
  },
];

const statusConfig = {
  approved: { 
    label: "Aprovado", 
    icon: CheckCircle2, 
    className: "text-primary bg-primary/10" 
  },
  pending: { 
    label: "Pendente", 
    icon: Clock, 
    className: "text-amber-400 bg-amber-400/10" 
  },
  rejected: { 
    label: "Recusado", 
    icon: XCircle, 
    className: "text-red-400 bg-red-400/10" 
  },
};

export function RecentTransactions() {
  const navigate = useNavigate();
  
  return (
    <div className="premium-card p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-base font-semibold text-foreground">Transações Recentes</h3>
          <p className="text-[13px] text-muted-foreground mt-1">Últimas vendas</p>
        </div>
        <button 
          onClick={() => navigate("/transactions")}
          className="btn-premium-accent text-[12px] py-1.5 px-3"
        >
          Ver todas
        </button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx) => {
          const status = statusConfig[tx.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          
          return (
            <div 
              key={tx.id} 
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                status.className
              )}>
                <StatusIcon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-foreground truncate">{tx.customer}</p>
                  <span className="text-[14px] font-semibold text-primary tabular-nums">
                    R$ {(tx.value / 100).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] text-muted-foreground truncate">{tx.product}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-[12px] text-muted-foreground">{tx.time}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-[11px] text-primary/60 font-mono">{tx.utm}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { Package } from "lucide-react";
import { TopProductsSkeleton } from "@/components/ui/skeleton-loaders";
import { motion } from "framer-motion";

interface ProductStat {
  name: string;
  sales: number;
  revenue: number;
}

export function TopProducts() {
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoading(true);
      
      const last30Days = subDays(new Date(), 30);
      
      // Fetch paid transactions with product info
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
          amount,
          product_id,
          products(name)
        `)
        .eq("status", "paid")
        .gte("created_at", last30Days.toISOString());

      if (error) {
        console.error("Error fetching top products:", error);
        setLoading(false);
        return;
      }

      // Aggregate by product
      const productMap = new Map<string, ProductStat>();
      
      (transactions || []).forEach(tx => {
        const productName = (tx.products as any)?.name || "Produto Desconhecido";
        const existing = productMap.get(productName) || { name: productName, sales: 0, revenue: 0 };
        existing.sales += 1;
        existing.revenue += Number(tx.amount || 0);
        productMap.set(productName, existing);
      });

      // Sort by revenue and take top 5
      const sorted = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setProducts(sorted);
      setLoading(false);
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return <TopProductsSkeleton />;
  }

  const maxSales = Math.max(...products.map(p => p.sales), 1);

  return (
    <motion.div 
      className="premium-card p-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="mb-8">
        <h3 className="text-base font-semibold text-foreground">Top Produtos</h3>
        <p className="text-[13px] text-muted-foreground mt-1">
          {products.length > 0 ? "Últimos 30 dias" : "Sem vendas no período"}
        </p>
      </div>
      
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Package className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">Nenhuma venda registrada</p>
        </div>
      ) : (
        <div className="space-y-5">
          {products.map((product, index) => (
            <motion.div 
              key={product.name} 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[13px] font-semibold text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-medium text-foreground truncate pr-4">{product.name}</p>
                  <span className="text-[13px] font-semibold text-primary tabular-nums">
                    R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 progress-premium">
                    <motion.div 
                      className="progress-premium-fill opacity-60"
                      initial={{ width: 0 }}
                      animate={{ width: `${(product.sales / maxSales) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + 0.1 * index, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">
                    {product.sales} {product.sales === 1 ? 'venda' : 'vendas'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

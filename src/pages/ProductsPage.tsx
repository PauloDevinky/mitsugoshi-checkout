import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductSheet } from "@/components/products/ProductSheet";
import { useProducts, Product, ProductFormData } from "@/hooks/useProducts";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  Package,
  Search,
  Loader2,
  Link,
  Copy,
  Check
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { getCheckoutUrl } from "@/config/domains";

export default function ProductsPage() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug
  useEffect(() => {
    console.log("ProductsPage mounted, products:", products, "loading:", loading);
  }, [products, loading]);

  const handleNewProduct = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setSheetOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct(productId);
    }
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await createProduct(formData);
    }
    setSheetOpen(false);
  };

  const handleCopyLink = (product: Product) => {
    const link = getCheckoutUrl(product.slug);
    navigator.clipboard.writeText(link);
    setCopiedId(product.id);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter(p => {
    if (!p || !p.name) return false;
    try {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    } catch (err) {
      console.error("Error filtering product:", err, p);
      return false;
    }
  });

  // Error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      setError(event.error?.message || "Erro desconhecido");
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const formatPrice = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Calculate shipping revenue from shipping_options
  const getShippingInfo = (product: Product) => {
    try {
      if (!product || !product.shipping_options || !Array.isArray(product.shipping_options) || product.shipping_options.length === 0) {
        return null;
      }
      const prices = product.shipping_options
        .map(o => (o && typeof o === 'object' && 'price' in o) ? (Number(o.price) || 0) : 0)
        .filter(p => !isNaN(p) && p >= 0);
      if (prices.length === 0) return null;
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return minPrice === 0 ? "Grátis" : formatPrice(minPrice);
      }
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    } catch (err) {
      console.error("Error calculating shipping info:", err);
      return null;
    }
  };

  // Error boundary
  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive text-lg font-semibold">Erro ao carregar produtos</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Recarregar Página
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Produtos
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">
            Gerencie seus produtos e ofertas
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>

          {/* New Product Button */}
          <button
            onClick={handleNewProduct}
            className="btn-premium-accent flex items-center gap-2 py-2.5"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="premium-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Produto
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Preço
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Frete
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                Link
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin opacity-40" />
                    <p className="text-[14px]">Carregando produtos...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Package className="w-10 h-10 opacity-40" />
                    <p className="text-[14px]">Nenhum produto encontrado</p>
                    <button
                      onClick={handleNewProduct}
                      className="text-primary text-[13px] hover:underline"
                    >
                      Criar primeiro produto
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                if (!product || !product.id) {
                  return null;
                }
                return (
                <TableRow 
                  key={product.id} 
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name || 'Produto'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-foreground">{product.name || 'Sem nome'}</p>
                        <p className="text-[12px] text-muted-foreground font-mono">/{product.slug || 'sem-slug'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-[12px] text-muted-foreground line-through">
                        {formatPrice(product.price_original)}
                      </p>
                      <p className="text-[14px] font-semibold text-primary tabular-nums">
                        {formatPrice(product.price_sale)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getShippingInfo(product) ? (
                      <span className="text-[13px] text-primary font-medium tabular-nums">
                        {getShippingInfo(product)}
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border",
                      product.status === "active" 
                        ? "bg-primary/20 text-primary border-primary/30" 
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        product.status === "active" ? "bg-primary" : "bg-muted-foreground"
                      )} />
                      {product.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleCopyLink(product)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border",
                        copiedId === product.id
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary border-border"
                      )}
                    >
                      {copiedId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-card border-border">
                        <DropdownMenuItem 
                          onClick={() => handleCopyLink(product)}
                          className="text-[13px] cursor-pointer"
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Copiar Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          onClick={() => handleEditProduct(product)}
                          className="text-[13px] cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-[13px] text-red-400 focus:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Product Sheet */}
      <ProductSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={editingProduct}
        products={products}
        onSave={handleSaveProduct}
      />
    </AdminLayout>
  );
}

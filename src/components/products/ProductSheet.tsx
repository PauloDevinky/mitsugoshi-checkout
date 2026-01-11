import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  Info,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, ProductFormData, ShippingOption, OrderBump } from "@/hooks/useProducts";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  products: Product[];
  onSave: (data: ProductFormData) => Promise<void>;
}

const defaultFormData: ProductFormData = {
  name: "",
  slug: "",
  price_original: 0,
  price_sale: 0,
  image_url: null,
  status: "active",
  tiktok_pixel_id: "",
  tiktok_access_token: "",
  checkout_color: "#22C55E",
  checkout_template: "template-a",
  shipping_options: [],
  order_bumps: [],
  is_subscription: false,
  subscription_interval: "monthly",
  checkout_urgency_text: "Oferta por tempo limitado!",
  checkout_timer_minutes: 15,
};

export function ProductSheet({ open, onOpenChange, product, products, onSave }: ProductSheetProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<{ original: string; sale: string }>({ original: "", sale: "" });
  const [shippingPriceInputs, setShippingPriceInputs] = useState<Record<number, string>>({});
  const [discountInputs, setDiscountInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        price_original: product.price_original || 0,
        price_sale: product.price_sale || 0,
        image_url: product.image_url,
        status: product.status || "active",
        tiktok_pixel_id: product.tiktok_pixel_id || "",
        tiktok_access_token: product.tiktok_access_token || "",
        checkout_color: product.checkout_color || "#22C55E",
        checkout_template: product.checkout_template || "template-a",
        shipping_options: product.shipping_options || [],
        order_bumps: product.order_bumps || [],
        is_subscription: product.is_subscription || false,
        subscription_interval: product.subscription_interval || "monthly",
        checkout_urgency_text: product.checkout_urgency_text || "Oferta por tempo limitado!",
        checkout_timer_minutes: product.checkout_timer_minutes || 15,
      });
      setPriceInputs({
        original: product.price_original ? product.price_original.toString().replace('.', ',') : "",
        sale: product.price_sale ? product.price_sale.toString().replace('.', ',') : ""
      });
      // Inicializar inputs de preço de frete
      const shippingInputs: Record<number, string> = {};
      (product.shipping_options || []).forEach((opt, idx) => {
        shippingInputs[idx] = opt.price > 0 ? opt.price.toFixed(2).replace('.', ',') : "";
      });
      setShippingPriceInputs(shippingInputs);
      // Inicializar inputs de desconto
      const discountInputs: Record<number, string> = {};
      (product.order_bumps || []).forEach((bump, idx) => {
        discountInputs[idx] = bump.discount_percent ? bump.discount_percent.toString() : "";
      });
      setDiscountInputs(discountInputs);
    } else {
      setFormData(defaultFormData);
      setPriceInputs({ original: "", sale: "" });
      setShippingPriceInputs({});
      setDiscountInputs({});
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validações
    if (!formData.name.trim()) {
      setError("Nome do produto é obrigatório");
      return;
    }
    
    if (!formData.slug.trim()) {
      setError("Slug é obrigatório");
      return;
    }
    
    if (formData.price_sale <= 0) {
      setError("Preço de venda deve ser maior que zero");
      return;
    }
    
    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Erro ao salvar produto. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const displayPrice = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value) || value === 0) return "";
    return value.toFixed(2).replace('.', ',');
  };

  const parsePrice = (value: string) => {
    if (!value || value.trim() === "") return 0;
    
    // Remove tudo exceto números, vírgula e ponto
    let cleaned = value.replace(/[^\d,.]/g, "");
    
    // Se tiver vírgula, substitui por ponto (formato brasileiro)
    cleaned = cleaned.replace(",", ".");
    
    // Remove pontos extras (mantém apenas o último como separador decimal)
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      // Se tiver múltiplos pontos, mantém o primeiro como inteiro e o último como decimal
      cleaned = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Shipping options handlers
  const addShippingOption = () => {
    const newIndex = formData.shipping_options.length;
    setFormData(prev => ({
      ...prev,
      shipping_options: [...prev.shipping_options, { name: "", price: 0 }]
    }));
    setShippingPriceInputs(prev => ({
      ...prev,
      [newIndex]: ""
    }));
  };

  const updateShippingOption = (index: number, field: keyof ShippingOption, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      shipping_options: prev.shipping_options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
    // Não atualizar shippingPriceInputs aqui - deixar o onChange controlar
  };

  const removeShippingOption = (index: number) => {
    setFormData(prev => {
      const newOptions = prev.shipping_options.filter((_, i) => i !== index);
      // Reconstruir os inputs de preço baseado nos novos índices
      const newInputs: Record<number, string> = {};
      newOptions.forEach((opt, i) => {
        newInputs[i] = opt.price > 0 ? opt.price.toFixed(2).replace('.', ',') : "";
      });
      setShippingPriceInputs(newInputs);
      return {
        ...prev,
        shipping_options: newOptions
      };
    });
  };

  // Order bumps handlers
  const addOrderBump = () => {
    const newIndex = formData.order_bumps.length;
    setFormData(prev => ({
      ...prev,
      order_bumps: [...prev.order_bumps, { product_id: "", discount_percent: 0, title: "", description: "" }]
    }));
    setDiscountInputs(prev => ({
      ...prev,
      [newIndex]: ""
    }));
  };

  const updateOrderBump = (index: number, field: keyof OrderBump, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      order_bumps: prev.order_bumps.map((bump, i) => 
        i === index ? { ...bump, [field]: value } : bump
      )
    }));
    // Não atualizar discountInputs aqui - deixar o onChange controlar
  };

  const removeOrderBump = (index: number) => {
    setFormData(prev => {
      const newBumps = prev.order_bumps.filter((_, i) => i !== index);
      // Reconstruir os inputs de desconto baseado nos novos índices
      const newInputs: Record<number, string> = {};
      newBumps.forEach((bump, i) => {
        newInputs[i] = bump.discount_percent ? bump.discount_percent.toString() : "";
      });
      setDiscountInputs(newInputs);
      return {
        ...prev,
        order_bumps: newBumps
      };
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] bg-card border-border overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-xl font-semibold text-foreground">
            {product ? "Editar Produto" : "Novo Produto"}
          </SheetTitle>
          <SheetDescription className="text-[14px] text-muted-foreground">
            Configure os detalhes do produto e estratégias de conversão
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION: Basic Data */}
          <section className="space-y-5">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              Dados Básicos
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Imagem do Produto
                </label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="products"
                  aspectRatio="square"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Kit Premium Emagrecimento"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Slug / URL
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 rounded-l-xl bg-muted border border-r-0 border-border text-[14px] text-muted-foreground">
                    /pay/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="meu-produto"
                    required
                    className="flex-1 px-4 py-3 rounded-r-xl bg-muted border border-border text-[14px] text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-muted-foreground mb-2">
                    Preço "De"
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground">
                      R$
                    </span>
                    <input
                      type="text"
                      value={priceInputs.original}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setPriceInputs(prev => ({ ...prev, original: inputValue }));
                        // Atualizar formData em tempo real
                        const parsed = parsePrice(inputValue);
                        setFormData({ ...formData, price_original: parsed });
                      }}
                      onBlur={(e) => {
                        // Formatar ao sair do campo
                        const parsed = parsePrice(e.target.value);
                        setFormData({ ...formData, price_original: parsed });
                        setPriceInputs(prev => ({ 
                          ...prev, 
                          original: parsed > 0 ? parsed.toFixed(2).replace('.', ',') : "" 
                        }));
                      }}
                      placeholder="0,00"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-[14px] text-muted-foreground line-through placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-2">
                    Preço "Por"
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-primary">
                      R$
                    </span>
                    <input
                      type="text"
                      value={priceInputs.sale}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setPriceInputs(prev => ({ ...prev, sale: inputValue }));
                        // Atualizar formData em tempo real
                        const parsed = parsePrice(inputValue);
                        setFormData({ ...formData, price_sale: parsed });
                      }}
                      onBlur={(e) => {
                        // Formatar ao sair do campo
                        const parsed = parsePrice(e.target.value);
                        setFormData({ ...formData, price_sale: parsed });
                        setPriceInputs(prev => ({ 
                          ...prev, 
                          sale: parsed > 0 ? parsed.toFixed(2).replace('.', ',') : "" 
                        }));
                      }}
                      placeholder="0,00"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-primary/30 text-[14px] text-primary font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Status
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="w-full px-4 py-3 h-auto rounded-xl bg-muted border-border text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="active" className="text-[14px]">Ativo</SelectItem>
                    <SelectItem value="inactive" className="text-[14px]">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* SECTION: Shipping Options (Frete = 100% Lucro) */}
          <section className="space-y-5 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Opções de Frete (Lucro)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Todo frete cobrado é 100% lucro
                </p>
              </div>
              <button
                type="button"
                onClick={addShippingOption}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-primary hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>

            {formData.shipping_options.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-4">
                Nenhuma opção de frete configurada
              </p>
            ) : (
              <div className="space-y-3">
                {formData.shipping_options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => updateShippingOption(index, 'name', e.target.value)}
                      placeholder="Nome (ex: Sedex)"
                      className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                        R$
                      </span>
                      <input
                        type="text"
                        value={shippingPriceInputs[index] !== undefined ? shippingPriceInputs[index] : (option.price > 0 ? option.price.toFixed(2).replace('.', ',') : "")}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Atualizar o input imediatamente
                          setShippingPriceInputs(prev => ({ ...prev, [index]: inputValue }));
                          // Atualizar formData em tempo real com o valor parseado
                          const parsed = parsePrice(inputValue);
                          setFormData(prev => ({
                            ...prev,
                            shipping_options: prev.shipping_options.map((opt, i) => 
                              i === index ? { ...opt, price: parsed } : opt
                            )
                          }));
                        }}
                        onBlur={(e) => {
                          // Formatar ao sair do campo
                          const parsed = parsePrice(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            shipping_options: prev.shipping_options.map((opt, i) => 
                              i === index ? { ...opt, price: parsed } : opt
                            )
                          }));
                          setShippingPriceInputs(prev => ({
                            ...prev,
                            [index]: parsed > 0 ? parsed.toFixed(2).replace('.', ',') : ""
                          }));
                        }}
                        placeholder="0,00"
                        className="w-full pl-10 pr-3 py-2 rounded-lg bg-muted border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 tabular-nums"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeShippingOption(index)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION: Order Bumps with Title and Description */}
          <section className="space-y-5 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Order Bumps
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Produtos adicionais oferecidos no checkout
                </p>
              </div>
              <button
                type="button"
                onClick={addOrderBump}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-primary hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>

            {formData.order_bumps.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-4">
                Nenhum order bump configurado
              </p>
            ) : (
              <div className="space-y-4">
                {formData.order_bumps.map((bump, index) => {
                  const bumpProduct = products.find(p => p.id === bump.product_id);
                  return (
                    <div key={index} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                      <div className="flex items-start gap-3">
                        {/* Product Image Preview */}
                        {bumpProduct?.image_url && (
                          <img 
                            src={bumpProduct.image_url} 
                            alt={bumpProduct.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 space-y-3">
                          {/* Product Select */}
                          <Select 
                            value={bump.product_id || "none"} 
                            onValueChange={(value) => updateOrderBump(index, 'product_id', value === "none" ? "" : value)}
                          >
                            <SelectTrigger className="w-full px-3 py-2 h-auto rounded-lg bg-muted border-border text-[13px]">
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="none" className="text-[13px]">Selecione...</SelectItem>
                              {products
                                .filter(p => p.id !== product?.id)
                                .map(p => (
                                  <SelectItem key={p.id} value={p.id} className="text-[13px]">
                                    {p.name}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>

                          {/* Discount */}
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground">Desconto:</span>
                            <div className="relative w-20">
                              <input
                                type="text"
                                value={discountInputs[index] !== undefined ? discountInputs[index] : (bump.discount_percent ? bump.discount_percent.toString() : "")}
                                onChange={(e) => {
                                  const inputValue = e.target.value.replace(/[^\d]/g, ""); // Apenas números
                                  // Atualizar o input imediatamente
                                  setDiscountInputs(prev => ({ ...prev, [index]: inputValue }));
                                  // Atualizar formData em tempo real com o valor parseado e limitado
                                  const parsed = parseInt(inputValue) || 0;
                                  const clamped = Math.min(Math.max(parsed, 0), 100); // Limitar entre 0 e 100
                                  setFormData(prev => ({
                                    ...prev,
                                    order_bumps: prev.order_bumps.map((b, i) => 
                                      i === index ? { ...b, discount_percent: clamped } : b
                                    )
                                  }));
                                }}
                                onBlur={(e) => {
                                  // Garantir valor válido ao sair do campo
                                  const parsed = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0;
                                  const clamped = Math.min(Math.max(parsed, 0), 100);
                                  setFormData(prev => ({
                                    ...prev,
                                    order_bumps: prev.order_bumps.map((b, i) => 
                                      i === index ? { ...b, discount_percent: clamped } : b
                                    )
                                  }));
                                  setDiscountInputs(prev => ({
                                    ...prev,
                                    [index]: clamped > 0 ? clamped.toString() : ""
                                  }));
                                }}
                                placeholder="0"
                                className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 tabular-nums"
                              />
                            </div>
                            <span className="text-[12px] text-muted-foreground">%</span>
                          </div>

                          {/* Custom Title */}
                          <div>
                            <Input
                              value={bump.title || ""}
                              onChange={(e) => updateOrderBump(index, 'title', e.target.value)}
                              placeholder="Título personalizado (opcional)"
                              className="bg-muted border-border text-[13px]"
                            />
                          </div>

                          {/* Custom Description */}
                          <div>
                            <Textarea
                              value={bump.description || ""}
                              onChange={(e) => updateOrderBump(index, 'description', e.target.value)}
                              placeholder="Descrição do bump (opcional)"
                              className="bg-muted border-border text-[13px] min-h-[60px]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOrderBump(index)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION: Tracking */}
          <section className="space-y-5 pt-6 border-t border-border">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              Tracking & Inteligência
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  TikTok Pixel ID
                </label>
                <input
                  type="text"
                  value={formData.tiktok_pixel_id || ""}
                  onChange={(e) => setFormData({ ...formData, tiktok_pixel_id: e.target.value })}
                  placeholder="Ex: CXXXXXX"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-[14px] text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  TikTok Access Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={formData.tiktok_access_token || ""}
                    onChange={(e) => setFormData({ ...formData, tiktok_access_token: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-muted border border-border text-[14px] text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: Checkout Customization */}
          <section className="space-y-5 pt-6 border-t border-border">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              Personalização do Checkout
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Texto de Urgência
                </label>
                <input
                  type="text"
                  value={formData.checkout_urgency_text || ""}
                  onChange={(e) => setFormData({ ...formData, checkout_urgency_text: e.target.value })}
                  placeholder="Ex: Oferta por tempo limitado!"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Timer (minutos)
                </label>
                <input
                  type="number"
                  value={formData.checkout_timer_minutes || 15}
                  onChange={(e) => setFormData({ ...formData, checkout_timer_minutes: parseInt(e.target.value) || 15 })}
                  min="1"
                  max="60"
                  className="w-32 px-4 py-3 rounded-xl bg-muted border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Cor do Botão (Checkout)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.checkout_color}
                    onChange={(e) => setFormData({ ...formData, checkout_color: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.checkout_color}
                    onChange={(e) => setFormData({ ...formData, checkout_color: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-[14px] text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Template
                </label>
                <Select 
                  value={formData.checkout_template} 
                  onValueChange={(value) => setFormData({ ...formData, checkout_template: value })}
                >
                  <SelectTrigger className="w-full px-4 py-3 h-auto rounded-xl bg-muted border-border text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="template-a" className="text-[14px]">Template A (Padrão)</SelectItem>
                    <SelectItem value="template-b" className="text-[14px]">Template B (Alternativo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="pt-4">
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-6 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-white transition-all",
                saving 
                  ? "bg-muted text-muted-foreground cursor-not-allowed" 
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                product ? "Salvar Alterações" : "Criar Produto"
              )}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

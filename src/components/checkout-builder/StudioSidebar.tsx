import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Palette, 
  Timer, 
  Shield, 
  Package, 
  Search, 
  X, 
  ShoppingCart,
  Users,
  Star,
  Plus,
  Trash2
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MotionButton } from "@/components/ui/page-transition";
import type { CheckoutConfig } from "@/pages/CheckoutBuilderPage";
import type { Product } from "@/hooks/useProducts";

interface StudioSidebarProps {
  config: CheckoutConfig;
  updateConfig: <K extends keyof CheckoutConfig>(key: K, value: CheckoutConfig[K]) => void;
  products: Product[];
  selectedProduct?: Product;
  onSelectProduct: (product: Product) => void;
  onClearSelection: () => void;
  loading: boolean;
}


export function StudioSidebar({
  config,
  updateConfig,
  products,
  selectedProduct,
  onSelectProduct,
  onClearSelection,
  loading,
}: StudioSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (searchQuery.length < 2) return products.slice(0, 10);
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <motion.aside 
      className="w-full bg-[#0A0A0A] flex flex-col overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Product Selector */}
      <div className="p-4 border-b border-white/10 bg-[#0A0A0A]">
        <Label className="text-xs font-medium mb-2 block text-zinc-400 uppercase tracking-wide">
          Produto
        </Label>
        
        {selectedProduct ? (
          <motion.div 
            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            {selectedProduct.image_url ? (
              <img 
                src={selectedProduct.image_url} 
                alt={selectedProduct.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Package className="w-5 h-5 text-zinc-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-100 text-sm truncate">{selectedProduct.name}</p>
              <p className="text-xs text-zinc-400">
                R$ {(selectedProduct.price_sale || 0).toFixed(2)}
              </p>
            </div>
            <MotionButton 
              onClick={onClearSelection}
              className="text-zinc-400 hover:text-zinc-100 p-1.5 hover:bg-white/5 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </MotionButton>
          </motion.div>
        ) : (
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors">
                <Search className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-400">
                  Buscar produto...
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 bg-[#0A0A0A] border-white/10" align="start">
              <Command className="bg-transparent">
                <CommandInput 
                  placeholder="Nome do produto..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="h-10 text-zinc-100"
                />
                <CommandList className="max-h-[250px]">
                  {loading ? (
                    <CommandEmpty className="py-4 text-center text-xs text-zinc-400">
                      Carregando...
                    </CommandEmpty>
                  ) : filteredProducts.length === 0 ? (
                    <CommandEmpty className="py-4 text-center text-xs text-zinc-400">
                      Nenhum produto encontrado
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredProducts.map(product => (
                        <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={() => {
                            onSelectProduct(product);
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-white/5 text-zinc-100"
                        >
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <Package className="w-4 h-4 text-zinc-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-100">{product.name}</p>
                            <p className="text-xs text-zinc-400">
                              R$ {(product.price_sale || 0).toFixed(2)}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Scrollable Sections */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={["identidade"]} className="w-full">
          {/* 🎨 Identidade */}
          <AccordionItem value="identidade" className="border-b border-white/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium text-zinc-100">🎨 Identidade</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 space-y-4 bg-white/5">
              {/* Upload de Logo */}
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Upload de Logo</Label>
                <ImageUpload
                  value={config.checkout_logo_url}
                  onChange={(url) => updateConfig("checkout_logo_url", url)}
                  folder="checkout"
                  aspectRatio="logo"
                />
              </div>

              {/* Largura do Logo */}
              {config.checkout_logo_url && (
                <div>
                  <Label className="text-xs text-zinc-400 mb-1.5 block">
                    Largura do Logo: {config.logoWidth}px
                  </Label>
                  <Slider
                    value={[config.logoWidth || 120]}
                    onValueChange={([value]) => updateConfig("logoWidth", value)}
                    min={50}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}

              {/* Cor Primária */}
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.checkout_color}
                    onChange={(e) => updateConfig("checkout_color", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                  />
                  <Input
                    value={config.checkout_color}
                    onChange={(e) => updateConfig("checkout_color", e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-xs h-10 text-zinc-100"
                  />
                </div>
              </div>

              {/* Banner */}
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Banner</Label>
                <ImageUpload
                  value={config.checkout_banner_url}
                  onChange={(url) => updateConfig("checkout_banner_url", url)}
                  folder="checkout"
                  aspectRatio="video"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ⚡ Urgência */}
          <AccordionItem value="urgencia" className="border-b border-white/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <Timer className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium text-zinc-100">⚡ Urgência</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 space-y-4 bg-white/5">
              {/* Cor da Barra de Aviso */}
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Cor da Barra de Aviso</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.checkout_urgency_bar_bg_color}
                    onChange={(e) => updateConfig("checkout_urgency_bar_bg_color", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                  />
                  <Input
                    value={config.checkout_urgency_bar_bg_color}
                    onChange={(e) => updateConfig("checkout_urgency_bar_bg_color", e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-xs h-10 text-zinc-100"
                  />
                </div>
              </div>

              {/* Texto de Aviso */}
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Texto de Aviso</Label>
                <Input
                  value={config.checkout_urgency_text}
                  onChange={(e) => updateConfig("checkout_urgency_text", e.target.value)}
                  placeholder="🔥 OFERTA LIMITADA!"
                  className="bg-white/5 border-white/10 text-sm text-zinc-100"
                />
              </div>

              {/* Toggle Mostrar Contagem Regressiva */}
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-100">Mostrar Contagem Regressiva</Label>
                <Switch
                  checked={config.checkout_show_timer_countdown}
                  onCheckedChange={(v) => updateConfig("checkout_show_timer_countdown", v)}
                />
              </div>

              {/* Input de Tempo (Minutos) */}
              {config.checkout_show_timer_countdown && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <Label className="text-xs text-zinc-400 mb-1.5 block">Minutos</Label>
                  <Input
                    type="number"
                    value={config.checkout_timer_minutes}
                    onChange={(e) => updateConfig("checkout_timer_minutes", parseInt(e.target.value) || 15)}
                    min={1}
                    max={60}
                    className="bg-white/5 border-white/10 text-sm text-zinc-100"
                  />
                </motion.div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 🛒 Oferta */}
          <AccordionItem value="oferta" className="border-b border-white/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium text-zinc-100">🛒 Oferta</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 space-y-4 bg-white/5">
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Headline do Bump</Label>
                <Input
                  value={config.checkout_order_bump_headline}
                  onChange={(e) => updateConfig("checkout_order_bump_headline", e.target.value)}
                  placeholder="Leve também..."
                  className="bg-white/5 border-white/10 text-sm text-zinc-100"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Cor de Destaque</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.checkout_order_bump_color}
                    onChange={(e) => updateConfig("checkout_order_bump_color", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                  />
                  <Input
                    value={config.checkout_order_bump_color}
                    onChange={(e) => updateConfig("checkout_order_bump_color", e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-xs h-10 text-zinc-100"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 👥 Prova Social */}
          <AccordionItem value="prova-social" className="border-b border-white/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium text-zinc-100">👥 Prova Social</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 space-y-4 bg-white/5">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-100">Ativar Pessoas Comprando</Label>
                <Switch
                  checked={config.checkout_show_social_proof}
                  onCheckedChange={(v) => updateConfig("checkout_show_social_proof", v)}
                />
              </div>
              {config.checkout_show_social_proof && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <Label className="text-xs text-zinc-400 mb-1.5 block">Máximo de Pessoas</Label>
                  <Input
                    type="number"
                    value={config.checkout_social_proof_max}
                    onChange={(e) => updateConfig("checkout_social_proof_max", parseInt(e.target.value) || 50)}
                    min={10}
                    className="bg-white/5 border-white/10 text-sm text-zinc-100"
                  />
                </motion.div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* ⭐ Avaliações */}
          <AccordionItem value="avaliacoes" className="border-b border-white/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium text-zinc-100">⭐ Avaliações de Clientes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 space-y-4 bg-white/5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <Label className="text-sm text-zinc-100">Mostrar Avaliações</Label>
                <Switch
                  checked={config.showReviews ?? true}
                  onCheckedChange={(v) => updateConfig("showReviews", v)}
                />
              </div>
              <div className="space-y-3">
                {config.checkout_reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-zinc-400">Avaliação #{index + 1}</Label>
                      <button
                        onClick={() => {
                          const newReviews = config.checkout_reviews.filter((_, i) => i !== index);
                          updateConfig("checkout_reviews", newReviews);
                        }}
                        className="text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <Input
                      placeholder="Nome do Cliente"
                      value={review.name}
                      onChange={(e) => {
                        const newReviews = [...config.checkout_reviews];
                        newReviews[index] = { ...review, name: e.target.value };
                        updateConfig("checkout_reviews", newReviews);
                      }}
                      className="bg-white/5 border-white/10 text-xs h-8 text-zinc-100"
                    />
                    <Textarea
                      placeholder="Texto do Comentário"
                      value={review.text}
                      onChange={(e) => {
                        const newReviews = [...config.checkout_reviews];
                        newReviews[index] = { ...review, text: e.target.value };
                        updateConfig("checkout_reviews", newReviews);
                      }}
                      className="bg-white/5 border-white/10 text-xs min-h-[60px] text-zinc-100"
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-zinc-400">Nota:</Label>
                      <Select
                        value={review.rating.toString()}
                        onValueChange={(v) => {
                          const newReviews = [...config.checkout_reviews];
                          newReviews[index] = { ...review, rating: parseInt(v) };
                          updateConfig("checkout_reviews", newReviews);
                        }}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-xs h-8 text-zinc-100 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-white/10">
                          {[1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={n.toString()} className="text-zinc-100">
                              {n} ⭐
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400 mb-1 block">Foto do Cliente</Label>
                      <ImageUpload
                        value={review.photo_url}
                        onChange={(url) => {
                          const newReviews = [...config.checkout_reviews];
                          newReviews[index] = { ...review, photo_url: url || "" };
                          updateConfig("checkout_reviews", newReviews);
                        }}
                        folder="reviews"
                        aspectRatio="square"
                      />
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={() => {
                    updateConfig("checkout_reviews", [
                      ...config.checkout_reviews,
                      { name: "", text: "", rating: 5, photo_url: "" }
                    ]);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar Avaliação
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 🔒 Confiança */}
          <AccordionItem value="confianca" className="border-b border-white/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium text-zinc-100">🔒 Confiança</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 space-y-4 bg-white/5">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-100">Selos de Segurança</Label>
                <Switch
                  checked={config.checkout_show_security_badges}
                  onCheckedChange={(v) => updateConfig("checkout_show_security_badges", v)}
                />
              </div>
              {config.checkout_show_security_badges && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <div>
                    <Label className="text-xs text-zinc-400 mb-1.5 block">Tipo de Selos</Label>
                    <Select
                      value={config.checkout_security_badges_type}
                      onValueChange={(v: "default" | "custom") => updateConfig("checkout_security_badges_type", v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-sm text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-white/10">
                        <SelectItem value="default" className="text-zinc-100">Usar Selos Padrão</SelectItem>
                        <SelectItem value="custom" className="text-zinc-100">Upload de Imagem Própria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {config.checkout_security_badges_type === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <Label className="text-xs text-zinc-400 mb-1.5 block">Imagem dos Selos</Label>
                      <ImageUpload
                        value={config.checkout_security_badges_custom_url}
                        onChange={(url) => updateConfig("checkout_security_badges_custom_url", url)}
                        folder="security-badges"
                        aspectRatio="wide"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 📄 Rodapé */}
          <AccordionItem value="rodape" className="border-b border-white/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium text-zinc-100">📄 Rodapé</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 space-y-4 bg-white/5">
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Imagem Customizada (Selos/Pagamentos)</Label>
                <ImageUpload
                  value={config.customFooterImage}
                  onChange={(url) => updateConfig("customFooterImage", url)}
                  folder="checkout"
                  aspectRatio="video"
                />
                <p className="text-xs text-zinc-500 mt-1">Se preenchido, substitui os selos padrão</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Texto do Rodapé</Label>
                <Textarea
                  value={config.checkout_footer_text}
                  onChange={(e) => updateConfig("checkout_footer_text", e.target.value)}
                  placeholder="CNPJ, Endereço, etc..."
                  className="bg-white/5 border-white/10 text-sm min-h-[100px] text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.aside>
  );
}

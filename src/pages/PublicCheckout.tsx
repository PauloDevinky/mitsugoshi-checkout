import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLeads } from "@/hooks/useLeads";
import { currentDomainIsCheckout } from "@/config/domains";
import { getCheckoutSlugFromPath } from "@/lib/storeMode";
import { Loader2, AlertTriangle, Copy, CheckCircle, QrCode, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckoutTemplate } from "@/components/checkout/CheckoutTemplate";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { CheckoutConfig } from "@/pages/CheckoutBuilderPage";
import { defaultConfig } from "@/pages/CheckoutBuilderPage";

import { PaymentEngine } from "@/services/payment-engine";

interface ShippingOption {
  name: string;
  price: number;
}

interface OrderBump {
  product_id: string;
  discount_percent: number;
  title?: string;
  description?: string;
}

interface CustomerReview {
  name: string;
  photo_url: string;
  text: string;
  rating: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price_original: number;
  price_sale: number;
  image_url: string | null;
  checkout_color: string | null;
  checkout_bg_color: string | null;
  checkout_template: string | null;
  checkout_urgency_text: string | null;
  checkout_timer_minutes: number | null;
  checkout_timer_bg_color: string | null;
  checkout_timer_text_color: string | null;
  checkout_urgency_bar_bg_color: string | null;
  checkout_show_timer_countdown: boolean | null;
  checkout_banner_url: string | null;
  checkout_logo_url: string | null;
  checkout_show_timer: boolean | null;
  checkout_show_security_badges: boolean | null;
  checkout_show_social_proof: boolean | null;
  checkout_social_proof_count: number | null;
  checkout_social_proof_min: number | null;
  checkout_social_proof_max: number | null;
  checkout_order_bump_headline: string | null;
  checkout_order_bump_color: string | null;
  checkout_reviews: CustomerReview[];
  checkout_footer_text: string | null;
  checkout_security_badges_type: "default" | "custom" | null;
  checkout_security_badges_custom_url: string | null;
  logoWidth?: number;
  showReviews?: boolean;
  customFooterImage?: string | null;
  customFooterImages?: string[];
  shipping_options: ShippingOption[];
  order_bumps: OrderBump[];
}

interface BumpProduct {
  id: string;
  name: string;
  price_sale: number;
  image_url: string | null;
}

export default function PublicCheckout() {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  
  const isCheckoutDomain = currentDomainIsCheckout();
  const slug = isCheckoutDomain 
    ? getCheckoutSlugFromPath() || urlSlug 
    : urlSlug;

  const [product, setProduct] = useState<Product | null>(null);
  const [bumpProducts, setBumpProducts] = useState<BumpProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [showCardError, setShowCardError] = useState(false);
  const [showPixSuccess, setShowPixSuccess] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  const [selectedShipping, setSelectedShipping] = useState<number>(0);
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
  });

  const { captureLead } = useLeads();

  // Load product data
    useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        if (isCheckoutDomain) {
          const { data, error: fetchError } = await supabase
            .from("products")
            .select("*")
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            console.error("Error fetching product:", fetchError);
            setError("Erro ao carregar produto");
            setLoading(false);
            return;
          }

          if (!data) {
            setError("Nenhum produto ativo encontrado");
            setLoading(false);
            return;
          }

          processProductData(data);
          return;
        }

        setError("Produto não encontrado");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching product:", fetchError);
        setError("Erro ao carregar produto");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Produto não encontrado ou inativo");
        setLoading(false);
        return;
      }

      processProductData(data);
    };

    const processProductData = async (data: any) => {
      const shippingOptions: ShippingOption[] = Array.isArray(data.shipping_options)
        ? (data.shipping_options as unknown as ShippingOption[])
        : [];
      const orderBumps: OrderBump[] = Array.isArray(data.order_bumps)
        ? (data.order_bumps as unknown as OrderBump[])
        : [];
      const reviews: CustomerReview[] = Array.isArray(data.checkout_reviews)
        ? (data.checkout_reviews as unknown as CustomerReview[])
        : [];

      setProduct({
        ...data,
        shipping_options: shippingOptions,
        order_bumps: orderBumps,
        checkout_reviews: reviews,
        checkout_footer_text: data.checkout_footer_text || null,
        checkout_urgency_bar_bg_color: data.checkout_urgency_bar_bg_color || data.checkout_timer_bg_color || data.checkout_color || "#CC0854",
        checkout_show_timer_countdown: data.checkout_show_timer_countdown ?? true,
        checkout_social_proof_min: data.checkout_social_proof_min || 20,
        checkout_social_proof_max: data.checkout_social_proof_max || 50,
        checkout_order_bump_headline: data.checkout_order_bump_headline || "Leve também...",
        checkout_order_bump_color: data.checkout_order_bump_color || data.checkout_color || "#10B981",
        checkout_security_badges_type: data.checkout_security_badges_type || "default",
        checkout_security_badges_custom_url: data.checkout_security_badges_custom_url || null,
        logoWidth: data.logoWidth || defaultConfig.logoWidth,
        showReviews: data.showReviews ?? defaultConfig.showReviews,
        customFooterImage: data.customFooterImage || null,
        customFooterImages: data.customFooterImages || [],
      });

      if (orderBumps.length > 0) {
        const bumpIds = orderBumps.map((b) => b.product_id).filter(Boolean);
        if (bumpIds.length > 0) {
          const { data: bumps } = await supabase
            .from("products")
            .select("id, name, price_sale, image_url")
            .in("id", bumpIds);
          setBumpProducts(bumps || []);
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [slug, isCheckoutDomain]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!product) return { subtotal: 0, shipping: 0, bumps: 0, total: 0 };

    const subtotal = product.price_sale;
    const shippingPrice =
      product.shipping_options.length > 0
        ? product.shipping_options[selectedShipping]?.price || 0
        : 0;

    let bumpsTotal = 0;
    selectedBumps.forEach((bumpProductId) => {
      const bumpConfig = product.order_bumps.find(
        (b) => b.product_id === bumpProductId
      );
      const bumpProduct = bumpProducts.find((p) => p.id === bumpProductId);
      if (bumpProduct && bumpConfig) {
        const discountedPrice =
          bumpProduct.price_sale * (1 - bumpConfig.discount_percent / 100);
        bumpsTotal += discountedPrice;
      }
    });

    return {
      subtotal,
      shipping: shippingPrice,
      bumps: bumpsTotal,
      total: subtotal + shippingPrice + bumpsTotal,
    };
  }, [product, selectedShipping, selectedBumps, bumpProducts]);

  // Prova Social
  const socialProofCount = useMemo(() => {
    if (!product) return 23;
    const min = product.checkout_social_proof_min || 20;
    const max = product.checkout_social_proof_max || 50;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [product?.checkout_social_proof_max, product?.checkout_social_proof_min]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleLeadCapture = async () => {
    if (formData.name && formData.whatsapp && !leadCaptured && product) {
      const success = await captureLead({
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email,
        step_abandoned: currentStep,
        product_id: product.id,
      });
      if (success) {
        setLeadCaptured(true);
      }
    }
  };

  const handleContinueToStep2 = async () => {
    await handleLeadCapture();
    setCurrentStep(2);
  };

  const handleCepLookup = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch (error) {
      console.error("CEP lookup failed:", error);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === "card") {
      setShowCardError(true);
      return;
    }

    if (!product) return;

    setProcessingPayment(true);

    try {
      // 1. Processar pagamento via Payment Engine (Duttyfy)
      // A Edge Function agora cria a transação no banco
      const paymentResponse = await PaymentEngine.process({
        amount: Math.round(totals.total * 100), // Enviar em centavos
        description: product.name,
        customer: {
          name: formData.name,
          document: formData.cpf.replace(/\D/g, ""),
          email: formData.email,
          phone: formData.whatsapp.replace(/\D/g, ""),
        },
        item: {
          title: product.name,
          price: Math.round(totals.total * 100),
          quantity: 1,
        },
        utm: "", // Pode ser capturado da URL se necessário
        productId: product.id,
      });

      // 2. Sucesso
      if (paymentResponse.pixCode) {
        setPixCode(paymentResponse.pixCode);
        setShowPixSuccess(true);
        
        if (paymentResponse.internalTransactionId) {
           console.log("Transação interna criada:", paymentResponse.internalTransactionId);
        }
      } else {
         throw new Error("Código PIX não gerado pelo gateway.");
      }

    } catch (error) {
      console.error("Payment error:", error);
      const errorMsg = error instanceof Error ? error.message : "Erro ao gerar PIX";
      toast.error(errorMsg);
    } finally {
      setProcessingPayment(false);
    }
  };

  const copyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setPixCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const toggleBump = (productId: string) => {
    setSelectedBumps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Build CheckoutConfig from product
  const checkoutSettings: CheckoutConfig = useMemo(() => {
    if (!product) return defaultConfig;

    return {
      checkout_color: product.checkout_color || defaultConfig.checkout_color,
      checkout_bg_color: product.checkout_bg_color || defaultConfig.checkout_bg_color,
      checkout_banner_url: product.checkout_banner_url || null,
      checkout_logo_url: product.checkout_logo_url || null,
      logoWidth: product.logoWidth || defaultConfig.logoWidth,
      checkout_urgency_text: product.checkout_urgency_text || defaultConfig.checkout_urgency_text,
      checkout_timer_minutes: product.checkout_timer_minutes || defaultConfig.checkout_timer_minutes,
      checkout_timer_bg_color: product.checkout_timer_bg_color || defaultConfig.checkout_timer_bg_color,
      checkout_timer_text_color: product.checkout_timer_text_color || defaultConfig.checkout_timer_text_color,
      checkout_urgency_bar_bg_color: product.checkout_urgency_bar_bg_color || defaultConfig.checkout_urgency_bar_bg_color,
      checkout_show_timer_countdown: product.checkout_show_timer_countdown ?? defaultConfig.checkout_show_timer_countdown,
      checkout_template: product.checkout_template || defaultConfig.checkout_template,
      checkout_show_timer: product.checkout_show_timer ?? defaultConfig.checkout_show_timer,
      checkout_show_security_badges: product.checkout_show_security_badges ?? defaultConfig.checkout_show_security_badges,
      checkout_show_social_proof: product.checkout_show_social_proof ?? defaultConfig.checkout_show_social_proof,
      checkout_social_proof_count: product.checkout_social_proof_count || defaultConfig.checkout_social_proof_count,
      checkout_social_proof_min: product.checkout_social_proof_min || defaultConfig.checkout_social_proof_min,
      checkout_social_proof_max: product.checkout_social_proof_max || defaultConfig.checkout_social_proof_max,
      checkout_order_bump_headline: product.checkout_order_bump_headline || defaultConfig.checkout_order_bump_headline,
      checkout_order_bump_color: product.checkout_order_bump_color || defaultConfig.checkout_order_bump_color,
      checkout_reviews: product.checkout_reviews || [],
      showReviews: product.showReviews ?? defaultConfig.showReviews,
      checkout_footer_text: product.checkout_footer_text || defaultConfig.checkout_footer_text,
      customFooterImage: product.customFooterImage || null,
      customFooterImages: product.customFooterImages || [],
      checkout_font_family: defaultConfig.checkout_font_family,
      checkout_border_radius: defaultConfig.checkout_border_radius,
      checkout_security_badges_type: product.checkout_security_badges_type || defaultConfig.checkout_security_badges_type,
      checkout_security_badges_custom_url: product.checkout_security_badges_custom_url || null,
      shipping_options: product.shipping_options || [],
    };
  }, [product]);

  const primaryColor = checkoutSettings.checkout_color;
  const actionColor = "#10B981";
  const orderBumpColor = checkoutSettings.checkout_order_bump_color;
  const orderBumpHeadline = checkoutSettings.checkout_order_bump_headline;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Ops!</h1>
        <p className="text-gray-500">{error || "Produto não encontrado"}</p>
      </div>
    );
  }

  return (
    <>
      <CheckoutTemplate
        config={checkoutSettings}
        product={product}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        formData={formData}
        setFormData={setFormData}
        selectedShipping={selectedShipping}
        setSelectedShipping={setSelectedShipping}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        selectedBumps={selectedBumps}
        toggleBump={toggleBump}
        shippingOptions={product.shipping_options}
        orderBumps={product.order_bumps}
        bumpProducts={bumpProducts}
        totals={totals}
        formatPrice={formatPrice}
        onContinueToStep2={handleContinueToStep2}
        onCepLookup={handleCepLookup}
        onPayment={handlePayment}
        processingPayment={processingPayment}
        showSocialProof={checkoutSettings.checkout_show_social_proof}
        socialProofCount={socialProofCount}
      >
        <CheckoutForm
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          formData={formData}
          setFormData={setFormData}
          selectedShipping={selectedShipping}
          setSelectedShipping={setSelectedShipping}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          selectedBumps={selectedBumps}
          toggleBump={toggleBump}
          shippingOptions={product.shipping_options}
          orderBumps={product.order_bumps}
          bumpProducts={bumpProducts}
          primaryColor={primaryColor}
          actionColor={actionColor}
          orderBumpColor={orderBumpColor}
          orderBumpHeadline={orderBumpHeadline}
          showSocialProof={checkoutSettings.checkout_show_social_proof}
          socialProofCount={socialProofCount}
          socialProofMin={checkoutSettings.checkout_social_proof_min}
          socialProofMax={checkoutSettings.checkout_social_proof_max}
          reviews={product.checkout_reviews || []}
          showReviews={product.showReviews ?? true}
          footerText={product.checkout_footer_text || undefined}
          customFooterImage={product.customFooterImage || undefined}
          onContinueToStep2={handleContinueToStep2}
          onCepLookup={handleCepLookup}
          onPayment={handlePayment}
          processingPayment={processingPayment}
          formatPrice={formatPrice}
        />
      </CheckoutTemplate>

      {/* Card Error Dialog */}
      <Dialog open={showCardError} onOpenChange={setShowCardError}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl text-gray-900">Transação não autorizada</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              A operadora do seu cartão não autorizou esta transação para o valor promocional.
              <br />
              <br />
              <strong className="text-gray-900">Tente via PIX para aprovação imediata.</strong>
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setShowCardError(false);
              setPaymentMethod("pix");
            }}
            className="w-full mt-4 py-4 rounded-2xl text-white font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: actionColor }}
          >
            <QrCode className="w-5 h-5" />
            Tentar com PIX
          </button>
        </DialogContent>
      </Dialog>

      {/* PIX Success Dialog */}
      <Dialog open={showPixSuccess} onOpenChange={setShowPixSuccess}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200">
          <DialogHeader className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${actionColor}20` }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: actionColor }} />
            </div>
            <DialogTitle className="text-xl text-gray-900">PIX Gerado com Sucesso!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Copie o código abaixo e cole no app do seu banco para pagar
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 bg-gray-100 rounded-xl">
            <p className="text-xs text-gray-500 mb-2 text-center">Código PIX Copia e Cola</p>
            <p className="text-sm font-mono text-gray-800 break-all text-center">
              {pixCode?.substring(0, 60)}...
            </p>
          </div>

          <button
            onClick={copyPixCode}
            className="w-full mt-4 py-4 rounded-2xl text-white font-bold transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: actionColor }}
          >
            {pixCopied ? (
              <>
                <Check className="w-5 h-5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar Código PIX
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-3">
            Após o pagamento, você receberá a confirmação por WhatsApp e e-mail.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

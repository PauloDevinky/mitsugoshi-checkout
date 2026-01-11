import { useState } from "react";
import { Lock, ShoppingBag, ChevronDown, ChevronUp, QrCode, CreditCard, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CheckoutTemplateBProps {
  onCaptureLead?: (data: { name: string; whatsapp: string; email?: string }) => void;
}

export function CheckoutTemplateB({ onCaptureLead }: CheckoutTemplateBProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [showCardError, setShowCardError] = useState(false);
  const [showPixSuccess, setShowPixSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const handleInputBlur = () => {
    if (formData.name && formData.whatsapp && onCaptureLead) {
      onCaptureLead({
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email,
      });
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "card") {
      setShowCardError(true);
    } else {
      setShowPixSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 py-6">
        <div className="max-w-md mx-auto px-6 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <span className="text-white text-lg font-bold">N</span>
          </div>
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-10">
        {/* Order Summary - Collapsed by default */}
        <Accordion type="single" collapsible className="mb-8">
          <AccordionItem value="summary" className="border border-gray-200 rounded-2xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3 text-left">
                <ShoppingBag className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Resumo do Pedido</p>
                  <p className="text-xs text-gray-500">1 item • R$ 197,00</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop" 
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Kit Premium Emagrecimento</p>
                  <p className="text-sm text-gray-400 line-through">R$ 297,00</p>
                  <p className="text-lg font-bold text-gray-900">R$ 197,00</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Minimal Form */}
        <div className="space-y-5 mb-8">
          <input
            type="text"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={handleInputBlur}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-[15px]"
          />
          <input
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-[15px]"
          />
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            onBlur={handleInputBlur}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-[15px]"
          />
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setPaymentMethod("pix")}
            className={cn(
              "flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all",
              paymentMethod === "pix" 
                ? "border-gray-900 bg-gray-900 text-white" 
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            <QrCode className="w-7 h-7" />
            <span className="font-semibold">Pix</span>
            <span className={cn(
              "text-xs",
              paymentMethod === "pix" ? "text-gray-300" : "text-gray-400"
            )}>Aprovação imediata</span>
          </button>
          <button
            onClick={() => setPaymentMethod("card")}
            className={cn(
              "flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all",
              paymentMethod === "card" 
                ? "border-gray-900 bg-gray-900 text-white" 
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            <CreditCard className="w-7 h-7" />
            <span className="font-semibold">Cartão</span>
            <span className={cn(
              "text-xs",
              paymentMethod === "card" ? "text-gray-300" : "text-gray-400"
            )}>Até 12x</span>
          </button>
        </div>

        {/* Card Form (visual only - will trigger error) */}
        {paymentMethod === "card" && (
          <div className="space-y-4 mb-6 animate-fade-in">
            <input
              type="text"
              placeholder="Número do cartão"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-[15px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/AA"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-[15px]"
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-[15px]"
              />
            </div>
            <input
              type="text"
              placeholder="Nome no cartão"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-[15px]"
            />
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          className={cn(
            "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3",
            paymentMethod === "pix"
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-900 text-white hover:bg-gray-800"
          )}
        >
          {paymentMethod === "pix" ? (
            <>
              <QrCode className="w-5 h-5" />
              GERAR PIX • R$ 197,00
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              PAGAR • R$ 197,00
            </>
          )}
        </button>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Pagamento 100% seguro</span>
        </div>
      </main>

      {/* Card Error Dialog */}
      <Dialog open={showCardError} onOpenChange={setShowCardError}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl text-gray-900">Transação não autorizada</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              A operadora do seu cartão não autorizou esta transação para o valor promocional.
              <br /><br />
              <strong className="text-gray-900">Tente via PIX para aprovação imediata.</strong>
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setShowCardError(false);
              setPaymentMethod("pix");
            }}
            className="w-full mt-4 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            PAGAR COM PIX
          </button>
        </DialogContent>
      </Dialog>

      {/* Pix Success Dialog */}
      <Dialog open={showPixSuccess} onOpenChange={setShowPixSuccess}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-xl text-gray-900">Pix Gerado com Sucesso!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Escaneie o QR Code abaixo ou copie o código Pix
            </DialogDescription>
          </DialogHeader>
          
          {/* Mock QR Code */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 mt-4">
            <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                <QrCode className="w-20 h-20 text-gray-500" />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">Código Pix válido por 30 minutos</p>
          </div>

          <button
            className="w-full mt-4 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
          >
            COPIAR CÓDIGO PIX
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

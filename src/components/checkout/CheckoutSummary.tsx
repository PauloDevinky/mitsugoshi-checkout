import { motion } from "framer-motion";
import { ShoppingBag, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShippingOption {
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price_original: number;
  price_sale: number;
  image_url: string | null;
  checkout_logo_url: string | null;
  checkout_color: string | null;
  shipping_options: ShippingOption[];
}

interface CheckoutSummaryProps {
  product: Product;
  selectedShipping: number;
  totals: {
    subtotal: number;
    shipping: number;
    bumps: number;
    total: number;
  };
  formatPrice: (value: number) => string;
  isMobile?: boolean;
}

export function CheckoutSummary({
  product,
  selectedShipping,
  totals,
  formatPrice,
  isMobile = false,
}: CheckoutSummaryProps) {
  const primaryColor = product.checkout_color || "#CC0854";

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Product Image & Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
              {product.price_original > product.price_sale && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 whitespace-nowrap">
                  OFERTA
                </span>
              )}
            </div>
            {product.price_original > product.price_sale && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(product.price_original)}
              </p>
            )}
            <p className="text-lg font-bold mt-1" style={{ color: primaryColor }}>
              {formatPrice(product.price_sale)}
            </p>
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900 font-medium">{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.shipping > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Frete</span>
              <span className="text-gray-900 font-medium">{formatPrice(totals.shipping)}</span>
            </div>
          )}
          {totals.shipping === 0 && product.shipping_options.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Frete</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                FRETE GRÁTIS
              </span>
            </div>
          )}
          {totals.bumps > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Adicionais</span>
              <span className="text-gray-900 font-medium">{formatPrice(totals.bumps)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200 mt-2">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(totals.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Lock className="w-4 h-4" />
            <span className="text-xs">Compra Segura</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Dados Protegidos</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen sticky top-0 overflow-y-auto bg-[#F5F5F5] border-r border-gray-200">
      <div className="p-8 space-y-8">
        {/* Logo */}
        {product.checkout_logo_url && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={product.checkout_logo_url}
              alt="Logo"
              className="h-10 object-contain"
            />
          </motion.div>
        )}

        {/* Product Image & Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="w-full aspect-square rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="text-xl font-bold text-gray-900 flex-1">{product.name}</h2>
              {product.price_original > product.price_sale && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 whitespace-nowrap">
                  OFERTA
                </span>
              )}
            </div>
            {product.price_original > product.price_sale && (
              <p className="text-sm text-gray-400 line-through mt-1">
                {formatPrice(product.price_original)}
              </p>
            )}
            <p className="text-3xl font-bold mt-2" style={{ color: primaryColor }}>
              {formatPrice(product.price_sale)}
            </p>
          </div>
        </motion.div>

        {/* Totals */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900 font-medium">{formatPrice(totals.subtotal)}</span>
            </div>
            {totals.shipping > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className="text-gray-900 font-medium">{formatPrice(totals.shipping)}</span>
              </div>
            )}
            {totals.shipping === 0 && product.shipping_options.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frete</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                  FRETE GRÁTIS
                </span>
              </div>
            )}
            {totals.bumps > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Adicionais</span>
                <span className="text-gray-900 font-medium">{formatPrice(totals.bumps)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 mt-3">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center justify-center gap-8 pt-4"
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Compra Segura</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Dados Protegidos</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

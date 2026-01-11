import { cn } from "@/lib/utils";

interface OrderBump {
  product_id: string;
  discount_percent: number;
  title?: string;
  description?: string;
}

interface BumpProduct {
  id: string;
  name: string;
  price_sale: number;
  image_url: string | null;
}

interface OrderBumpsProps {
  orderBumps: OrderBump[];
  bumpProducts: BumpProduct[];
  selectedBumps: Set<string>;
  onToggleBump: (productId: string) => void;
  formatPrice: (value: number) => string;
}

export function OrderBumpsSection({
  orderBumps,
  bumpProducts,
  selectedBumps,
  onToggleBump,
  formatPrice,
}: OrderBumpsProps) {
  if (bumpProducts.length === 0) return null;

  return (
    <div className="space-y-3">
      {bumpProducts.map((bumpProduct) => {
        const bumpConfig = orderBumps.find(
          (b) => b.product_id === bumpProduct.id
        );
        if (!bumpConfig) return null;

        const discountedPrice =
          bumpProduct.price_sale * (1 - bumpConfig.discount_percent / 100);

        return (
          <div
            key={bumpProduct.id}
            className="p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50"
          >
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBumps.has(bumpProduct.id)}
                onChange={() => onToggleBump(bumpProduct.id)}
                className="mt-1 w-4 h-4 rounded"
                style={{ accentColor: "#F59E0B" }}
              />
              {bumpProduct.image_url && (
                <img
                  src={bumpProduct.image_url}
                  alt={bumpProduct.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                    {bumpConfig.title || "Oferta Especial"}
                  </span>
                </div>
                <p className="font-semibold text-gray-900">+ {bumpProduct.name}</p>
                {bumpConfig.description && (
                  <p className="text-xs text-gray-500 mt-1">{bumpConfig.description}</p>
                )}
                <p className="mt-2">
                  {bumpConfig.discount_percent > 0 && (
                    <span className="text-sm text-gray-400 line-through mr-2">
                      {formatPrice(bumpProduct.price_sale)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-amber-600">
                    {formatPrice(discountedPrice)}
                  </span>
                </p>
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
}

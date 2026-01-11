import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface ShippingOption {
  name: string;
  price: number;
}

export interface OrderBump {
  product_id: string;
  discount_percent: number;
  title?: string;
  description?: string;
}

export interface CustomerReview {
  name: string;
  photo_url: string;
  text: string;
  rating: number;
}

export interface SecurityBadge {
  label: string;
  icon_url: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price_original: number;
  price_sale: number;
  image_url: string | null;
  status: string;
  tiktok_pixel_id: string | null;
  tiktok_access_token: string | null;
  checkout_color: string;
  checkout_template: string;
  shipping_options: ShippingOption[];
  order_bumps: OrderBump[];
  is_subscription: boolean;
  subscription_interval: string;
  checkout_urgency_text: string | null;
  checkout_timer_minutes: number | null;
  checkout_banner_url: string | null;
  checkout_logo_url: string | null;
  checkout_bg_color: string;
  checkout_timer_bg_color: string;
  checkout_timer_text_color: string;
  checkout_show_timer: boolean;
  checkout_show_security_badges: boolean;
  checkout_show_social_proof: boolean;
  checkout_social_proof_count: number;
  checkout_reviews: CustomerReview[];
  checkout_security_badges: SecurityBadge[];
  checkout_footer_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  price_original: number;
  price_sale: number;
  image_url: string | null;
  status: string;
  tiktok_pixel_id: string | null;
  tiktok_access_token: string | null;
  checkout_color: string;
  checkout_template: string;
  shipping_options: ShippingOption[];
  order_bumps: OrderBump[];
  is_subscription: boolean;
  subscription_interval: string;
  checkout_urgency_text: string | null;
  checkout_timer_minutes: number | null;
}

const parseShippingOptions = (data: Json | null): ShippingOption[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => {
    if (typeof item === 'object' && item !== null && 'name' in item && 'price' in item) {
      return {
        name: String(item.name || ''),
        price: Number(item.price || 0)
      };
    }
    return { name: '', price: 0 };
  });
};

const parseOrderBumps = (data: Json | null): OrderBump[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => {
    if (typeof item === 'object' && item !== null && 'product_id' in item) {
      const obj = item as Record<string, unknown>;
      return {
        product_id: String(obj.product_id || ''),
        discount_percent: Number(obj.discount_percent || 0),
        title: obj.title ? String(obj.title) : undefined,
        description: obj.description ? String(obj.description) : undefined
      };
    }
    return { product_id: '', discount_percent: 0 };
  });
};

const parseReviews = (data: Json | null): CustomerReview[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        name: String(obj.name || ''),
        photo_url: String(obj.photo_url || ''),
        text: String(obj.text || ''),
        rating: Number(obj.rating || 5)
      };
    }
    return { name: '', photo_url: '', text: '', rating: 5 };
  });
};

const parseSecurityBadges = (data: Json | null): SecurityBadge[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        label: String(obj.label || ''),
        icon_url: String(obj.icon_url || '')
      };
    }
    return { label: '', icon_url: '' };
  });
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } else {
      const parsedProducts = (data || []).map(p => {
        try {
          return {
            ...p,
            id: p.id || '',
            name: p.name || 'Sem nome',
            slug: p.slug || '',
            price_original: (p.price_original !== null && p.price_original !== undefined) ? Number(p.price_original) : 0,
            price_sale: (p.price_sale !== null && p.price_sale !== undefined) ? Number(p.price_sale) : 0,
            checkout_color: p.checkout_color || "#22C55E",
            checkout_template: p.checkout_template || "template-a",
            shipping_options: parseShippingOptions(p.shipping_options),
            order_bumps: parseOrderBumps(p.order_bumps),
            is_subscription: p.is_subscription || false,
            subscription_interval: p.subscription_interval || "monthly",
            checkout_urgency_text: p.checkout_urgency_text,
            checkout_timer_minutes: p.checkout_timer_minutes,
            checkout_banner_url: (p as any).checkout_banner_url || null,
            checkout_logo_url: (p as any).checkout_logo_url || null,
            checkout_bg_color: (p as any).checkout_bg_color || "#ffffff",
            checkout_timer_bg_color: (p as any).checkout_timer_bg_color || "#22C55E",
            checkout_timer_text_color: (p as any).checkout_timer_text_color || "#ffffff",
            checkout_show_timer: (p as any).checkout_show_timer ?? true,
            checkout_show_security_badges: (p as any).checkout_show_security_badges ?? true,
            checkout_show_social_proof: (p as any).checkout_show_social_proof ?? true,
            checkout_social_proof_count: (p as any).checkout_social_proof_count || 23,
            checkout_reviews: parseReviews((p as any).checkout_reviews),
            checkout_security_badges: parseSecurityBadges((p as any).checkout_security_badges),
            checkout_footer_text: (p as any).checkout_footer_text || null,
            status: p.status || 'active',
            image_url: p.image_url || null,
            tiktok_pixel_id: p.tiktok_pixel_id || null,
            tiktok_access_token: p.tiktok_access_token || null,
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at || new Date().toISOString(),
          };
        } catch (err) {
          console.error("Error parsing product:", err, p);
          return null;
        }
      }).filter((p): p is Product => p !== null);
      setProducts(parsedProducts);
    }
    setLoading(false);
  };

  const createProduct = async (formData: ProductFormData) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          slug: formData.slug,
          price_original: formData.price_original || 0,
          price_sale: formData.price_sale || 0,
          image_url: formData.image_url,
          status: formData.status,
          tiktok_pixel_id: formData.tiktok_pixel_id || null,
          tiktok_access_token: formData.tiktok_access_token || null,
          checkout_color: formData.checkout_color,
          checkout_template: formData.checkout_template,
          shipping_options: formData.shipping_options as unknown as Json,
          order_bumps: formData.order_bumps as unknown as Json,
          is_subscription: formData.is_subscription,
          subscription_interval: formData.subscription_interval,
          checkout_urgency_text: formData.checkout_urgency_text,
          checkout_timer_minutes: formData.checkout_timer_minutes,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        toast.error(`Erro ao criar produto: ${error.message || 'Erro desconhecido'}`);
        return null;
      }

      toast.success("Produto criado com sucesso!");
      await fetchProducts();
      return data;
    } catch (err: any) {
      console.error("Unexpected error creating product:", err);
      toast.error(`Erro inesperado: ${err.message || 'Erro desconhecido'}`);
      return null;
    }
  };

  const updateProduct = async (id: string, formData: Partial<ProductFormData>) => {
    const updateData: Record<string, unknown> = { ...formData };
    
    if (formData.shipping_options !== undefined) {
      updateData.shipping_options = formData.shipping_options as unknown as Json;
    }
    if (formData.order_bumps !== undefined) {
      updateData.order_bumps = formData.order_bumps as unknown as Json;
    }

    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto");
      return false;
    }

    toast.success("Produto atualizado!");
    await fetchProducts();
    return true;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
      return false;
    }

    toast.success("Produto excluído!");
    await fetchProducts();
    return true;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  event: "sale.approved" | "sale.pending" | "sale.refused" | "sale.refunded";
  transaction_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_whatsapp: string | null;
  product_name: string;
  amount: number;
  payment_method: string;
  utm_source: string | null;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhook_url, payload } = await req.json() as { 
      webhook_url: string; 
      payload: WebhookPayload;
    };

    if (!webhook_url) {
      return new Response(
        JSON.stringify({ error: "webhook_url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[WEBHOOK] Dispatching to: ${webhook_url}`);
    console.log(`[WEBHOOK] Event: ${payload.event}`);
    console.log(`[WEBHOOK] Transaction: ${payload.transaction_id}`);

    // Actually dispatch the webhook
    try {
      const response = await fetch(webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Event": payload.event,
          "X-Webhook-Source": "nexus-checkout",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(`[WEBHOOK] Response status: ${response.status}`);
      console.log(`[WEBHOOK] Response: ${responseText.substring(0, 200)}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: response.status,
          message: "Webhook dispatched successfully",
          payload 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (fetchError) {
      console.error(`[WEBHOOK] Fetch error:`, fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to reach webhook URL",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error"
        }),
        { 
          status: 200, // Return 200 even on delivery failure so we don't break the transaction flow
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error) {
    console.error("[WEBHOOK] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

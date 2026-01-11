import { supabase } from "@/integrations/supabase/client";

export interface LeadData {
  name: string;
  whatsapp: string;
  email?: string;
  product_id?: string;
  step_abandoned?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export function useLeads() {
  const captureLead = async (data: LeadData) => {
    try {
      const { error } = await supabase
        .from("leads")
        .insert({
          name: data.name,
          whatsapp: data.whatsapp,
          email: data.email || null,
          product_id: data.product_id || null,
          step_abandoned: data.step_abandoned || 1,
          utm_source: data.utm_source || null,
          utm_medium: data.utm_medium || null,
          utm_campaign: data.utm_campaign || null,
          utm_content: data.utm_content || null,
          utm_term: data.utm_term || null,
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error("Error capturing lead:", error);
        return false;
      }

      console.log("Lead captured successfully:", data.name);
      return true;
    } catch (err) {
      console.error("Error capturing lead:", err);
      return false;
    }
  };

  const updateLeadStep = async (whatsapp: string, step: number) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ step_abandoned: step })
        .eq("whatsapp", whatsapp)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error updating lead step:", error);
      }
    } catch (err) {
      console.error("Error updating lead step:", err);
    }
  };

  return {
    captureLead,
    updateLeadStep,
  };
}

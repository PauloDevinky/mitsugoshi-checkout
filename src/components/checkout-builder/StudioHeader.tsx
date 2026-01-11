import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import type { DeviceMode } from "@/pages/CheckoutBuilderPage";

interface StudioHeaderProps {
  productName?: string;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  onSave: () => void;
  onViewLive: () => void;
  onBack: () => void;
  saving: boolean;
  hasProduct: boolean;
}

export function StudioHeader({
  productName,
  onSave,
  onBack,
  saving,
  hasProduct,
}: StudioHeaderProps) {

  return (
    <motion.header 
      className="h-[64px] bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left - Back & Title */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        
        <div className="w-px h-5 bg-white/10" />
            <h1 className="text-sm font-semibold text-zinc-100">Checkout Builder</h1>
        
        {productName && (
          <>
            <div className="w-px h-5 bg-white/10" />
            <span className="text-xs text-zinc-400 truncate max-w-[180px]">
              {productName}
            </span>
          </>
        )}
      </div>

      {/* Right - Save Button (Verde Neon) */}
      <div className="flex items-center gap-2">
        {hasProduct && (
          <motion.button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#10B981]/20"
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Salvando..." : "Salvar Alterações"}</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
}

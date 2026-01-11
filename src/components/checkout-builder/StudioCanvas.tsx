import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone } from "lucide-react";
import { CheckoutLivePreview } from "@/components/checkout/CheckoutLivePreview";
import { cn } from "@/lib/utils";
import type { CheckoutConfig, DeviceMode } from "@/pages/CheckoutBuilderPage";
import type { Product } from "@/hooks/useProducts";

interface StudioCanvasProps {
  config: CheckoutConfig;
  product?: Product;
  deviceMode: DeviceMode;
  onDeviceModeChange?: (mode: DeviceMode) => void;
}

type ZoomLevel = 50 | 75 | 100;

export function StudioCanvas({ config, product, deviceMode, onDeviceModeChange }: StudioCanvasProps) {
  const [zoom, setZoom] = useState<ZoomLevel>(100);

  const zoomScale = zoom / 100;
  const isMobile = deviceMode === "mobile";

  // iPhone dimensions
  const phoneWidth = 375;
  const phoneHeight = 812;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Controles acima do canvas */}
      <motion.div 
          className="absolute top-4 z-10 flex items-center gap-2 bg-[#0A0A0A]/90 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Device Toggle */}
          {onDeviceModeChange && (
            <>
              <button
                onClick={() => onDeviceModeChange("mobile")}
                className={cn(
                  "p-2 rounded transition-colors",
                  deviceMode === "mobile" 
                    ? "bg-[#10B981] text-white" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                )}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeviceModeChange("desktop")}
                className={cn(
                  "p-2 rounded transition-colors",
                  deviceMode === "desktop" 
                    ? "bg-[#10B981] text-white" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                )}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
            </>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(50)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                zoom === 50 
                  ? "bg-[#10B981] text-white" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
            >
              50%
            </button>
            <button
              onClick={() => setZoom(75)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                zoom === 75 
                  ? "bg-[#10B981] text-white" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
            >
              75%
            </button>
            <button
              onClick={() => setZoom(100)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                zoom === 100 
                  ? "bg-[#10B981] text-white" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
            >
              100%
            </button>
          </div>
        </motion.div>

      {/* Preview Container com iPhone simulado */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: "center center",
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: zoomScale, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
      >
        {/* iPhone Frame */}
        {isMobile && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              width: `${phoneWidth + 40}px`,
              height: `${phoneHeight + 80}px`,
              margin: "-20px -20px -40px -20px",
            }}
          >
            {/* Notch */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0A0A0A] rounded-b-2xl"
              style={{ boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.3)" }}
            />
            
            {/* Frame Border */}
            <div 
              className="absolute inset-0 rounded-[3rem] border-8 border-[#0A0A0A]"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.1),
                  0 25px 50px -12px rgba(0, 0, 0, 0.8),
                  inset 0 0 0 1px rgba(255,255,255,0.05)
                `
              }}
            />
          </div>
        )}

        {/* Preview Content */}
        <div 
          className={cn(
            "bg-white overflow-hidden relative",
            isMobile ? "rounded-[2.5rem]" : "rounded-xl"
          )}
          style={{
            width: isMobile ? `${phoneWidth}px` : "100%",
            height: isMobile ? `${phoneHeight}px` : "auto",
            maxHeight: isMobile ? `${phoneHeight}px` : "90vh",
            boxShadow: isMobile 
              ? undefined 
              : "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Scrollable Inner Container */}
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <CheckoutLivePreview config={config} product={product} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

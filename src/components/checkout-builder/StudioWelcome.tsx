import { motion } from "framer-motion";
import { Palette, Sparkles, Wand2 } from "lucide-react";

export function StudioWelcome() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-zinc-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: "#111",
      }}
    >
      <motion.div 
        className="text-center max-w-md px-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-500/20"
          animate={{
            boxShadow: [
              "0 25px 50px -12px rgba(236, 72, 153, 0.2)",
              "0 25px 50px -12px rgba(236, 72, 153, 0.4)",
              "0 25px 50px -12px rgba(236, 72, 153, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Wand2 className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-zinc-100 mb-3">
          Checkout Studio
        </h2>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Selecione um produto na barra lateral para começar a personalizar seu checkout de alta conversão.
        </p>

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-zinc-500">
            <Palette className="w-4 h-4" />
            <span>Cores</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <Sparkles className="w-4 h-4" />
            <span>Templates</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

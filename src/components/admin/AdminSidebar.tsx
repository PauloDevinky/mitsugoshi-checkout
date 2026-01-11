import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Settings,
  Webhook,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Package, label: "Produtos", path: "/products" },
  { icon: ShoppingCart, label: "Transações", path: "/transactions" },
  { icon: CreditCard, label: "Checkout Builder", path: "/checkout-builder" },
  { icon: RotateCcw, label: "Recuperação", path: "/recovery" },
  { icon: Webhook, label: "Webhooks", path: "/webhooks" },
  { icon: Zap, label: "Gateways", path: "/gateways" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

interface PlatformSettings {
  platform_name: string | null;
  platform_logo_url: string | null;
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("platform_name, platform_logo_url")
        .limit(1)
        .single();
      
      if (data) {
        setSettings(data);
      }
    };
    
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const platformName = settings?.platform_name || "NEXUS";
  const logoUrl = settings?.platform_logo_url;

  return (
    <motion.aside 
      className={cn(
        "h-screen glass-panel flex flex-col transition-all duration-300 relative z-10",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          {logoUrl ? (
            <motion.img 
              src={logoUrl} 
              alt={platformName}
              className="w-9 h-9 rounded-lg object-cover"
              whileHover={{ scale: 1.05 }}
            />
          ) : (
            <motion.div 
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          )}
          {!collapsed && (
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="font-semibold text-foreground text-[15px] tracking-tight">
                {platformName}
              </span>
              <span className="text-[11px] text-muted-foreground -mt-0.5">
                Checkout Platform
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                  collapsed && "justify-center px-0"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={cn(
                    "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                    isActive && "text-primary"
                  )} />
                </motion.div>
                {!collapsed && (
                  <span className="text-[13px] font-medium">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <motion.div 
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border space-y-1">
        {/* Theme Toggle */}
        <div
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "text-muted-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <motion.button 
              onClick={toggleTheme} 
              className="hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === "dark" ? (
                <Moon className="w-[18px] h-[18px]" />
              ) : (
                <Sun className="w-[18px] h-[18px]" />
              )}
            </motion.button>
          ) : (
            <>
              <Sun className="w-[18px] h-[18px]" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="w-[18px] h-[18px]" />
            </>
          )}
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "text-muted-foreground hover:text-red-400 hover:bg-red-500/10",
            collapsed && "justify-center px-0"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span className="text-[13px] font-medium">Sair</span>}
        </motion.button>

        {/* Collapse Toggle */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            collapsed && "justify-center px-0"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px]" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span className="text-[13px] font-medium">Recolher</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}

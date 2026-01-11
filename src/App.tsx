// Nexus Black - Checkout Platform
// Developed by Mitsugoshi Corporation
// © 2026 Mitsugoshi Corporation. All rights reserved.

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { currentDomainIsCheckout, currentDomainIsApp } from "@/config/domains";

// Admin Pages (Protected)
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import TransactionsPage from "./pages/TransactionsPage";
import RecoveryPage from "./pages/RecoveryPage";
import WebhooksPage from "./pages/WebhooksPage";
import SettingsPage from "./pages/SettingsPage";
import GatewaysPage from "./pages/GatewaysPage";
import CheckoutBuilderPage from "./pages/CheckoutBuilderPage";

// Public Pages
import PublicCheckout from "./pages/PublicCheckout";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Auth
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Easter Egg - Mitsugoshi Corp
  useEffect(() => {
    console.log(
      "%c MITSUGOSHI CORP %c \nWe lurk in the shadows to hunt the shadows.",
      "color: #7c3aed; font-weight: bold; font-size: 20px;",
      "color: #9ca3af; font-size: 12px;"
    );
  }, []);

  // If custom domain (checkout mode), render only the public checkout
  if (currentDomainIsCheckout()) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Custom domain: root path renders checkout, slug from path */}
              <Route path="/:slug" element={<PublicCheckout />} />
              <Route path="/" element={<PublicCheckout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Admin mode: full dashboard with protected routes
  // Also renders if currentDomainIsApp() or localhost fallback
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pay/:slug" element={<PublicCheckout />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recovery"
              element={
                <ProtectedRoute>
                  <RecoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/webhooks"
              element={
                <ProtectedRoute>
                  <WebhooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gateways"
              element={
                <ProtectedRoute>
                  <GatewaysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout-builder"
              element={
                <ProtectedRoute>
                  <CheckoutBuilderPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

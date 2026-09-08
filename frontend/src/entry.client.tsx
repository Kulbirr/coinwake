// Client entry for Capacitor / SPA mode
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { startInstance } from "./start";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

// Create router for client-side hydration
const router = createBrowserRouter({ routeTree });

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Start TanStack Start client
const start = startInstance;

// Hydrate the app
hydrateRoot(document, (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
));

// Export for HMR
if (import.meta.hot) {
  import.meta.hot.accept();
}
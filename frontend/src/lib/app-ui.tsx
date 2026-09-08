import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { AlarmOverlay } from "@/components/app/AlarmOverlay";
import { CoinSearchDialog } from "@/components/app/CoinSearchDialog";
import { CreateAlertDialog } from "@/components/app/CreateAlertDialog";
import type { Coin } from "@/lib/api";

interface AlertDialogRequest {
  coin?: Coin;
  defaultTargetPrice?: number;
}

interface AppUiValue {
  openAlertDialog: (req?: AlertDialogRequest) => void;
  openSearch: () => void;
}

const AppUiContext = createContext<AppUiValue | null>(null);

/**
 * Mounts the app-wide overlays (alarm takeover, alert creator, quick search)
 * once and exposes imperative openers so any card or button can raise them
 * without threading dialog state through the tree.
 */
export function AppUiProvider({ children }: { children: ReactNode }) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertReq, setAlertReq] = useState<AlertDialogRequest>({});
  const [searchOpen, setSearchOpen] = useState(false);

  const openAlertDialog = useCallback((req: AlertDialogRequest = {}) => {
    setAlertReq(req);
    setAlertOpen(true);
  }, []);

  const openSearch = useCallback(() => setSearchOpen(true), []);

  return (
    <AppUiContext.Provider value={{ openAlertDialog, openSearch }}>
      {children}
      <AlarmOverlay />
      <CreateAlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        coin={alertReq.coin}
        defaultTargetPrice={alertReq.defaultTargetPrice}
      />
      <CoinSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </AppUiContext.Provider>
  );
}

export function useAppUi() {
  const ctx = useContext(AppUiContext);
  if (!ctx) throw new Error("useAppUi must be used inside AppUiProvider");
  return ctx;
}

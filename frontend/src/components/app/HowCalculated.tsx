import { ChevronDown, Sigma } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Transparency panel — every derived number in the app can show its formula so
 * users never have to trust a black box.
 */
export function HowCalculated({
  rows,
  className,
}: {
  rows: Array<{ label: string; formula: string; result?: ReactNode }>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("rounded-xl border border-border bg-surface/40", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Sigma className="size-3.5" />
        How is this calculated?
        <ChevronDown className={cn("ml-auto size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <dl className="space-y-2.5 border-t border-border px-3.5 py-3">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-foreground">{row.label}</dt>
              <dd className="num text-xs text-muted-foreground">
                {row.formula}
                {row.result !== undefined && (
                  <>
                    {" = "}
                    <span className="text-foreground">{row.result}</span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

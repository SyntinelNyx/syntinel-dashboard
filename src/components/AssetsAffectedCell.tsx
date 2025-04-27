"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/Chip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Asset {
  hostname: string;
  assetUUID: string;
}

interface AssetsAffectedCellProps {
  assets: Asset[];
}

export function AssetsAffectedCell({ assets }: AssetsAffectedCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxVisible, setMaxVisible] = useState(assets.length);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      const availableWidth = container.clientWidth;
      let usedWidth = 0;
      let count = 0;

      for (const asset of assets) {
        const approxWidth = asset.hostname.length * 8 + 32;
        if (usedWidth + approxWidth < availableWidth) {
          usedWidth += approxWidth + 8;
          count++;
        } else {
          break;
        }
      }

      setMaxVisible(Math.max(1, count - 1));
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [assets]);

  const visibleAssets = assets.slice(0, maxVisible);
  const hiddenAssets = assets.slice(maxVisible);

  return (
    <>
      <div ref={containerRef} className="flex flex-wrap items-center gap-2 overflow-hidden">
        {visibleAssets.map((asset) => (
          <Chip
            key={asset.hostname}
            label={asset.hostname}
            onClick={() => router.push(`/dashboard/assets/view/${asset.assetUUID}`)}
            className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 hover:scale-105 cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-1"
          />
        ))}

        {hiddenAssets.length > 0 && (
          <Chip
            label={`+${hiddenAssets.length} more`}
            onClick={() => setOpen(true)}
            className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 hover:scale-105 cursor-pointer transition-all duration-150 ease-in-out flex items-center font-bold gap-1"
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assets Affected</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 mt-4">
            {assets.map((asset) => (
              <Chip
                key={asset.hostname}
                label={asset.hostname}
                onClick={() => router.push(`/dashboard/assets/view/${asset.assetUUID}`)}
                className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 hover:scale-105 cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-1"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


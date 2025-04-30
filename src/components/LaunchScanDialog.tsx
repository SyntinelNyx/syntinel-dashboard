import { useState, useEffect, useRef } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-fetch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import { RemovableBadge } from "@/components/DeleteBadge";

export type Flag = {
  label: string;
  inputType: "string" | "boolean" | "strings";
  required: boolean;
  value: string | boolean | string[];
};

export type ScannerFlags = {
  [scannerName: string]: {
    flags: Flag[];
  };
};

interface ScanParametersResponse {
  validScanners: string[];
  validAssets: string[];
  scannerFlags: ScannerFlags;
}

export function LaunchScanDialog() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const [scanners, setScanners] = useState<string[]>([]);
  const [assets, setAssets] = useState<string[]>([]);
  const [scannerFlags, setScannerFlags] = useState<ScannerFlags>({});

  const [selectedScanner, setSelectedScanner] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [flagStates, setFlagStates] = useState<Record<string, { enabled: boolean; value: string | boolean | string[] }>>({});
  const [inputBuffer, setInputBuffer] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPopover, setShowConfirmPopover] = useState(false);

  const [isDisabled, setIsDisabled] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    apiFetch("/scan/retrieve-scan-parameters", { method: "GET" })
      .then(res => res.json())
      .then((data: ScanParametersResponse) => {
        setScanners(data.validScanners);
        setAssets(data.validAssets);
        setScannerFlags(data.scannerFlags);
        setIsDisabled(false);
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to load scan parameters.";
        setIsDisabled(true);
        toast({ variant: "destructive", title: "Error", description: errorMessage });
      });
  }, [toast]);

  useEffect(() => {
    if (!selectedScanner || !scannerFlags[selectedScanner]) return;
    const initialStates = scannerFlags[selectedScanner].flags.reduce((acc, flag) => {
      acc[flag.label] = {
        enabled: false,
        value: flag.inputType === "boolean" ? false :
          flag.inputType === "strings" ? [] : ""
      };
      return acc;
    }, {} as Record<string, { enabled: boolean; value: string | boolean | string[] }>);
    setFlagStates(initialStates);
    setInputBuffer({});
  }, [selectedScanner, scannerFlags]);

  const handleNext = () => {
    if (step < 3) {
      setDirection("forward");
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step <= 1) return;
    setDirection("backward");
    setStep(prev => prev - 1);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setSelectedScanner(null);
    setSelectedAssets([]);
    setFlagStates({});
    setInputBuffer({});
    setStep(1);
  };

  const handleFlagToggle = (label: string, enabled: boolean | string) => {
    if (typeof enabled === "string") return;
    setFlagStates(prev => ({
      ...prev,
      [label]: {
        enabled,
        value: typeof prev[label].value === "boolean" ? enabled : prev[label].value,
      }
    }));
  };

  const handleFlagValueChange = (label: string, value: string | boolean | string[]) => {
    setFlagStates(prev => ({ ...prev, [label]: { ...prev[label], value } }));
  };

  const handleInputBufferChange = (label: string, value: string) => {
    setInputBuffer(prev => ({ ...prev, [label]: value }));
  };

  const addStringToFlagArray = (label: string) => {
    const newEntry = inputBuffer[label]?.trim();
    if (!newEntry) return;
    const current = flagStates[label]?.value as string[] || [];
    if (!current.includes(newEntry)) {
      handleFlagValueChange(label, [...current, newEntry]);
    }
    handleInputBufferChange(label, "");
  };

  const getValidationError = (): string | null => {
    if (step === 1) {
      if (!selectedScanner) return "Please select a scanner.";
      const flags = scannerFlags[selectedScanner]?.flags || [];
      for (const flag of flags) {
        const { enabled, value } = flagStates[flag.label] || {};
        if (flag.required && !enabled) return `Missing required flag: ${flag.label}`;
        if (enabled) {
          if (flag.inputType === "string" && (!value || (typeof value === "string" && value.trim() === "")))
            return `Empty value for flag: ${flag.label}`;
          if (flag.inputType === "strings" && (!value || (Array.isArray(value) && value.length === 0)))
            return `Empty list for flag: ${flag.label}`;
        }
      }
    }
    if (step === 2 && selectedAssets.length === 0) {
      return "Please select at least one asset.";
    }
    return null;
  };

  const launchScan = async () => {
    try {
      const flags = Object.entries(flagStates)
        .filter((entry) => entry[1].enabled)
        .map((entry) => {
          const label = entry[0];
          const { value } = entry[1];
          const scannerFlag = scannerFlags[selectedScanner!]?.flags.find(f => f.label === label);

          return {
            label,
            inputType: scannerFlag?.inputType || (Array.isArray(value) ? "strings" : typeof value === "boolean" ? "boolean" : "string"),
            required: scannerFlag?.required ?? false,
            value,
          };
        });

      toast({ title: "Scan Launched!", description: "Please wait..." });

      const response = await apiFetch("/scan/launch", {
        method: "POST",
        body: JSON.stringify({ scanner: selectedScanner, assets: selectedAssets, flags: flags }),
      });

      if (!response.ok) throw new Error("Failed to launch scan.");

      localStorage.setItem("scanSuccess", JSON.stringify({ title: "Scan Finished Successfully!", description: "Scan completed." }));
      resetDialog();
    } catch (error) {
      resetDialog();
      const errorMessage = error instanceof Error ? error.message : "Scan launch failed.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("scanSuccess");
    if (stored) {
      const { title, description } = JSON.parse(stored);
      toast({ title, description });
      localStorage.removeItem("scanSuccess");
    }
  }, [toast]);

  const renderFlags = () => {
    if (!selectedScanner || !scannerFlags[selectedScanner]) return null;
    return scannerFlags[selectedScanner].flags.map((flag) => {
      const { label, inputType, value: initialValue } = flag;
      const { enabled, value } = flagStates[label] || {};
      return (
        <div key={label} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Checkbox id={label} checked={enabled} onCheckedChange={(checked) => handleFlagToggle(label, checked)} />
            <label htmlFor={label}>
              {label}
              {flag.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>

          {enabled && inputType === "string" && (
            <Input
              value={value as string || ""}
              onChange={(e) => handleFlagValueChange(label, e.target.value)}
              placeholder={initialValue ? `Example: ${initialValue}` : `Enter ${label}`}
            />
          )}

          {enabled && inputType === "strings" && (
            <>
              <div className="flex flex-wrap gap-2">
                {(value as string[]).map((item, idx) => (
                  <RemovableBadge
                    key={idx}
                    label={item}
                    onRemove={() => handleFlagValueChange(label, (value as string[]).filter(val => val !== item))}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputBuffer[label] || ""}
                  onChange={(e) => handleInputBufferChange(label, e.target.value)}
                  placeholder={initialValue ? `Example: ${Array.isArray(initialValue) ? initialValue.join(", ") : initialValue}` : `Add ${label}`}
                />
                <Button onClick={() => addStringToFlagArray(label)}>Add</Button>
              </div>
            </>
          )}
        </div>
      );
    });
  };

  const renderAssets = () => (
    <div className="flex flex-wrap gap-4">
      {assets.map(asset => (
        <Badge
          key={asset}
          onClick={() => setSelectedAssets(prev => prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset])}
          className={
            `rounded-full cursor-pointer transition-all duration-200 ease-in-out ` +
            (selectedAssets.includes(asset)
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-300 scale-105 shadow-md'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-105')
          }
        >
          {asset}
        </Badge>
      ))}
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      <div className="border-b-2 border-b-gray-300 pb-2 mb-2">
        <h3 className="font-bold mb-1">Scanner</h3>
        <Badge className="rounded-full capitalize" variant="outline">{selectedScanner}</Badge>
      </div>
      <div className="border-b-2 border-b-gray-300 pb-2 mb-2">
        <h3 className="font-bold mb-1">Assets</h3>
        <div className="flex flex-wrap gap-2">{selectedAssets.map(asset => <Badge className="rounded-full" key={asset} variant="outline">{asset}</Badge>)}</div>
      </div>
      <div className="border-b-2 border-b-gray-300 pb-2 mb-2">
        <h3 className="font-bold mb-1">Flags</h3>
        {Object.entries(flagStates)
          .filter((entry) => entry[1].enabled)
          .map(([label, { value }]) => (
            <div key={label}>
              <span>{label}</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {Array.isArray(value)
                  ? value.map((v, idx) => <Badge className="rounded-full" variant="outline" key={idx}> {v} </Badge>)
                  : <Badge className="rounded-full" variant="outline"> {typeof value === "boolean" ? (value ? "True" : "False") : String(value)} </Badge>
                }
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const validationError = getValidationError();
  const isValid = validationError === null;

  if (isDisabled) { return <div className="p-4" />; }

  return (
    !isDisabled && (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}>Start New Scan</Button>
        </DialogTrigger>
        <DialogContent className="overflow-visible max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Configure Scan</DialogTitle>
            <DialogDescription>
              {step === 1
                ? "Select a scanner and set flags."
                : step === 2
                  ? "Choose assets."
                  : "Review and launch the scan."}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: (dir) => ({
                  x: dir === "forward" ? -20 : 20,
                  opacity: 0,
                }),
                animate: { x: 0, opacity: 1 },
                exit: (dir) => ({
                  x: dir === "forward" ? 20 : -20,
                  opacity: 0,
                }),
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {step === 1 && (
                <>
                  <Select value={selectedScanner || ""} onValueChange={setSelectedScanner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a scanner">
                        {selectedScanner &&
                          selectedScanner.charAt(0).toUpperCase() + selectedScanner.slice(1)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {scanners.map((scanner) => (
                        <SelectItem key={scanner} value={scanner} className="capitalize">
                          {scanner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderFlags()}
                </>
              )}
              {step === 2 && renderAssets()}
              {step === 3 && renderSummary()}
            </motion.div>
          </AnimatePresence>

          <DialogFooter className="sm:justify-start">
            <div className="flex w-full justify-between items-center">
              <Button variant="outline" onClick={resetDialog} disabled={isLoading}>
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  Back
                </Button>
              )}

              {step === 3 ? (
                <Popover
                  open={showConfirmPopover}
                  onOpenChange={setShowConfirmPopover}
                  modal={true}
                >
                  <PopoverTrigger asChild>
                    <Button
                      className="flex items-center gap-2 transition-opacity"
                      onClick={() => setShowConfirmPopover(true)}
                      disabled={showConfirmPopover || isLoading}
                    >
                      Launch
                      {isLoading && (
                        <span className="ml-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-64"
                    side="top"
                    align="center"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <p className="mb-4 text-sm">
                      Are you sure you want to launch the scan? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowConfirmPopover(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          setShowConfirmPopover(false);
                          setIsLoading(true);
                          await launchScan();
                        }}
                      >
                        Confirm
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={async () => {
                          if (!isValid || isLoading) return;
                          setIsLoading(true);
                          try {
                            await handleNext();
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={!isValid || isLoading}
                        className="flex items-center gap-2"
                      >
                        Next
                        {isLoading && (
                          <span className="ml-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isValid && (
                    <TooltipContent>
                      {validationError || "Please complete required fields to continue."}
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
}

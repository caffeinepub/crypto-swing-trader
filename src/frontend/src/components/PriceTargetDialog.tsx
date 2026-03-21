import { PriceDirection } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { usePriceTargets } from "@/hooks/usePriceTargets";
import type { CryptoMarketData } from "@/services/coingecko";
import { ArrowDown, ArrowUp, Bell, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PriceTargetDialogProps {
  coin: CryptoMarketData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PriceTargetDialog({
  coin,
  open,
  onOpenChange,
}: PriceTargetDialogProps) {
  const [targetPrice, setTargetPrice] = useState("");
  const { addTarget, isAdding } = usePriceTargets();
  const { identity, login, loginStatus } = useInternetIdentity();

  const numericTarget = Number.parseFloat(targetPrice);
  const isValid = !Number.isNaN(numericTarget) && numericTarget > 0;
  const direction =
    isValid && numericTarget > coin.current_price
      ? PriceDirection.above
      : PriceDirection.below;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    try {
      await addTarget({
        coinId: coin.id,
        coinName: coin.name,
        targetPrice: numericTarget,
        direction,
      });
      toast.success(
        `🎯 Alert set for ${coin.name} at $${numericTarget.toLocaleString()}`,
        {
          style: {
            background: "hsl(var(--card))",
            border: "1px solid oklch(0.85 0.18 195 / 0.5)",
            color: "oklch(0.85 0.18 195)",
          },
        },
      );
      setTargetPrice("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to set price target");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-neon-cyan/30 bg-card max-w-sm"
        data-ocid="price_target.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-neon-cyan glow-text">
            <Bell className="h-5 w-5" />
            Set Price Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coin info */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background-elevated/50">
            <img src={coin.image} alt={coin.name} className="h-8 w-8" />
            <div>
              <p className="font-semibold text-foreground">{coin.name}</p>
              <p className="text-sm text-muted-foreground font-mono">
                Current: ${coin.current_price.toLocaleString()}
              </p>
            </div>
          </div>

          {!identity ? (
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Sign in to set price alerts
              </p>
              <Button
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="w-full bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30"
                data-ocid="price_target.submit_button"
              >
                {loginStatus === "logging-in" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="target-price"
                  className="text-sm font-heading text-muted-foreground"
                >
                  Target Price (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                    $
                  </span>
                  <Input
                    id="target-price"
                    type="number"
                    step="any"
                    min="0"
                    placeholder={coin.current_price.toLocaleString()}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="pl-7 font-mono border-neon-cyan/30 bg-background focus:border-neon-cyan focus:ring-neon-cyan/20"
                    data-ocid="price_target.input"
                  />
                </div>
              </div>

              {/* Direction preview */}
              {isValid && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-mono ${
                    direction === PriceDirection.above
                      ? "border-neon-green/30 bg-neon-green/5 text-neon-green"
                      : "border-neon-red/30 bg-neon-red/5 text-neon-red"
                  }`}
                >
                  {direction === PriceDirection.above ? (
                    <ArrowUp className="h-4 w-4 shrink-0" />
                  ) : (
                    <ArrowDown className="h-4 w-4 shrink-0" />
                  )}
                  <span>
                    Alert when price goes{" "}
                    <strong>
                      {direction === PriceDirection.above ? "ABOVE" : "BELOW"}
                    </strong>{" "}
                    ${numericTarget.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border/50"
                  onClick={() => onOpenChange(false)}
                  data-ocid="price_target.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || isAdding}
                  className="flex-1 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30 disabled:opacity-50"
                  data-ocid="price_target.submit_button"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting...
                    </>
                  ) : (
                    "Set Alert"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

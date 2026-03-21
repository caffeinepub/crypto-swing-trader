import type { PriceTarget } from "@/backend";
import { PriceDirection } from "@/backend";
import { Button } from "@/components/ui/button";
import { usePriceTargets } from "@/hooks/usePriceTargets";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";

function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TargetItem({
  target,
  onDelete,
  index,
}: {
  target: PriceTarget;
  onDelete: (id: string) => void;
  index: number;
}) {
  const isAbove = target.direction === PriceDirection.above;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
        target.triggered
          ? "border-border/30 bg-muted/10 opacity-60"
          : isAbove
            ? "border-neon-green/30 bg-neon-green/5 hover:bg-neon-green/10"
            : "border-neon-red/30 bg-neon-red/5 hover:bg-neon-red/10"
      }`}
      data-ocid={`price_targets.item.${index}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            target.triggered
              ? "bg-muted/20"
              : isAbove
                ? "bg-neon-green/10"
                : "bg-neon-red/10"
          }`}
        >
          {target.triggered ? (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          ) : isAbove ? (
            <ArrowUp className="h-4 w-4 text-neon-green" />
          ) : (
            <ArrowDown className="h-4 w-4 text-neon-red" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {target.coinName}
            </span>
            <span
              className={`text-xs font-heading px-1.5 py-0.5 rounded ${
                target.triggered
                  ? "bg-muted/20 text-muted-foreground"
                  : isAbove
                    ? "bg-neon-green/10 text-neon-green"
                    : "bg-neon-red/10 text-neon-red"
              }`}
            >
              {target.triggered ? "TRIGGERED" : isAbove ? "ABOVE" : "BELOW"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm text-foreground">
              ${target.targetPrice.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              · {formatDate(target.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {!target.triggered && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(target.id)}
          className="h-8 w-8 text-muted-foreground hover:text-neon-red hover:bg-neon-red/10 transition-colors"
          data-ocid={`price_targets.delete_button.${index}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function PriceTargetList() {
  const { targets, isLoading, deleteTarget } = usePriceTargets();

  const activeTargets = targets.filter((t) => !t.triggered);
  const triggeredTargets = targets.filter((t) => t.triggered);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (targets.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-4 rounded-lg border border-neon-cyan/20 bg-card/50"
        data-ocid="price_targets.empty_state"
      >
        <Bell className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-muted-foreground">No price targets set yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click the bell icon on any coin to set a target.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeTargets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-heading text-neon-cyan uppercase tracking-wider flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Active Targets ({activeTargets.length})
          </h3>
          <div className="space-y-2">
            {activeTargets.map((target, i) => (
              <TargetItem
                key={target.id}
                target={target}
                onDelete={deleteTarget}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      )}

      {triggeredTargets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-heading text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Triggered ({triggeredTargets.length})
          </h3>
          <div className="space-y-2">
            {triggeredTargets.map((target, i) => (
              <TargetItem
                key={target.id}
                target={target}
                onDelete={deleteTarget}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

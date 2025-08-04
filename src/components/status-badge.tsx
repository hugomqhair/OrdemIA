"use client";

import type { BudgetStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Circle, CheckCircle2, XCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: BudgetStatus;
};

const statusConfig = {
  Aberto: {
    icon: <Circle className="h-3 w-3" />,
    color: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  },
  Aceito: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: "bg-green-500/20 text-green-700 border-green-500/30",
  },
  Finalizado: {
    icon: <Award className="h-3 w-3" />,
    color: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  },
  Recusado: {
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-500/20 text-red-700 border-red-500/30",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1.5 w-fit", config.color)}
    >
      {config.icon}
      <span>{status}</span>
    </Badge>
  );
}

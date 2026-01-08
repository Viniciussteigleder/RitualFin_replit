"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Tag, FileDown, Trash2 } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClassifyAll: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClassifyAll,
  onExport,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2">
          <Checkbox checked={true} onCheckedChange={onClearSelection} />
          <span className="font-bold text-sm">
            {selectedCount} selected
          </span>
        </div>

        <div className="h-6 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onClassifyAll}
          >
            <Tag className="h-4 w-4 mr-2" />
            Classify All
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onExport}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="text-white/60 hover:bg-white/10 hover:text-white"
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

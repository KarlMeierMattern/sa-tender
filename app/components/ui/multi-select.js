"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function MultiSelect({
  label,
  options = [],
  selected = [],
  onSelect,
  placeholder = "Select...",
}) {
  // Ensure arrays are defined
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full min-w-[160px] sm:w-[200px] justify-between"
          aria-label={label || placeholder}
        >
          {safeSelected.length > 0
            ? `${label ? `${label}: ` : ""}${safeSelected.length} selected`
            : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <div className="max-h-[300px] overflow-y-auto p-1">
          {safeOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2 p-2">
              <Checkbox
                id={`${label}-${option}`}
                checked={safeSelected.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelect([...safeSelected, option]);
                  } else {
                    onSelect(safeSelected.filter((item) => item !== option));
                  }
                }}
              />
              <label
                htmlFor={`${label}-${option}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

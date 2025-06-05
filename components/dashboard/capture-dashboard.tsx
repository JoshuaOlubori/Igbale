// components/dashboard/capture-dropdown.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Camera } from "lucide-react";

interface CaptureDropdownProps {
  hasCommunity: boolean;
}

export default function CaptureDropdown({ hasCommunity }: CaptureDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
          disabled={!hasCommunity} // Disable if user is not in a community
        >
          <Camera className="mr-2 h-4 w-4" />
          Capture
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Fix: Wrap the text inside Link with a <span> */}
        <DropdownMenuItem asChild>
          <Link href="/pickup">
            <span>Register trash</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/claim">
            <span>Confirm pickup</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
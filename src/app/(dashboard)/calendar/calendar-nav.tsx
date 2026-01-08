"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CalendarNavProps {
    currentDate: Date;
    prevMonthStr: string;
    nextMonthStr: string;
}

export function CalendarNav({ currentDate, prevMonthStr, nextMonthStr }: CalendarNavProps) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/calendar?month=${prevMonthStr}`)}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg min-w-[150px] text-center">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/calendar?month=${nextMonthStr}`)}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

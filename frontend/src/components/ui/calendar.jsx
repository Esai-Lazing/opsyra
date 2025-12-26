import * as React from "react"
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/utils/cn"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    formatters,
    components,
    ...props
}) {
    const defaultClassNames = getDefaultClassNames()

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn(
                "rounded-md border bg-background p-3 shadow-sm",
                "[--cell-size:2.5rem]",
                "[[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
                String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                className
            )}
            captionLayout={captionLayout}
            formatters={{
                formatMonthDropdown: (date) =>
                    date.toLocaleString("default", { month: "short" }),
                ...formatters,
            }}
            classNames={{
                root: cn("w-fit relative", defaultClassNames.root),
                months: cn("relative flex flex-col gap-4", defaultClassNames.months),
                month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
                nav: cn(
                    "absolute flex items-center justify-between",
                    "left-0 right-0",
                    "top-5",
                    defaultClassNames.nav
                ),
                button_previous: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "h-7 w-7 rounded-md p-0",
                    "absolute left-1",
                    "hover:bg-accent hover:text-accent-foreground",
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "h-7 w-7 rounded-md p-0",
                    "absolute right-1",
                    "hover:bg-accent hover:text-accent-foreground",
                    defaultClassNames.button_next
                ),
                month_caption: cn(
                    "flex h-9 items-center justify-center text-sm font-medium",
                    defaultClassNames.month_caption
                ),
                dropdowns: cn(
                    "flex h-9 items-center justify-center gap-1.5 text-sm font-medium",
                    defaultClassNames.dropdowns
                ),
                dropdown_root: cn(
                    "relative inline-flex items-center rounded-md border border-input bg-background px-2 py-1 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    defaultClassNames.dropdown_root
                ),
                dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
                caption_label: cn(
                    "select-none text-sm font-medium gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5 flex items-center justify-center",
                    captionLayout === "label" ? "text-sm font-medium" : "",
                    defaultClassNames.caption_label
                ),
                table: "w-full border-collapse space-y-1",
                weekdays: cn("flex", defaultClassNames.weekdays),
                weekday: cn(
                    "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
                    "h-9 w-9 flex items-center justify-center",
                    defaultClassNames.weekday
                ),
                week: cn("mt-2 flex w-full", defaultClassNames.week),
                week_number_header: cn("w-[--cell-size] select-none", defaultClassNames.week_number_header),
                week_number: cn(
                    "text-muted-foreground select-none text-[0.8rem]",
                    defaultClassNames.week_number
                ),
                day: cn(
                    "group/day relative aspect-square h-9 w-9 p-0 text-sm font-normal",
                    "flex items-center justify-center rounded-md",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    defaultClassNames.day
                ),
                range_start: cn("bg-primary text-primary-foreground rounded-l-md", defaultClassNames.range_start),
                range_middle: cn("bg-accent text-accent-foreground rounded-none", defaultClassNames.range_middle),
                range_end: cn("bg-primary text-primary-foreground rounded-r-md", defaultClassNames.range_end),
                today: cn(
                    "bg-accent text-accent-foreground font-semibold",
                    defaultClassNames.today
                ),
                outside: cn(
                    "text-muted-foreground opacity-50",
                    defaultClassNames.outside
                ),
                disabled: cn(
                    "text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none",
                    defaultClassNames.disabled
                ),
                hidden: cn("invisible", defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Root: ({ className, rootRef, ...props }) => {
                    return (<div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />);
                },
                Chevron: ({ className, orientation, ...props }) => {
                    if (orientation === "left") {
                        return (<ChevronLeftIcon className={cn("size-4", className)} {...props} />);
                    }

                    if (orientation === "right") {
                        return (<ChevronRightIcon className={cn("size-4", className)} {...props} />);
                    }

                    return (<ChevronDownIcon className={cn("size-4", className)} {...props} />);
                },
                DayButton: CalendarDayButton,
                WeekNumber: ({ children, ...props }) => {
                    return (
                        <td {...props}>
                            <div
                                className="flex size-[--cell-size] items-center justify-center text-center">
                                {children}
                            </div>
                        </td>
                    );
                },
                ...components,
            }}
            {...props} />
    );
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}) {
    const defaultClassNames = getDefaultClassNames()

    const ref = React.useRef(null)
    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus()
    }, [modifiers.focused])

    const isSelected = modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={isSelected}
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            data-today={modifiers.today}
            data-outside={modifiers.outside}
            data-disabled={modifiers.disabled}
            className={cn(
                // Base styles
                "h-9 w-9 p-0 font-normal",
                "aria-selected:opacity-100",
                // Selected single date
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                // Range styles
                modifiers.range_start && "bg-primary text-primary-foreground rounded-l-md hover:bg-primary hover:text-primary-foreground",
                modifiers.range_end && "bg-primary text-primary-foreground rounded-r-md hover:bg-primary hover:text-primary-foreground",
                modifiers.range_middle && "bg-accent text-accent-foreground rounded-none hover:bg-accent hover:text-accent-foreground",
                // Today (not selected)
                modifiers.today && !isSelected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle && "bg-accent text-accent-foreground font-semibold",
                // Outside days
                modifiers.outside && "text-muted-foreground opacity-50",
                // Disabled
                modifiers.disabled && "text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none",
                // Focus styles
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
                defaultClassNames.day,
                className
            )}
            {...props} />
    );
}

export { Calendar, CalendarDayButton }

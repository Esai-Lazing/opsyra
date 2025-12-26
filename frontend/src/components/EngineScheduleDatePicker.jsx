"use client"

import React, { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/utils/cn"

/**
 * Composant Date Picker pour la planification d'engins
 * 
 * @param {Object} props
 * @param {Date|null} props.value - Date sélectionnée
 * @param {Function} props.onChange - Callback appelé avec (date, dateISO) ou (date) selon l'utilisation
 * @param {string} props.label - Label du champ (optionnel)
 * @param {string} props.placeholder - Placeholder (optionnel)
 * @param {Date} props.minDate - Date minimum (optionnel)
 * @param {Date} props.maxDate - Date maximum (optionnel)
 * @param {boolean} props.disabled - Désactiver le composant (optionnel)
 * @param {string} props.className - Classes CSS additionnelles (optionnel)
 */
export function EngineScheduleDatePicker({
    value,
    onChange,
    label,
    placeholder = "Sélectionner une date",
    minDate,
    maxDate,
    disabled = false,
    className
}) {
    const [open, setOpen] = useState(false)
    const [month, setMonth] = useState(value || new Date())

    // Synchroniser le mois avec la date sélectionnée
    useEffect(() => {
        if (value) {
            setMonth(value)
        }
    }, [value])

    const handleSelect = (date) => {
        if (!date) return

        // Vérifier les contraintes
        if (minDate && date < minDate) return
        if (maxDate && date > maxDate) return

        // Appeler onChange avec date et dateISO si le callback accepte 2 paramètres
        if (onChange.length >= 2) {
            const dateISO = date.toISOString()
            onChange(date, dateISO)
        } else {
            onChange(date)
        }

        setOpen(false)
    }

    const formatDate = (date) => {
        if (!date) return ""
        return format(date, "PPP", { locale: fr })
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && (
                <Label className="text-sm font-medium text-foreground">
                    {label}
                </Label>
            )}

            <div className="relative">
                <Popover open={open} onOpenChange={setOpen} modal={false}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal bg-background",
                                !value && "text-muted-foreground"
                            )}
                            disabled={disabled}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? formatDate(value) : <span>{placeholder}</span>}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0 z-[200]" align="start" sideOffset={5}>
                        <Calendar
                            mode="single"
                            selected={value || undefined}
                            month={month}
                            onMonthChange={setMonth}
                            captionLayout="dropdown"
                            onSelect={handleSelect}
                            disabled={(date) => {
                                // Normaliser les dates pour la comparaison
                                const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

                                if (minDate) {
                                    const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
                                    if (dateOnly < minDateOnly) return true
                                }
                                if (maxDate) {
                                    const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
                                    if (dateOnly > maxDateOnly) return true
                                }
                                return false
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

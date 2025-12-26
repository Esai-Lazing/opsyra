/**
 * EXEMPLE D'UTILISATION - EngineScheduleDatePicker
 * 
 * Ce fichier montre comment utiliser le composant EngineScheduleDatePicker
 * dans un formulaire de planification d'engin.
 * 
 * Pour utiliser ce composant dans votre application :
 * 1. Importez le composant : import { EngineScheduleDatePicker } from '@/components/EngineScheduleDatePicker'
 * 2. Utilisez-le dans votre formulaire comme montré ci-dessous
 */

"use client"

import React, { useState } from 'react'
import { EngineScheduleDatePicker } from '@/components/EngineScheduleDatePicker'
import { Button } from '@/components/ui/button'
import api from '../api/axios'

/**
 * Exemple de formulaire de planification d'engin
 */
export function EngineScheduleFormExample() {
    // État pour la date sélectionnée (format Date)
    const [scheduleDate, setScheduleDate] = useState(null)
    
    // État pour la date ISO (pour l'API)
    const [scheduleDateISO, setScheduleDateISO] = useState(null)
    
    // État pour les autres champs du formulaire
    const [enginId, setEnginId] = useState('')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    /**
     * Gère le changement de date
     * @param {Date|null} date - Date sélectionnée (format Date)
     * @param {string|null} dateISO - Date au format ISO (pour l'API)
     */
    const handleDateChange = (date, dateISO) => {
        setScheduleDate(date)
        setScheduleDateISO(dateISO)
        console.log('Date sélectionnée:', date)
        console.log('Date ISO (pour API):', dateISO)
    }

    /**
     * Soumet le formulaire vers l'API Laravel
     */
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!scheduleDateISO) {
            alert('Veuillez sélectionner une date')
            return
        }

        setSubmitting(true)
        try {
            // Exemple d'envoi vers l'API Laravel
            const response = await api.post('/engins/schedule', {
                engin_id: enginId,
                schedule_date: scheduleDateISO, // Format ISO pour Laravel
                notes: notes
            })
            
            console.log('Planification créée:', response.data)
            alert('Planification créée avec succès!')
            
            // Réinitialiser le formulaire
            setScheduleDate(null)
            setScheduleDateISO(null)
            setEnginId('')
            setNotes('')
        } catch (error) {
            console.error('Erreur:', error)
            alert(error.response?.data?.message || "Erreur lors de l'enregistrement")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Planification d'Engin
                </h2>
                <p className="text-sm text-muted-foreground">
                    Sélectionnez une date en utilisant le texte naturel ou le calendrier
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Exemple 1: Date Picker simple */}
                <EngineScheduleDatePicker
                    label="Date de planification"
                    value={scheduleDate}
                    onChange={handleDateChange}
                    placeholder="Ex: Tomorrow, In 2 days, Next Monday..."
                />

                {/* Exemple 2: Date Picker avec contraintes (dates passées désactivées) */}
                <EngineScheduleDatePicker
                    label="Date de planification (dates passées désactivées)"
                    value={scheduleDate}
                    onChange={handleDateChange}
                    placeholder="Ex: Tomorrow, In 2 days, Next Monday..."
                    minDate={new Date()} // Désactiver les dates passées
                />

                {/* Exemple 3: Date Picker avec plage de dates */}
                <EngineScheduleDatePicker
                    label="Date de planification (plage limitée)"
                    value={scheduleDate}
                    onChange={handleDateChange}
                    placeholder="Ex: Tomorrow, In 2 days, Next Monday..."
                    minDate={new Date()} // Date minimum: aujourd'hui
                    maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // Date maximum: dans 90 jours
                />

                {/* Autres champs du formulaire */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        ID de l'engin
                    </label>
                    <input
                        type="text"
                        value={enginId}
                        onChange={(e) => setEnginId(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                        placeholder="Entrez l'ID de l'engin"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Notes (optionnel)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none"
                        placeholder="Notes additionnelles..."
                    />
                </div>

                {/* Affichage de la date ISO pour debug */}
                {scheduleDateISO && (
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                        <p className="text-xs text-muted-foreground mb-1">
                            Date ISO (sera envoyée à l'API):
                        </p>
                        <p className="text-sm font-mono text-foreground">
                            {scheduleDateISO}
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setScheduleDate(null)
                            setScheduleDateISO(null)
                            setEnginId('')
                            setNotes('')
                        }}
                    >
                        Réinitialiser
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting || !scheduleDateISO}
                        className="flex-1"
                    >
                        {submitting ? 'Enregistrement...' : 'Créer la planification'}
                    </Button>
                </div>
            </form>

            {/* Section d'aide */}
            <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                    💡 Exemples de texte naturel accepté:
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>"Tomorrow" - Demain</li>
                    <li>"In 2 days" - Dans 2 jours</li>
                    <li>"Next Monday" - Lundi prochain</li>
                    <li>"Next week" - La semaine prochaine</li>
                    <li>"In 3 weeks" - Dans 3 semaines</li>
                    <li>"Next month" - Le mois prochain</li>
                    <li>"2024-12-25" - Format date standard</li>
                </ul>
            </div>
        </div>
    )
}

export default EngineScheduleFormExample


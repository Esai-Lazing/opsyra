# EngineScheduleDatePicker

Composant Date Picker avancé pour la planification d'engins avec support du texte naturel et sélection calendrier.

## Fonctionnalités

- ✅ **Saisie de date en texte naturel** : "Tomorrow", "In 2 days", "Next Monday", etc.
- ✅ **Sélection manuelle via calendrier** : Interface ShadCN Calendar moderne
- ✅ **Synchronisation automatique** : Input, date sélectionnée et calendrier sont synchronisés
- ✅ **Format ISO pour API Laravel** : Retourne automatiquement la date au format ISO
- ✅ **Contraintes de dates** : Support des dates min/max
- ✅ **Validation en temps réel** : Messages d'erreur clairs
- ✅ **Design professionnel** : Style sobre et moderne

## Installation

Le composant utilise les dépendances suivantes (déjà installées) :
- `chrono-node` - Parsing de texte naturel
- `date-fns` - Formatage de dates
- `@/components/ui/calendar` - Composant Calendar ShadCN
- `@/components/ui/popover` - Composant Popover ShadCN
- `@/components/ui/button` - Composant Button ShadCN
- `@/components/ui/input` - Composant Input ShadCN
- `@/components/ui/label` - Composant Label ShadCN

## Utilisation de base

```jsx
import { EngineScheduleDatePicker } from '@/components/EngineScheduleDatePicker'

function MyForm() {
    const [date, setDate] = useState(null)
    const [dateISO, setDateISO] = useState(null)

    const handleDateChange = (date, dateISO) => {
        setDate(date)
        setDateISO(dateISO)
    }

    return (
        <EngineScheduleDatePicker
            label="Date de planification"
            value={date}
            onChange={handleDateChange}
            placeholder="Ex: Tomorrow, In 2 days..."
        />
    )
}
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `value` | `Date \| null` | - | Date sélectionnée (format Date) |
| `onChange` | `(date: Date \| null, dateISO: string \| null) => void` | - | Callback appelé avec la date et sa version ISO |
| `label` | `string` | - | Label du champ (optionnel) |
| `placeholder` | `string` | `"Ex: Tomorrow, In 2 days, Next Monday..."` | Placeholder du champ |
| `disabled` | `boolean` | `false` | Désactiver le composant |
| `className` | `string` | - | Classes CSS additionnelles |
| `minDate` | `Date` | - | Date minimum sélectionnable |
| `maxDate` | `Date` | - | Date maximum sélectionnable |

## Exemples de texte naturel accepté

Le composant utilise `chrono-node` pour parser le texte naturel. Voici quelques exemples :

- **"Tomorrow"** - Demain
- **"In 2 days"** - Dans 2 jours
- **"Next Monday"** - Lundi prochain
- **"Next week"** - La semaine prochaine
- **"In 3 weeks"** - Dans 3 semaines
- **"Next month"** - Le mois prochain
- **"2024-12-25"** - Format date standard
- **"25/12/2024"** - Format date français
- **"December 25, 2024"** - Format date anglais

## Exemple complet avec formulaire

Voir le fichier `EngineScheduleDatePicker.example.jsx` pour un exemple complet d'intégration dans un formulaire de planification d'engin.

## Format de sortie

Le composant retourne deux valeurs dans le callback `onChange` :

1. **`date`** : Objet `Date` JavaScript (pour l'affichage et les calculs)
2. **`dateISO`** : String au format ISO 8601 (ex: `"2024-12-25T00:00:00.000Z"`) pour l'API Laravel

## Intégration avec API Laravel

```jsx
const handleSubmit = async (e) => {
    e.preventDefault()
    
    const response = await api.post('/engins/schedule', {
        engin_id: enginId,
        schedule_date: dateISO, // Format ISO pour Laravel
        notes: notes
    })
}
```

Laravel acceptera automatiquement le format ISO dans un champ `date` ou `datetime`.

## Notes techniques

- Le composant utilise `"use client"` pour React Server Components
- La synchronisation entre input et calendrier est automatique
- Les dates sont normalisées pour ignorer l'heure lors des comparaisons
- Le calendrier se ferme automatiquement après sélection
- Les erreurs de parsing sont affichées en temps réel

## Personnalisation

Le composant utilise les classes Tailwind CSS et peut être personnalisé via la prop `className` :

```jsx
<EngineScheduleDatePicker
    className="my-custom-class"
    // ... autres props
/>
```


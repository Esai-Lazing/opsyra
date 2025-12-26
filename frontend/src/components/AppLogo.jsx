import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Logo Opsyra, simple et moderne.
 *
 * @param {Object} props
 * @param {boolean} [props.showText=true] - Affiche ou non le texte "Opsyra".
 * @param {number} [props.size=48] - Taille du symbole (hauteur en px).
 * @param {string} [props.className] - Classes additionnelles.
 */
export const AppLogo = ({ showText = true, size = 48, className }) => {
    const iconHeight = size;
    const iconWidth = size; // carré pour faciliter l'alignement

    return (
        <div className={cn("inline-flex items-center justify-center gap-3 flex-shrink-0", className)} style={{ width: `${iconWidth}px`, height: `${iconHeight}px`, flexShrink: 0 }}>
            <svg
                width={iconWidth}
                height={iconHeight}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Opsyra"
                className="flex-shrink-0"
                preserveAspectRatio="xMidYMid meet"
                style={{
                    display: 'block',
                    width: `${iconWidth}px`,
                    height: `${iconHeight}px`,
                    minWidth: `${iconWidth}px`,
                    minHeight: `${iconHeight}px`,
                    maxWidth: `${iconWidth}px`,
                    maxHeight: `${iconHeight}px`,
                    flexShrink: 0
                }}
            >
                <defs>
                    <linearGradient id="opsyra-g" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="45%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                    <linearGradient id="opsyra-g2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
                    </linearGradient>
                </defs>

                {/* Cercle de base */}
                <circle cx="32" cy="32" r="30" fill="#0F172A" opacity="0.06" />
                <circle cx="32" cy="32" r="24" fill="url(#opsyra-g)" opacity="0.18" />

                {/* Ruban minimaliste */}
                <path
                    d="M20 44 L34 16 H46 L32 44 Z"
                    fill="url(#opsyra-g)"
                />
                <path
                    d="M30 20 H44 L50 32 H36 Z"
                    fill="url(#opsyra-g2)"
                    opacity="0.9"
                />

                {/* Point d'ancrage / focus */}
                <circle cx="46" cy="18" r="3" fill="#FFFFFF" opacity="0.9" />

                {showText && (
                    <text
                        x="72"
                        y="40"
                        fill="#0F172A"
                        fontFamily="Inter, system-ui, -apple-system, sans-serif"
                        fontSize="24"
                        fontWeight="700"
                        letterSpacing="0.5"
                    >
                        Opsyra
                    </text>
                )}
            </svg>
        </div>
    );
};



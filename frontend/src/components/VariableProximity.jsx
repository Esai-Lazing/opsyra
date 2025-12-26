import { forwardRef, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

function useAnimationFrame(callback) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        let frameId;
        const loop = () => {
            callbackRef.current();
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, []);
}

function useMousePositionRef(containerRef) {
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const updatePosition = (x, y) => {
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                positionRef.current = { x: x - rect.left, y: y - rect.top };
            } else {
                positionRef.current = { x, y };
            }
        };

        const handleMouseMove = ev => updatePosition(ev.clientX, ev.clientY);
        const handleTouchMove = ev => {
            const touch = ev.touches[0];
            updatePosition(touch.clientX, touch.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [containerRef]);

    return positionRef;
}

const VariableProximity = forwardRef((props, ref) => {
    const {
        label,
        fromFontVariationSettings,
        toFontVariationSettings,
        containerRef,
        radius = 50,
        falloff = 'linear',
        className = '',
        onClick,
        style,
        ...restProps
    } = props;

    const letterRefs = useRef([]);
    const mousePositionRef = useMousePositionRef(containerRef);
    const lastPositionRef = useRef({ x: null, y: null });

    // Parse font variation settings to extract weight values
    const parseWeight = (settingsStr) => {
        const match = settingsStr.match(/'wght'\s+(\d+)/);
        return match ? parseInt(match[1]) : 400;
    };

    const fromWeight = useMemo(() => parseWeight(fromFontVariationSettings), [fromFontVariationSettings]);
    const toWeight = useMemo(() => parseWeight(toFontVariationSettings), [toFontVariationSettings]);

    const calculateDistance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const calculateFalloff = useCallback((distance) => {
        const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
        switch (falloff) {
            case 'exponential':
                return norm ** 2;
            case 'gaussian':
                return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
            case 'linear':
            default:
                return norm;
        }
    }, [radius, falloff]);

    const updateWeights = useCallback(() => {
        if (!containerRef?.current) return;
        const { x, y } = mousePositionRef.current;
        if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
            return;
        }
        lastPositionRef.current = { x, y };

        const containerRect = containerRef.current.getBoundingClientRect();

        letterRefs.current.forEach((letterRef) => {
            if (!letterRef) return;

            const rect = letterRef.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
            const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

            const distance = calculateDistance(
                mousePositionRef.current.x,
                mousePositionRef.current.y,
                letterCenterX,
                letterCenterY
            );

            const falloffValue = calculateFalloff(distance);
            const weight = Math.round(fromWeight + (toWeight - fromWeight) * falloffValue);

            if (letterRef.style) {
                letterRef.style.fontWeight = weight;
            }
        });
    }, [containerRef, mousePositionRef, fromWeight, toWeight, calculateFalloff]);

    useAnimationFrame(updateWeights);

    const words = label.split(' ');
    let letterIndex = 0;

    return (
        <span
            ref={ref}
            onClick={onClick}
            style={{
                display: 'inline',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                ...style
            }}
            className={className}
            {...restProps}
        >
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block whitespace-nowrap">
                    {word.split('').map(letter => {
                        const currentLetterIndex = letterIndex++;
                        return (
                            <motion.span
                                key={currentLetterIndex}
                                ref={el => {
                                    if (el) {
                                        letterRefs.current[currentLetterIndex] = el;
                                        el.style.fontWeight = fromWeight;
                                    }
                                }}
                                style={{
                                    display: 'inline-block',
                                    fontWeight: fromWeight,
                                    transition: 'font-weight 0.05s ease-out'
                                }}
                                aria-hidden="true"
                            >
                                {letter}
                            </motion.span>
                        );
                    })}
                    {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                </span>
            ))}
            <span className="sr-only">{label}</span>
        </span>
    );
});

VariableProximity.displayName = 'VariableProximity';
export default VariableProximity;

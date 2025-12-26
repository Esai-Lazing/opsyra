"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

export const BlurText = ({
    text = "",
    delay = 0.05,
    className = "",
    animateBy = "words", // "words" or "letters"
    direction = "top", // "top", "bottom", "left", "right"
    threshold = 0.1,
    rootMargin = "0px",
    animationFrom,
    animationTo,
    onAnimationComplete,
}) => {
    const elements = animateBy === "words" ? text.split(" ") : text.split("");
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: threshold });
    const controls = useAnimation();
    const [hasAnimated, setHasAnimated] = useState(false);

    const defaultFrom = {
        top: { filter: "blur(10px)", opacity: 0, y: -30 },
        bottom: { filter: "blur(10px)", opacity: 0, y: 30 },
        left: { filter: "blur(10px)", opacity: 0, x: -30 },
        right: { filter: "blur(10px)", opacity: 0, x: 30 },
    };

    const defaultTo = {
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
        x: 0,
    };

    const fromAnimation = animationFrom || defaultFrom[direction];
    const toAnimation = animationTo || defaultTo;

    useEffect(() => {
        if (inView && !hasAnimated) {
            controls.start("visible");
            setHasAnimated(true);
        }
    }, [inView, controls, hasAnimated]);

    return (
        <motion.span
            ref={ref}
            initial="hidden"
            animate={controls}
            className={cn("inline-flex flex-wrap", className)}
            onAnimationComplete={onAnimationComplete}
        >
            {elements.map((element, index) => (
                <motion.span
                    key={index}
                    variants={{
                        hidden: fromAnimation,
                        visible: toAnimation,
                    }}
                    transition={{
                        duration: 0.5,
                        delay: index * delay,
                        ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="inline-block"
                >
                    {element}
                    {animateBy === "words" && index < elements.length - 1 && (
                        <span className="inline-block">&nbsp;</span>
                    )}
                </motion.span>
            ))}
        </motion.span>
    );
};

export default BlurText;

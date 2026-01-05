"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Use MotionValues for high-performance updates directly to DOM
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics for the trailing element
    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseenter", handleMouseEnter);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [mouseX, mouseY, isVisible]);

    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        // Robust check for touch devices
        const checkTouch = () => {
            if (typeof window === 'undefined') return false;
            return window.matchMedia("(pointer: coarse)").matches ||
                window.matchMedia("(hover: none)").matches;
        };

        setIsTouch(checkTouch());

        // Listen for changes
        const mediaQuery = window.matchMedia("(pointer: coarse)");
        const handleChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);

        try {
            mediaQuery.addEventListener("change", handleChange);
        } catch (e) {
            // Safari < 14 support
            try {
                mediaQuery.addListener(handleChange);
            } catch (e2) {
                console.warn("Media query listener not supported");
            }
        }

        return () => {
            try {
                mediaQuery.removeEventListener("change", handleChange);
            } catch (e) {
                try {
                    mediaQuery.removeListener(handleChange);
                } catch (e2) { }
            }
        };
    }, []);

    if (isTouch || !isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
            style={{
                x: springX,
                y: springY,
                translateX: "-50%",
                translateY: "-50%",
            }}
        >
            {/* Minimal Dot Cursor - works in tandem with compass */}
            <div className="w-2 h-2 bg-white rounded-full opacity-90 shadow-sm" />
        </motion.div>
    );
};

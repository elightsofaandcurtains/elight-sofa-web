"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut",
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

const contentVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-screen"
            >
                <motion.div variants={contentVariants}>
                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
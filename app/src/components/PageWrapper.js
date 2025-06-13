import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function PageWrapper({ children, isBack }) {
    const location = useLocation();

    const variants = {
        initial: isBack
            ? { opacity: 0, x: -20 }
            : { opacity: 0 },
        animate: isBack
            ? { opacity: 1, x: 0 }
            : { opacity: 1 },
    };

    const transition = {
        duration: 0.25,
        ease: 'easeOut',
    };

    return (
        <motion.div
            key={location.pathname}
            className="h-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
        >
            {children}
        </motion.div>
    );
}
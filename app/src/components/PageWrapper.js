import { motion } from 'framer-motion';

const baseVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function PageWrapper({ children }) {
    return (
        <motion.div
            key={children.key}
            initial="initial"
            animate="animate"
            variants={baseVariants}
        >
            {children}
        </motion.div>
    );
}
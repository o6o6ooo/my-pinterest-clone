import { motion, AnimatePresence } from 'framer-motion';

export default function SlideOver({ open, onClose, children }) {

    return (
        <AnimatePresence>
            {open && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed right-0 top-0 w-full max-w-md h-full bg-white shadow-lg z-50"
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
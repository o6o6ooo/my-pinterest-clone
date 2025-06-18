import { useEffect, useState } from 'react';

export default function PopupModal({ open, onClose, children }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (open) setShow(true);
        else {
            const timeout = setTimeout(() => setShow(false), 200); // アニメーション後に非表示
            return () => clearTimeout(timeout);
        }
    }, [open]);

    if (!open && !show) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200`}
            onClick={onClose}
        >
            <div
                className={`transform transition-all duration-200 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
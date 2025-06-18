import { useEffect, useState } from 'react';

export default function PopupModal({ open, onClose, children }) {
    const [show, setShow] = useState(false);         // 表示を管理
    const [innerOpen, setInnerOpen] = useState(false); // アニメーションの状態

    useEffect(() => {
        if (open) {
            setShow(true);
            // 少し遅らせて innerOpen = true にすることで transition を効かせる
            setTimeout(() => setInnerOpen(true), 10);
        } else {
            setInnerOpen(false);
            const timeout = setTimeout(() => setShow(false), 200); // アニメーション完了後に非表示
            return () => clearTimeout(timeout);
        }
    }, [open]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className={`transform transition-all duration-200 ease-in-out
          ${innerOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadOverlay({ isOpen, onClose }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    // オーバーレイを閉じる処理
    const handleClose = () => {
        onClose();
    };

    // 外側クリック時に閉じる
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // 画像選択時に投稿ページへ遷移
    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length) {
            navigate('/post', { state: { files: selectedFiles } });
            onClose();
        }
      };

    return (
        <div
            className="fixed inset-0 bg-transparent z-50 flex justify-center items-center"
            onClick={handleOverlayClick}
        >
            <div
                className="fixed bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-6 border border-[#0A4A6E] h-[15%] relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* close button*/}
                <button
                    onClick={handleClose}
                    className="absolute top-2 left-2 text-[#0A4A6E] hover:bg-gray-100 rounded-full"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center justify-center">
                    <button
                        onClick={() => document.getElementById("file-upload").click()}
                        className="flex flex-col items-center text-[#0A4A6E]"
                    >
                        <p className="text-3xl">📸</p>
                        <p className="text-sm font-semibold">upload photos?</p>
                    </button>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>
        </div>
    );
}
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
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-end"
            onClick={handleOverlayClick}
        >
            <div
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg flex flex-col items-center p-6"
                style={{ height: '25%', paddingTop: '50px' }} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* close button*/}
                <button
                    onClick={handleClose}
                    className="absolute top-4 left-4 p-2 text-[#0A4A6E] hover:bg-gray-100 rounded-full"
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-12 h-12"
                        >
                            <path
                                fillRule="evenodd"
                                d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="mt-2 font-medium">Choose photos</p>
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
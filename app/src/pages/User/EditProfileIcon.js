import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/solid';
import { PencilIcon } from '@heroicons/react/24/solid';

export default function EditIcon() {
    const navigate = useNavigate();
    const [icon, setIcon] = useState('');
    const [bgColour, setBgColour] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const colours = ['#A5C3DE', '#F7C59F', '#DCD6F7', '#F6A6B2', '#C8E3D4', '#FFD6A5', '#D9E5FF', '#E6E6FA', '#FBE7A1', '#FFB3C1', '#FFF9B1', '#9AD4EB', '#A5D8F3', '#C7E9F1', '#FFB6B9', '#FADADD'];
    const [isLoading, setIsLoading] = useState(false);

    // get icon and background
    useEffect(() => {
        const fetchUserIcon = async () => {
            if (!auth.currentUser) return;

            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setIcon(userData.icon);
                setBgColour(userData.bgColour);
            }
        };

        fetchUserIcon();
    }, []);

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                icon: icon,
                bgColour: bgColour,
            });
            alert('Icon updated!');
            navigate(-1);
        } catch (error) {
            console.error('Error updating icon:', error);
            alert('Failed to update.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5 relative">

            {/* back */}
            <button onClick={() => navigate(-1)} className="absolute top-6 left-6">
                <ArrowLeftCircleIcon className="w-8 h-8 text-current" />
            </button>
            <h1 className="text-2xl font-semibold">Edit Icon</h1>

            {/* current icon */}
            <div className="relative mt-8">
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-2 border-white shadow-md"
                    style={{ backgroundColor: bgColour }}
                >
                    {icon}
                </div>
                {/* pen icon */}
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-200"
                >
                    <PencilIcon className="w-4 h-4 text-current" />
                </button>
            </div>

            {/* emoji oicker */}
            {showEmojiPicker && (
                <div className="mt-4">
                    <Picker
                        data={data}
                        onEmojiSelect={(emoji) => {
                            setIcon(emoji.native);
                            setShowEmojiPicker(false);
                        }}
                    />
                </div>
            )}

            {/* choose background */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 px-10 py-8">
                {colours.map((colour, idx) => (
                    <div
                        key={idx}
                        onClick={() => setBgColour(colour)}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-md"
                        style={{ backgroundColor: colour }}
                    />
                ))}
            </div>

            {/* save */}
            <button
                onClick={handleSave}
                disabled={isLoading}
                className="py-2 px-4 mt-8 rounded-lg font-medium text-center transition-colors text-white bg-[#0A4A6E]"
            >
                {isLoading ? 'Saving...' : 'Save'}
            </button>
        </div>
    );
}
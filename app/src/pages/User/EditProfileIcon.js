import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/solid';
import FormButton from '../../components/FormButton';
import Picker from "emoji-picker-react";

export default function EditIcon({ onClose }) {
    const navigate = useNavigate();
    const [icon, setIcon] = useState('');
    const [bgColour, setBgColour] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const colours = ['#A5C3DE', '#F7C59F', '#DCD6F7', '#F6A6B2', '#C8E3D4', '#FFD6A5', '#D9E5FF', '#E6E6FA', '#FBE7A1', '#FFB3C1', '#FFF9B1', '#9AD4EB', '#A5D8F3', '#C7E9F1', '#FFB6B9', '#FADADD'];
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
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
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 w-70 max-h-[80vh] overflow-y-auto relative items-center border border-[#0A4A6E] mx-8 flex flex-col justify-center">

            {/* back */}
            <button onClick={onClose} className="absolute top-6 left-6">
                <ArrowLeftCircleIcon className="w-8 h-8 text-current" />
            </button>

            {/* current icon */}
            <div className="relative mt-8 flex justify-center">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 border-white shadow-md"
                    style={{ backgroundColor: bgColour }}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                    {icon}
                </div>
            </div>

            {/* emoji picker */}
            {showEmojiPicker && (
                <div>
                    <Picker
                        onEmojiClick={(emojiData, event) => {
                            setIcon(emojiData.emoji);
                            setShowEmojiPicker(false);
                        }}
                        searchPlaceholder="Search emojis..."
                        disableAutoFocusSearch
                    />
                </div>
            )}

            {/* choose background */}
            <div className="flex flex-wrap justify-center gap-3 py-8">
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
            <FormButton
                loading={loading}
                type="button"
                onClick={handleSave}
                loadingText="Saving..."
                fullWidth={false}
            >
                Save
            </FormButton>
        </div>
    );
}
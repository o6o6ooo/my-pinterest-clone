import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Masonry from 'react-masonry-css';

export default function HomeFeed() {
    const navigate = useNavigate();

    const [photos, setPhotos] = useState([]);
    const [selectedTab, setSelectedTab] = useState('all');
    const [showPreview, setShowPreview] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [groups, setGroups] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [showEditOverlay, setShowEditOverlay] = useState(false);
    const [year, setYear] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // adjust number of columns
    const breakpointColumnsObj = {
        default: 5,
        1200: 4,
        992: 3,
        768: 2,
    };

    // get photos, hashtags and groups
    useEffect(() => {
        if (!auth.currentUser) return;

        const fetchPhotos = async () => {
            const q = query(collection(db, 'photos'));
            const snapshot = await getDocs(q);
            const photoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPhotos(photoData);
        };

        const fetchGroups = async () => {
            const q = query(collection(db, 'groups'));
            const snapshot = await getDocs(q);
            const groupData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(group => group.members.includes(auth.currentUser.uid));
            setGroups(groupData);
        };

        const fetchUserHashtags = async () => {
            if (!auth.currentUser) return;

            const q = query(
                collection(db, 'user_hashtag_settings'),
                where('user_id', '==', auth.currentUser.uid),
                where('show_in_feed', '==', true)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => doc.data());
            setHashtags(data);
        };

        fetchPhotos();
        fetchGroups();
        fetchUserHashtags();

    }, []);

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'favourites', label: 'Favourites' },
        ...groups.map(group => ({
            key: `group-${group.id}`,
            label: `Group: ${group.group_name}`,
        })),
        ...hashtags.map(tag => ({
            key: `hashtag-${tag.hashtag}`,
            label: tag.hashtag,
        })),
    ];

    // filtering
    const filteredPhotos = photos.filter(photo => {
        if (selectedTab === 'all') return true;
        if (selectedTab === 'favourites') return photo.favourites?.includes(auth.currentUser.uid);
        if (selectedTab.startsWith('group-')) {
            const groupId = selectedTab.replace('group-', '');
            return photo.group_id === groupId;
        }
        if (selectedTab.startsWith('hashtag-')) {
            const hashtag = selectedTab.replace('hashtag-', '');
            // ハッシュタグは小文字で保存している想定なので小文字比較を推奨
            return photo.hashtags?.some(tag => tag.toLowerCase() === hashtag.toLowerCase());
        }
        return true;
    });

    // fovourite switch
    const handleToggleFavourite = async (photoId) => {
        if (!auth.currentUser) return;

        const photoRef = doc(db, 'photos', photoId);
        const isFavourite = selectedPhoto.favourites?.includes(auth.currentUser.uid);

        try {
            await updateDoc(photoRef, {
                favourites: isFavourite
                    ? arrayRemove(auth.currentUser.uid)
                    : arrayUnion(auth.currentUser.uid),
            });

            // save favourite
            setPhotos((prevPhotos) =>
                prevPhotos.map((photo) =>
                    photo.id === photoId
                        ? {
                            ...photo,
                            favourites: isFavourite
                                ? photo.favourites.filter(uid => uid !== auth.currentUser.uid)
                                : [...(photo.favourites || []), auth.currentUser.uid],
                        }
                        : photo
                )
            );

            setSelectedPhoto((prev) => ({
                ...prev,
                favourites: isFavourite
                    ? prev.favourites.filter(uid => uid !== auth.currentUser.uid)
                    : [...(prev.favourites || []), auth.currentUser.uid],
            }));
        } catch (error) {
            console.error('Failed to toggle favourite:', error);
            alert('Failed to update favourite status.');
        }
    };

    // open/close preview
    const openPreview = (photo) => {
        setSelectedPhoto(photo);
        setShowPreview(true);
    };
    const closePreview = () => {
        setShowPreview(false);
        setSelectedPhoto(null);
    };

    useEffect(() => {
        if (showPreview) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showPreview]);

    const openEditOverlay = () => {
        if (selectedPhoto?.hashtags?.length) {
            setTags(selectedPhoto.hashtags);
        } else {
            setTags([]);
        }
        setTagInput('');
        setYear(selectedPhoto?.year || '');
        setShowEditOverlay(true);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            const lowerCaseTag = tagInput.toLowerCase().startsWith('#')
                ? tagInput.toLowerCase()
                : '#' + tagInput.toLowerCase();
            if (!tags.includes(lowerCaseTag)) {
                setTags([...tags, lowerCaseTag]);
            }
            setTagInput('');
        }
    };

    // save update
    const handleSaveEdit = async () => {
        if (!selectedPhoto) return;
        setIsLoading(true);

        try {
            const photoRef = doc(db, 'photos', selectedPhoto.id);

            const updatedData = { year: year || null };
            if (tags.length > 0) {
                updatedData.hashtags = tags.map(tag => tag.toLowerCase());
            }

            await updateDoc(photoRef, updatedData);

            // 追加: 新しく追加されたタグだけ user_hashtag_settings に保存
            const userId = auth.currentUser.uid;

            // 既に保存されているユーザ設定取得
            const snapshot = await getDocs(query(
                collection(db, 'user_hashtag_settings'),
                where('user_id', '==', userId),
                where('group_id', '==', selectedPhoto.group_id) 
            ));
            const existingTags = snapshot.docs.map(doc => doc.data().hashtag);

            const newTags = tags.filter(tag => !existingTags.includes(tag.toLowerCase()));
            await Promise.all(newTags.map(async (tag) => {
                const docId = `${userId}_${tag.toLowerCase()}_${selectedPhoto.group_id}`;
                const settingRef = doc(db, 'user_hashtag_settings', docId);
                await setDoc(settingRef, {
                    user_id: userId,
                    hashtag: tag.toLowerCase(),
                    group_id: selectedPhoto.group_id,
                    show_in_feed: true,
                    updated_at: new Date(),
                }, { merge: true });
            }));

            // 更新
            setPhotos(prev =>
                prev.map(p => p.id === selectedPhoto.id ? { ...p, ...updatedData } : p)
            );
            setSelectedPhoto(prev => ({ ...prev, ...updatedData }));
            setShowEditOverlay(false);

            alert('Photo details updated successfully!');
        } catch (error) {
            console.error('Failed to update photo details:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const deletePhoto = async (photoId) => {
        try {
            await deleteDoc(doc(db, 'photos', photoId));
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            alert('Photo deleted.');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete photo.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-4 pb-20">
            {/* タブバー */}
            <div className="sticky top-0 z-10 bg-[#A5C3DE] flex gap-2 py-2 overflow-x-auto whitespace-nowrap no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setSelectedTab(tab.key)}
                        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${selectedTab === tab.key ? 'bg-[#0A4A6E] text-white' : 'bg-white text-[#0A4A6E]'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Masonry グリッド */}
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {filteredPhotos.map(photo => (
                    <div key={photo.id} onClick={() => openPreview(photo)} className="relative cursor-pointer">
                        <img
                            src={photo.photo_url}
                            alt=""
                            className="w-full rounded-xl object-cover"
                        />
                    </div>
                ))}
            </Masonry>

            {/* プレビュー */}
            {showPreview && selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto bg-black bg-opacity-70"
                    onClick={() => {
                        closePreview();
                      }}
                >
                    <div className="max-w-[90vw] max-h-[90vh] relative" onClick={(e) => {
                        e.stopPropagation();
                    }}>
                        <img
                            src={selectedPhoto.photo_url}
                            alt=""
                            className="max-w-full max-h-full rounded-xl"
                        />
                        {/* 年・ハッシュタグ・ハート */}
                        <div className="absolute bottom-0 left-0 right-0 text-white p-2 flex flex-wrap gap-2 items-center justify-between rounded-b-xl">
                            <span className="text-xs bg-white text-[#0A4A6E] rounded px-2 py-1 font-medium">{selectedPhoto.year}</span>
                            <div className="flex gap-1 flex-wrap">
                                {selectedPhoto.hashtags?.map((tag, idx) => (
                                    <span key={idx} className="text-xs bg-white text-[#0A4A6E] rounded px-2 py-1 font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="absolute bottom-40 -left-3 flex flex-col gap-3 z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavourite(selectedPhoto.id);
                                    }}
                                    className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow text-xl"
                                >
                                    {selectedPhoto.favourites?.includes(auth.currentUser.uid) ? '❤️' : '🤍'}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditOverlay();
                                    }}
                                    className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow text-xl"
                                >
                                    ⚙️
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this photo?')) {
                                            deletePhoto(selectedPhoto.id);
                                            closePreview();
                                        }
                                    }}
                                    className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow text-xl"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        {/* 閉じるボタン */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closePreview();
                            }}
                            className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* photo edit overlay */}
            {showEditOverlay && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={() => setShowEditOverlay(false)} // 背景クリックで閉じる
                >
                    <div
                        className="bg-transparent p-4 flex flex-col items-center gap-4 w-full max-w-xs"
                        onClick={(e) => e.stopPropagation()} // 中のクリックでは閉じない
                    >
                        {/* Year */}
                        <div className="relative w-full">
                            <label htmlFor="year" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                                Year
                            </label>
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                            />
                        </div>

                        {/* Hashtags */}
                        <div className="w-full flex flex-col gap-2">
                            <div className="relative w-full">
                                <label htmlFor="tag" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                                    Hashtags
                                </label>
                                <input
                                    id="tag"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                                    placeholder=""
                                />
                            </div>

                            {/* Selected tags */}
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="flex items-center bg-[#0A4A6E] text-white text-xs font-medium rounded-full px-3 py-1 cursor-pointer"
                                        onClick={() => {
                                            setTags(tags.filter((_, i) => i !== index));
                                        }}
                                    >
                                        {tag}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-3 h-3 ml-1"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 保存ボタン */}
                        <button
                            onClick={handleSaveEdit}
                            className={`py-2 px-4 mt-4 rounded-lg font-medium text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0A4A6E]'}`}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
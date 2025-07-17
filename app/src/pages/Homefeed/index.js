import { useEffect, useState } from 'react';
import { collection, getDocs, getDoc, query, where, doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Masonry from 'react-masonry-css';
import cleanInput from '../../utils/cleanInput';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Loading from '../../components/Loading';

export default function HomeFeed() {

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
    const [loading, setLoading] = useState(false);

    // adjust number of columns
    const breakpointColumnsObj = {
        default: 5,
        1200: 4,
        992: 3,
        768: 2,
    };

    // fetch groups, photos and hashtags
    useEffect(() => {
        if (!auth.currentUser) return;

        const fetchUserGroupsAndPhotos = async () => {
            try {
                setLoading(true);

                // 1. get group_id from user collection
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (!userDoc.exists()) {
                    console.error('User document not found');
                    return;
                }

                const userData = userDoc.data();
                const groupIds = userData.groups || [];

                if (groupIds.length === 0) {
                    setGroups([]);
                    setPhotos([]);
                    return;
                }

                // 2. get group details
                const groupDocs = await Promise.all(
                    groupIds.map(async (gid) => {
                        const gDoc = await getDoc(doc(db, 'groups', gid));
                        return gDoc.exists() ? { id: gDoc.id, ...gDoc.data() } : null;
                    })
                );

                const validGroups = groupDocs.filter(g => g !== null);
                setGroups(validGroups);

                // 3. get photos
                const photosQuery = query(
                    collection(db, 'photos'),
                    where('group_id', 'in', groupIds)
                );
                const photoSnap = await getDocs(photosQuery);
                const photoData = photoSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                photoData.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));

                // 4. get posted_by user info
                const userIds = [...new Set(photoData.map(photo => photo.posted_by))];
                const userDocs = await Promise.all(
                    userIds.map(async (uid) => {
                        const userDoc = await getDoc(doc(db, 'users', uid));
                        return userDoc.exists() ? { uid, ...userDoc.data() } : null;
                    })
                );
                const userMap = {};
                userDocs.filter(u => u).forEach(user => {
                    userMap[user.uid] = user;
                });

                // 5. get signed URLs for photos
                const idToken = await auth.currentUser.getIdToken();
                const publicIds = photoData.map(photo => photo.photo_url);

                const response = await fetch(
                    process.env.NODE_ENV === 'development'
                        ? 'http://192.168.4.48:5001/api/cloudinary-signed-urls'
                        : 'https://kuusi.onrender.com/api/cloudinary-signed-urls',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({ publicIds }),
                    }
                );

                const signedUrls = await response.json();

                const photoDataWithExtras = photoData.map(photo => ({
                    ...photo,
                    signedUrl: signedUrls[photo.photo_url],
                    posted_by_user: userMap[photo.posted_by] || null,
                }));

                setPhotos(photoDataWithExtras);
            } catch (error) {
                console.error('Error fetching groups and photos:', error);
            } finally {
                setLoading(false);
            }
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

        (async () => {
            await Promise.all([fetchUserGroupsAndPhotos(), fetchUserHashtags()]);
        })();
    }, []);

    // filter photos by user's groups
    const userGroupIds = groups.map(g => g.id);

    const filteredPhotos = photos.filter(photo => {
        // exclude photos not in user's groups
        if (!userGroupIds.includes(photo.group_id)) return false;

        if (selectedTab === 'all') return true;
        if (selectedTab === 'favourites') return photo.favourites?.includes(auth.currentUser.uid);
        if (selectedTab.startsWith('group-')) {
            const groupId = selectedTab.replace('group-', '');
            return photo.group_id === groupId;
        }
        if (selectedTab.startsWith('hashtag-')) {
            const hashtag = selectedTab.replace('hashtag-', '').toLowerCase();
            return photo.hashtags?.some(tag => tag.toLowerCase() === hashtag);
        }
        return true;
    });

    // dedupe hashtags by lowercase tag text for tab bar
    const uniqueHashtags = Object.values(
        hashtags.reduce((acc, tag) => {
            const lowerTag = tag.hashtag.toLowerCase();
            if (!acc[lowerTag]) acc[lowerTag] = tag;
            return acc;
        }, {})
    );

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'favourites', label: 'Favourites' },
        ...groups.map(group => ({
            key: `group-${group.id}`,
            label: `Group: ${group.group_name}`,
        })),
        ...uniqueHashtags.map(tag => ({
            key: `hashtag-${tag.hashtag}`,
            label: tag.hashtag,
        })),
    ];

    // favourite toggle
    const handleToggleFavourite = async (photoId) => {
        if (!auth.currentUser) return;
        if (!selectedPhoto) return;

        const photoRef = doc(db, 'photos', photoId);
        const isFavourite = selectedPhoto.favourites?.includes(auth.currentUser.uid);

        try {
            await updateDoc(photoRef, {
                favourites: isFavourite
                    ? arrayRemove(auth.currentUser.uid)
                    : arrayUnion(auth.currentUser.uid),
            });

            setPhotos(prevPhotos =>
                prevPhotos.map(photo =>
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

            setSelectedPhoto(prev => ({
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

    // preview open/close
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

    // edit overlay open
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
            const cleaned = cleanInput(tagInput, { toLowerCase: true, ensureHash: true });
            if (!tags.includes(cleaned)) {
                setTags([...tags, cleaned]);
            }
            setTagInput('');
        }
    };

    // save edit update
    const handleSaveEdit = async () => {
        if (!selectedPhoto) return;
        setLoading(true);

        try {
            const photoRef = doc(db, 'photos', selectedPhoto.id);

            const updatedData = { year: year || null };
            if (tags.length > 0) {
                updatedData.hashtags = tags.map(tag => tag.toLowerCase());
            }

            await updateDoc(photoRef, updatedData);

            const userId = auth.currentUser.uid;

            // get existing user hashtag settings by user + group
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
            setLoading(false);
        }
    };

    const deletePhoto = async (photoId, publicId) => {
        try {
            const API_BASE_URL =
                process.env.NODE_ENV === 'development'
                    ? 'http://192.168.4.48:5001'
                    : 'https://kuusi.onrender.com';

            console.log('API Base URL:', API_BASE_URL);
            console.log('Deleting photo with publicId:', publicId);

            const token = await auth.currentUser.getIdToken();

            // delete from Firestore
            await deleteDoc(doc(db, 'photos', photoId));

            // delete from Cloudinary
            const res = await fetch(`${API_BASE_URL}/api/delete-photo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Firebase IDトークン
                },
                body: JSON.stringify({ publicId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Unknown delete error');
            }

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

            {/* Masonry grid layout */}
            {loading ? (
                <Loading />
            ) : (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {filteredPhotos.map(photo => (
                        <div key={photo.id} onClick={() => openPreview(photo)} className="relative cursor-pointer">
                            <img
                                src={photo.signedUrl}
                                alt=""
                                className="w-full rounded-xl object-cover"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </Masonry>
            )}

            {/* preview */}
            {showPreview && selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-70 bottom-[10vh]"
                    onClick={() => {
                        closePreview();
                    }}
                >
                    <div
                        className="max-w-[90vw] max-h-[90vh] relative"
                        onClick={(e) => {
                            e.stopPropagation();
                            closePreview();
                        }}
                    >
                        {/* photo */}
                        <img
                            src={selectedPhoto.signedUrl}
                            alt=""
                            className="max-w-full max-h-[70vh] rounded-xl"
                        />

                        {/* year and hashtags */}
                        <div className="absolute bottom-0 left-0 right-0 text-white p-2 flex flex-wrap gap-2 items-center justify-between rounded-b-xl">
                            <span className="text-xs bg-white text-[#0A4A6E] rounded px-2 py-1 font-medium">
                                {selectedPhoto.year}
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {selectedPhoto.hashtags?.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-white text-[#0A4A6E] rounded px-2 py-1 font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* user icon and buttons */}
                        {selectedPhoto.posted_by_user && (
                            <div className="absolute left-0 -bottom-12 flex items-center gap-2 z-10">
                                <div
                                    className="rounded-full text-2xl w-10 h-10 flex items-center justify-center border-2 border-white shadow-md"
                                    style={{
                                        backgroundColor:
                                            selectedPhoto.posted_by_user.bgColour,
                                    }}
                                >
                                    {selectedPhoto.posted_by_user.icon}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavourite(selectedPhoto.id);
                                    }}
                                    className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow text-xl"
                                >
                                    {selectedPhoto.favourites?.includes(
                                        auth.currentUser.uid
                                    )
                                        ? '❤️'
                                        : '🤍'}
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
                                        if (
                                            window.confirm(
                                                'Are you sure you want to delete this photo?'
                                            )
                                        ) {
                                            deletePhoto(selectedPhoto.id, selectedPhoto.photo_url);
                                            closePreview();
                                        }
                                    }}
                                    className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow text-xl"
                                >
                                    🗑️
                                </button>
                            </div>
                        )}

                        {/* close */}
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
                        <FormInput
                            label="Year"
                            id="year"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={year}
                            onChange={(e) => setYear(cleanInput(e.target.value))}
                            disabled={loading}
                        />

                        {/* Hashtags */}
                        <div className="w-full flex flex-col gap-2">
                            <FormInput
                                id="tag"
                                label="Hashtags"
                                value={tagInput}
                                onChange={(e) => setTagInput(cleanInput(e.target.value, { toLowerCase: false }))}
                                onKeyDown={handleTagKeyDown}
                                disabled={loading}
                            />

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
                                        <XMarkIcon className="w-3 h-3 ml-1 text-white" />
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* save */}
                        <FormButton
                            loading={loading}
                            type="button"
                            onClick={handleSaveEdit}
                            loadingText="Saving..."
                            fullWidth={false}
                        >
                            Save
                        </FormButton>
                    </div>
                </div>
            )}
        </div>
    );
}
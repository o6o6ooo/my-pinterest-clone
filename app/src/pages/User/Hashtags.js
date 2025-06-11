import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function Hashtags() {
    const navigate = useNavigate();
    const [hashtags, setHashtags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState([]);

    // get hashtags
    useEffect(() => {
        const fetchHashtags = async () => {
            if (!auth.currentUser) return;
            try {
                const groupSnapshot = await getDocs(query(
                    collection(db, 'groups'),
                    where('members', 'array-contains', auth.currentUser.uid)
                ));
                const groupIds = groupSnapshot.docs.map(doc => doc.id);

                if (groupIds.length === 0) {
                    setHashtags([]);
                    return;
                }

                const promises = groupIds.map(groupId =>
                    getDocs(query(
                        collection(db, 'user_hashtag_settings'),
                        where('group_id', '==', groupId)
                    ))
                );
                const snapshots = await Promise.all(promises);

                let allSettings = [];
                snapshots.forEach(snapshot => {
                    snapshot.docs.forEach(doc => {
                        allSettings.push({ id: doc.id, ...doc.data() });
                    });
                });

                const settingSnapshot = await getDocs(query(
                    collection(db, 'user_hashtag_settings'),
                    where('user_id', '==', auth.currentUser.uid)
                ));
                const settingsMap = {};
                settingSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    settingsMap[data.hashtag] = data.show_in_feed;
                });

                const uniqueHashtagsMap = {};
                allSettings.forEach(setting => {
                    const tag = setting.hashtag;
                    if (!uniqueHashtagsMap[tag] || setting.user_id === auth.currentUser.uid) {
                        uniqueHashtagsMap[tag] = {
                            ...setting,
                            show_in_feed: settingsMap.hasOwnProperty(tag) ? settingsMap[tag] : false
                        };
                    }
                });

                const mergedData = Object.values(uniqueHashtagsMap);
                setHashtags(mergedData);
            } catch (error) {
                console.error('Error fetching hashtags:', error);
                setErrors(['Failed to load hashtags.']);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHashtags();
    }, []);

    // hashtag switches
    const toggleShowInFeed = (index) => {
        const updated = [...hashtags];
        updated[index].show_in_feed = !updated[index].show_in_feed;
        setHashtags(updated);
    };

    // save
    const handleSave = async () => {
        setIsLoading(true);
        setErrors([]);
        setSuccessMessage('');

        try {
            await Promise.all(
                hashtags.map(async (hashtag) => {
                    const q = query(
                        collection(db, 'user_hashtag_settings'),
                        where('user_id', '==', auth.currentUser.uid),
                        where('hashtag', '==', hashtag.hashtag)
                    );
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        if (hashtag.group_id) {
                            const docId = `${auth.currentUser.uid}_${hashtag.hashtag}_${hashtag.group_id}`;
                            const userSettingRef = doc(db, 'user_hashtag_settings', docId);
                            await setDoc(userSettingRef, {
                                user_id: auth.currentUser.uid,
                                hashtag: hashtag.hashtag,
                                group_id: hashtag.group_id,
                                show_in_feed: hashtag.show_in_feed,
                                updated_at: new Date(),
                            });
                        }
                    } else {
                        // 既存レコードがある場合はすべて更新(fix needed)
                        await Promise.all(snapshot.docs.map(docSnapshot => {
                            const userSettingRef = doc(db, 'user_hashtag_settings', docSnapshot.id);
                            return setDoc(userSettingRef, {
                                user_id: auth.currentUser.uid,
                                hashtag: hashtag.hashtag,
                                group_id: docSnapshot.data().group_id,
                                show_in_feed: hashtag.show_in_feed,
                                updated_at: new Date(),
                            }, { merge: true });
                        }));
                    }
                })
            );
            setSuccessMessage('Hashtags updated successfully!');
        } catch (error) {
            console.error('Error updating hashtags:', error);
            setErrors(['Failed to update hashtags.']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5">
            {/* back */}
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                </svg>
            </button>

            <h1 className="text-xl font-semibold">Choose hashtags</h1>
            <h1 className="text-xl font-semibold mb-5">shown in homefeed</h1>

            {/* loading */}
            {isLoading ? (
                <p className="mt-10 text-center">Loading hashtags...</p>
            ) : (
                <div className="flex flex-wrap gap-5 mt-5 max-w-sm px-6 justify-center">
                    {hashtags.map((hashtag, index) => (
                        <button
                            key={hashtag.id}
                            onClick={() => toggleShowInFeed(index)}
                            className={`px-3 py-1 rounded-full text-base font-medium ${hashtag.show_in_feed ? 'bg-[#0A4A6E] text-white' : 'bg-white text-[#0A4A6E]'
                                }`}
                        >
                            {hashtag.hashtag}
                        </button>
                    ))}
                </div>
            )}

            {/* save */}
            <button
                onClick={handleSave}
                disabled={isLoading}
                className={`py-2 px-4 mt-10 rounded-lg font-medium text-center transition-colors text-white ${isLoading ? 'bg-[#0A4A6E]/50' : 'bg-[#0A4A6E]'
                    }`}
            >
                {isLoading ? 'Saving...' : 'Save'}
            </button>

            {/* errors */}
            {errors.length > 0 && (
                <div className="max-w-xs mt-4 p-3 text-red-600 text-sm font-medium space-y-1">
                    {errors.map((error, i) => (
                        <p key={i}>{error}</p>
                    ))}
                </div>
            )}

            {/* success */}
            {successMessage && (
                <div className="max-w-xs mt-4 p-3 text-[#0A4A6E] text-sm font-medium">
                    {successMessage}
                </div>
            )}
        </div>
    );
}
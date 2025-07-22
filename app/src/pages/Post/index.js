import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs, setDoc, doc } from 'firebase/firestore';
import cleanInput from '../../utils/cleanInput';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import FormDropdown from '../../components/FormDropdown';
import { XMarkIcon } from '@heroicons/react/24/solid';
import imageCompression from 'browser-image-compression';

export default function Post() {
    const location = useLocation();
    const navigate = useNavigate();
    const [files, setFiles] = useState(location.state?.files || []);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [showFullScreen, setShowFullScreen] = useState(false);
    const [year, setYear] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [userGroups, setUserGroups] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const currentYear = new Date().getFullYear();

    const handleThumbnailClick = () => {
        setShowFullScreen(true);
    };

    // when hit enter confirms the hashtag
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

    // delete hashtags
    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // remove photos with x button
    const handleRemoveFile = (indexToRemove) => {
        // 解放するURLを忘れずに
        URL.revokeObjectURL(previewUrls[indexToRemove]);
        const newFiles = [...files];
        const newPreviews = [...previewUrls];
        newFiles.splice(indexToRemove, 1);
        newPreviews.splice(indexToRemove, 1);
        setFiles(newFiles);
        setPreviewUrls(newPreviews);
    };

    // set year
    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    // post
    const handleUpload = async () => {

        // validation check
        const newErrors = [];
        if (year) {
            const numYear = Number(year);
            if (isNaN(numYear) || numYear < 1950 || numYear > currentYear) {
                newErrors.push('Please enter a year between 1950 and the current year.');
            }
        } else {
            newErrors.push('Year is required.');
        }

        if (tags.length > 5) newErrors.push('You can add up to 5 hashtags.');
        if (!selectedGroup) newErrors.push('Please select a group.');
        setErrors(newErrors);
        if (newErrors.length > 0) return;

        const options = {
            maxWidthOrHeight: 1920,
            maxSizeMB: 0.3,
            useWebWorker: true,
        };

        try {
            setLoading(true);
            const idToken = await auth.currentUser.getIdToken();
            const UPLOAD_URL =
                process.env.NODE_ENV === 'development'
                    ? 'http://192.168.4.48:5001/api/upload'
                    : 'https://kuusi.onrender.com/api/upload';
            const userId = auth.currentUser.uid;

            // Loop through each file
            for (const file of files) {

                const compressedFile = await imageCompression(file, options);

                const formData = new FormData();
                formData.append('image', compressedFile);

                const response = await fetch(UPLOAD_URL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');
                const data = await response.json();

                if (!data.public_id) throw new Error('Cloudinary did not return a public_id');

                const photoData = {
                    photo_url: data.public_id,
                    group_id: selectedGroup.id,
                    posted_by: userId,
                    year: year || null,
                    hashtags: tags.map(tag => tag.toLowerCase()),
                    file_size: Math.round(compressedFile.size / 1024 / 1024 * 100) / 100, // size in MB
                    created_at: serverTimestamp(),
                };

                await addDoc(collection(db, 'photos'), photoData);
            }

            // Save hashtag settings (once per tag, not per file)
            await Promise.all(tags.map(async (tag) => {
                const docId = `${userId}_${tag.toLowerCase()}_${selectedGroup.id}`;
                const settingRef = doc(db, 'user_hashtag_settings', docId);
                await setDoc(settingRef, {
                    user_id: userId,
                    hashtag: tag.toLowerCase(),
                    group_id: selectedGroup.id,
                    show_in_feed: true,
                    updated_at: new Date(),
                }, { merge: true });
            }));

            alert('Upload and save complete!');
            navigate('/home');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload one or more files.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserGroups = async () => {
            if (!auth.currentUser) return;
            const snapshot = await getDocs(collection(db, 'groups'));
            const groups = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(group => group.members.includes(auth.currentUser.uid));
            setUserGroups(groups);
        };
        fetchUserGroups();
    }, []);

    useEffect(() => {
        if (!files.length) {
            navigate(-1);
        }
    }, [files, navigate]);

    useEffect(() => {
        const newUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(newUrls);

        return () => {
            newUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-4 relative">
            {/* thumbnail preview */}
            <div className="relative w-32 h-32 mt-4 cursor-pointer" onClick={handleThumbnailClick}>
                {previewUrls.slice(0, 5).map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded shadow absolute"
                        style={{
                            left: index * 10,
                            zIndex: files.length - index,
                        }}
                    />
                ))}
                {/* badge */}
                {files.length > 1 && !showFullScreen && (
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs" style={{ zIndex: 1000 }}>
                        {files.length}
                    </div>
                )}
            </div>

            <div className="w-full max-w-xs flex flex-col gap-3">
                {/* Year */}
                <FormInput
                    label="Year"
                    id="year"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={year}
                    onChange={handleYearChange}
                    disabled={loading}
                />

                {/* Hashtags */}
                <FormInput
                    id="tag"
                    label="Hashtags"
                    value={tagInput}
                    onChange={(e) => setTagInput(cleanInput(e.target.value, { toLowerCase: false }))}
                    onKeyDown={handleTagKeyDown}
                    disabled={loading}
                />

                {/* selected tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="flex items-center bg-[#0A4A6E] text-white text-xs font-medium rounded-full px-3 py-1 cursor-pointer"
                                onClick={() => handleRemoveTag(index)}
                            >
                                {tag}
                                <XMarkIcon className="w-3 h-3 ml-1 text-white" />
                            </span>
                        ))}
                    </div>
                )}

                {/* Group Dropdown */}
                <FormDropdown
                    label="Group"
                    id="group-select"
                    options={userGroups}
                    selected={selectedGroup}
                    onSelect={setSelectedGroup}
                    disabled={loading}
                />

                {/* post button */}
                <FormButton
                    loading={loading}
                    type="button"
                    onClick={handleUpload}
                    loadingText="Posting..."
                    fullWidth={false}
                >
                    Post
                </FormButton>
            </div>

            {/* loading */}
            {loading && (
                <div className="max-w-xs mt-2 text-[#0A4A6E] text-sm font-medium">
                    Loading...
                </div>
            )}

            {/* validation errors */}
            {errors.length > 0 && (
                <div className="max-w-xs mt-4 p-3 text-red-600 text-sm font-medium space-y-1">
                    {errors.map((error, i) => (
                        <p key={i}>{error}</p>
                    ))}
                </div>
            )}

            {/* full screen preview */}
            {showFullScreen && (
                <div
                    className="fixed inset-0 bg-[#A5C3DE] bg-opacity-80 z-50 flex items-center justify-center"
                    onClick={() => setShowFullScreen(false)}
                >
                    <div className="flex gap-4 overflow-x-auto">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={url}
                                    alt="full preview"
                                    className="max-h-[80vh] max-w-[80vw] rounded-xl"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile(index);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    aria-label="Remove image"
                                >
                                    <XMarkIcon className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
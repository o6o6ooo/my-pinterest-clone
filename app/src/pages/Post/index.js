import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs, setDoc, doc } from 'firebase/firestore'; 
import cleanInput from '../../utils/cleanInput';

export default function Post() {
    const location = useLocation();
    const navigate = useNavigate();
    const [files, setFiles] = useState(location.state?.files ||[]);
    const [showFullScreen, setShowFullScreen] = useState(false);
    const [year, setYear] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userGroups, setUserGroups] = useState([]);
    const [errors, setErrors] = useState([]);
    const currentYear = new Date().getFullYear();
    const [isLoading, setIsLoading] = useState(false);

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
        const newFiles = [...files];
        newFiles.splice(indexToRemove, 1);
        setFiles(newFiles);
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
        }
        if (tags.length > 5) newErrors.push('You can add up to 5 hashtags.');
        if (!selectedGroup) newErrors.push('Please select a group.');
        setErrors(newErrors);
        if (newErrors.length > 0) return;

        try {
            setIsLoading(true);
            const idToken = await auth.currentUser.getIdToken();

            // upload to Cloudinary
            const formData = new FormData();
            formData.append('image', files[0]);

            const UPLOAD_URL =
                process.env.NODE_ENV === 'development'
                    ? 'http://localhost:5001/api/upload'
                    : 'https://kuusi.onrender.com/api/upload';

            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${idToken}`
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed.');
            const data = await response.json();
            console.log('Upload response data:', data);

            if (data.public_id) {
                // save photo in Firestore
                const photoData = {
                    photo_url: data.public_id,
                    group_id: selectedGroup.id,
                    year: year || null,
                    hashtags: tags.map(tag => tag.toLowerCase()),
                    created_at: serverTimestamp(),
                };

                await addDoc(collection(db, 'photos'), photoData);

                // save hashtags in Firestore
                const userId = auth.currentUser.uid;
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
            } else {
                alert('Cloudinary upload returned no URL.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload.');
        } finally {
            setIsLoading(false);
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-4 relative">
            {/* thummbnail preview */}
            <div className="relative w-32 h-32 mt-4 cursor-pointer" onClick={handleThumbnailClick}>
                {files.slice(0, 5).map((file, index) => (
                    <img
                        key={index}
                        src={URL.createObjectURL(file)}
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

            {/* Year */}
            <div className="relative w-full max-w-xs mt-5">
                <label htmlFor="year" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Year
                </label>
                <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="year"
                    value={year}
                    onChange={handleYearChange}
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                />
            </div>

            {/* Hashtags */}
            <div className="w-full max-w-xs flex flex-col gap-2 mt-5">
                <div className="relative w-full">
                    <label htmlFor="tag" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                        Hashtags
                    </label>
                    <input
                        id="tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(cleanInput(e.target.value, { toLowerCase: false }))}
                        onKeyDown={handleTagKeyDown}
                        className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                        placeholder=""
                    />
                </div>

                {/* selected tags */}
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="flex items-center bg-[#0A4A6E] text-white text-xs font-medium rounded-full px-3 py-1 cursor-pointer"
                            onClick={() => handleRemoveTag(index)}
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


            {/* Group */}
            <div className="relative w-full max-w-xs mt-5">
                <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Group
                </label>
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white flex justify-between items-center"
                >
                    {selectedGroup ? selectedGroup.group_name : "Select Group"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full mt-1 w-full border border-[#0A4A6E] rounded-lg bg-white shadow z-50">
                        {userGroups.map(group => (
                            <button
                                key={group.id}
                                className="w-full text-left p-3 hover:bg-gray-100 text-[#0A4A6E]"
                                onClick={() => {
                                    setSelectedGroup(group);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                {group.group_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* post button */}
            <button
                onClick={handleUpload}
                disabled={isLoading}
                className={`w-full py-3 mt-6 rounded-lg font-medium text-center transition-colors max-w-xs ${isLoading ? 'bg-[#0A4A6E] bg-opacity-70 cursor-not-allowed' : 'bg-[#0A4A6E] hover:bg-[#08324E]'
                    } text-white`}
            >
                {isLoading ? 'Posting...' : 'Post'}
            </button>

            {/* loading */}
            {isLoading && (
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
                        {files.map((file, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="full preview"
                                    className="max-h-[80vh] max-w-[80vw] rounded"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile(index);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    aria-label="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

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
    const [errors, setErrors] = useState([]);
    const currentYear = new Date().getFullYear();

    const handleThumbnailClick = () => {
        setShowFullScreen(true);
    };

    const handleTagInputChange = (e) => {
        let value = e.target.value;
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        setTagInput(value);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            if (!tags.includes(tagInput)) {
                setTags([...tags, tagInput]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleRemoveFile = (indexToRemove) => {
        const newFiles = [...files];
        newFiles.splice(indexToRemove, 1);
        setFiles(newFiles);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
      };
    
    const handleUpload = () => {

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
    
        console.log('Uploading:', { files, year, tags, selectedGroup });
    };

    useEffect(() => {
        if (!files.length) {
            navigate(-1);
        }
    }, [files, navigate]);

    const mockGroups = [
        { id: '1', name: 'Family' },
        { id: '2', name: 'Friends' },
        { id: '3', name: 'Work' },
    ];

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
                            left: index * 10, // 少しずつ右にズラす
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
                        onChange={handleTagInputChange}
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
                <label
                    htmlFor="group"
                    className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none"
                >
                    Group
                </label>
                <button
                    id="group"
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white flex justify-between items-center"
                >
                    {selectedGroup ? selectedGroup.name : "Select Group"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <div
                        className="absolute top-full mt-1 w-full border border-[#0A4A6E] rounded-lg bg-white shadow z-50"
                    >
                        {mockGroups.map(group => (
                            <button
                                key={group.id}
                                className="w-full text-left p-3 hover:bg-gray-100 text-[#0A4A6E]"
                                onClick={() => {
                                    setSelectedGroup(group);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* post button */}
            <button
                onClick={handleUpload}
                className="w-full py-3 mt-6 bg-[#0A4A6E] text-white rounded-lg font-medium text-center hover:bg-[#08324E] transition-colors max-w-xs"
            >
                Post
            </button>

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
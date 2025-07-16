import { useEffect, useState } from 'react';
import { collection, getDocs, getDoc, doc, query } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Masonry from 'react-masonry-css';
import Loading from '../../components/Loading';

export default function BrowseByYear() {
    const [photos, setPhotos] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        if (!auth.currentUser) return;

        const fetchPhotos = async () => {
            try {
                const q = query(collection(db, 'photos'));
                const snapshot = await getDocs(q);
                const photoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const userIds = [...new Set(photoData.map(p => p.posted_by))];
                const userDocs = await Promise.all(
                    userIds.map(async uid => {
                        const userDoc = await getDoc(doc(db, 'users', uid));
                        return { uid, ...userDoc.data() };
                    })
                );
                const userMap = {};
                userDocs.forEach(user => {
                    userMap[user.uid] = user;
                });

                const idToken = await auth.currentUser.getIdToken();
                const publicIds = photoData.map(p => p.photo_url);
                const res = await fetch(
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

                const signedUrls = await res.json();

                const enrichedPhotos = photoData.map(photo => ({
                    ...photo,
                    signedUrl: signedUrls[photo.photo_url],
                    posted_by_user: userMap[photo.posted_by] || null,
                }));

                const extractedYears = [...new Set(enrichedPhotos.map(p => p.year))].sort((a, b) => b - a);
                setYears(extractedYears);
                setSelectedYear(extractedYears[0] || null);
                setPhotos(enrichedPhotos);
            } catch (err) {
                console.error('Error loading photos:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, []);

    const filteredPhotos = selectedYear
        ? photos.filter(photo => photo.year === selectedYear)
        : photos;

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

    const breakpointColumnsObj = {
        default: 5,
        1200: 4,
        992: 3,
        768: 2,
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-4 pb-20">
            {/* タブバー */}
            <div className="sticky top-0 z-10 bg-[#A5C3DE] flex gap-2 py-2 overflow-x-auto whitespace-nowrap no-scrollbar">
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${selectedYear === year ? 'bg-[#0A4A6E] text-white' : 'bg-white text-[#0A4A6E]'}`}
                    >
                        {year}
                    </button>
                ))}
            </div>

            {/* Masonry layout */}
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
                                src={photo.signedUrl || photo.photo_url}
                                alt=""
                                className="w-full rounded-xl object-cover"
                            />
                        </div>
                    ))}
                </Masonry>
            )}

            {/* preview */}
            {showPreview && selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-70"
                    onClick={closePreview}
                >
                    <div
                        className="max-w-[90vw] max-h-[90vh] relative"
                        onClick={(e) => {
                            e.stopPropagation();
                            closePreview();
                        }}
                    >
                        <img
                            src={selectedPhoto.signedUrl || selectedPhoto.photo_url}
                            alt=""
                            className="max-w-full max-h-[70vh] rounded-xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 text-white p-2 flex justify-between items-center rounded-b-xl">
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

                        <button
                            onClick={closePreview}
                            className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
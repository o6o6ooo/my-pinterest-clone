import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import UploadOverlay from '../components/UploadOverlay';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const isUploadOpen = params.get('upload') === 'true';

    const handleCloseUpload = () => {
        params.delete('upload');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    return (
        <div className="relative text-[#0A4A6E]">
            <main>
                <AnimatePresence mode="wait" initial={false}>
                    <PageWrapper key={location.pathname}>
                        <Outlet />
                    </PageWrapper>
                </AnimatePresence>
            </main>
            <BottomNavBar />
            {isUploadOpen && <UploadOverlay isOpen={isUploadOpen} onClose={handleCloseUpload} />}
        </div>
    );
}
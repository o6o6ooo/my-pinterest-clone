import { Outlet, useLocation, useNavigate } from 'react-router-dom'; 
import BottomNavBar from '../components/BottomNavBar';
import UploadOverlay from '../components/UploadOverlay';

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const isUploadOpen = params.get('upload') === 'true';

    const handleCloseUpload = () => {
        // クエリパラメータだけを消す（ページは変えない）
        params.delete('upload');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    return (
        <div className="relative text-[#0A4A6E]">
            <main>
                <Outlet />
            </main>
            <BottomNavBar />
            {isUploadOpen && <UploadOverlay isOpen={isUploadOpen} onClose={handleCloseUpload} />}
        </div>
    );
  }
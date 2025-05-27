import { Outlet } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';

export default function MainLayout() {
    return (
        <div className="relative text-[#0A4A6E]" style={{ overflowY: 'auto' }}>
            <main className="pb-0"> {/* 下にナビバー分の余白 */}
                <Outlet />
            </main>
            <BottomNavBar />
        </div>
    );
}
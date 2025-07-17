import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

export default function MainLayout() {
    const location = useLocation();

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
        </div>
    );
}
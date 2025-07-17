import { useRef } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import {
    HomeIcon as HomeIconOutline,
    ClockIcon as ClockIconOutline,
    UserIcon as UserIconOutline,
    CameraIcon as CameraIconOutline,
} from '@heroicons/react/24/outline';

import {
    HomeIcon as HomeIconSolid,
    ClockIcon as ClockIconSolid,
    UserIcon as UserIconSolid,
    CameraIcon as CameraIconSolid,
} from '@heroicons/react/24/solid';

export default function BottomNavBar() {
    const tabs = [
        { name: 'Home', to: '/home', IconOutline: HomeIconOutline, IconSolid: HomeIconSolid },
        { name: 'BrowseByYear', to: '/browse-by-year', IconOutline: ClockIconOutline, IconSolid: ClockIconSolid },
        { name: 'User', to: '/user', IconOutline: UserIconOutline, IconSolid: UserIconSolid },
    ];
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Postページにファイルを渡す
            navigate('/post', { state: { files: Array.from(files) } });
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-evenly px-4 py-4 z-50 md:hidden bg-[#A5C3DE] h-[10vh]">
            {/* home, browse by year */}
            {tabs.slice(0, 2).map(({ name, to, IconOutline, IconSolid }) => (
                <NavLink
                    key={name}
                    to={to}
                    className={({ isActive }) =>
                        `flex flex-col items-center text-xs ${isActive ? 'text-[#0A4A6E]' : 'text-[#0A4A6E]'}`
                    }
                >
                    {({ isActive }) => (
                        isActive
                            ? <IconSolid className="w-8 h-8" />
                            : <IconOutline className="w-8 h-8" />
                    )}
                </NavLink>
            ))}

            {/* upload */}
            <button
                onClick={() => fileInputRef.current.click()}
                className="flex flex-col items-center text-xs text-[#0A4A6E]"
            >
                <CameraIconOutline className="w-8 h-8" />
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* user */}
            {tabs.slice(2).map(({ name, to, IconOutline, IconSolid }) => (
                <NavLink
                    key={name}
                    to={to}
                    className={({ isActive }) =>
                        `flex flex-col items-center text-xs ${isActive ? 'text-[#0A4A6E]' : 'text-[#0A4A6E]'}`
                    }
                >
                    {({ isActive }) => (
                        isActive
                            ? <IconSolid className="w-8 h-8" />
                            : <IconOutline className="w-8 h-8" />
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
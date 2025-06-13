import { NavLink } from 'react-router-dom';
import {
    HomeIcon as HomeIconOutline,
    BellIcon as BellIconOutline,
    UserIcon as UserIconOutline,
    CameraIcon,
} from '@heroicons/react/24/outline';

import {
    HomeIcon as HomeIconSolid,
    BellIcon as BellIconSolid,
    UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

export default function BottomNavBar({ onUploadClick }) {
    const tabs = [
        { name: 'Home', to: '/home', IconOutline: HomeIconOutline, IconSolid: HomeIconSolid },
        { name: 'Notifications', to: '/notifications', IconOutline: BellIconOutline, IconSolid: BellIconSolid },
        { name: 'User', to: '/user', IconOutline: UserIconOutline, IconSolid: UserIconSolid },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-evenly px-4 py-4 z-50 md:hidden bg-[#A5C3DE] h-[10vh]">
            {/* home, notifications */}
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
                onClick={onUploadClick}
                className="flex flex-col items-center text-xs text-[#0A4A6E]"
            >
                <CameraIcon className="w-8 h-8" />
            </button>

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
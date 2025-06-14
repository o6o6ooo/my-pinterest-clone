export default function Loading() {

    return (
        <div className="relative flex justify-center items-center h-screen bg-transparent">
            <img
                src="/logobase-trasparent.png"
                alt="logo"
                className="w-20 h-20 z-10"
            />
            <div
                className="absolute top-48% left-35% w-[50px] h-[50px] animate-orbit -translate-x-1/2 -translate-y-1/2"
                style={{ transformOrigin: '50% 50%' }}
            >
                <div
                    className="absolute w-2 h-2 rounded-full bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: 'rotate(0deg) translateX(40px) rotate(0deg)' }}
                />
                <div
                    className="absolute w-2 h-2 rounded-full bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: 'rotate(30deg) translateX(40px) rotate(-120deg)' }}
                />
                <div
                    className="absolute w-2 h-2 rounded-full bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: 'rotate(60deg) translateX(40px) rotate(-240deg)' }}
                />
            </div>
        </div>
    );
}
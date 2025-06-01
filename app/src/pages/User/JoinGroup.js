import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function JoinGroup() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const groupDoc = await getDoc(doc(db, 'groups', groupId));
                if (groupDoc.exists()) {
                    const groupData = groupDoc.data();
                    setGroupName(groupData.group_name);

                    // get user colection only when signed in
                    if (auth.currentUser) {
                        const memberUIDs = groupData.members || [];
                        const userDocs = await Promise.all(
                            memberUIDs.map(uid => getDoc(doc(db, 'users', uid)))
                        );

                        const memberData = userDocs.map(userDoc => {
                            const userData = userDoc.data();
                            return {
                                icon: userData.icon,
                                colour: userData.bgColour,
                            };
                        });
                        setMembers(memberData);
                    }
                } else {
                    console.error('Group not found.');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
                // 🔑 不要な二重alertを防ぐ
                if (!auth.currentUser) {
                    console.log('User not signed in, skipping error alert.');
                } else {
                    alert('Error loading group.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroup();
    }, [groupId, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5">
            <h1 className="mt-12 text-2xl font-semibold">Join Group</h1>

            {isLoading ? (
                <p className="mt-10 text-center">Loading group info...</p>
            ) : (
                <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                    {/* Group name */}
                    <div className="flex flex-col relative bg-[#dfdfdf] rounded-lg px-4 py-3 border border-[#0A4A6E]">
                        <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">Group name</label>
                        <div className="pt-4 text-[#0A4A6E] font-medium">{groupName}</div>
                    </div>

                    {/* Member icons */}
                    {auth.currentUser && members.length > 0 && (
                        <div className="flex items-center justify-center mt-4 space-x-[-10px]">
                            {members.map((member, idx) => (
                                <div
                                    key={idx}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl border-2 border-white shadow-md"
                                    style={{ backgroundColor: member.colour }}
                                >
                                    {member.icon}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Members count */}
                    {auth.currentUser && (
                        <div className="flex text-base font-medium items-center justify-center">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                        </div>
                    )}

                    {/* Join button */}
                    <button
                        onClick={() => {
                            localStorage.setItem('joinGroupId', groupId);
                            navigate('/auth');
                        }}
                        className="py-2 px-4 rounded-lg font-medium text-center transition-colors text-white bg-[#0A4A6E]"
                    >
                        Sign in to join
                    </button>
                </div>
            )}
        </div>
    );
}
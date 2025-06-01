import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function JoinGroup() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [memberNames, setMemberNames] = useState([]);
    const [groupLink, setGroupLink] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const groupDoc = await getDoc(doc(db, 'groups', groupId));
                if (groupDoc.exists()) {
                    const groupData = groupDoc.data();
                    setGroupName(groupData.group_name);
                    setGroupLink(groupData.group_link);

                    const memberUIDs = groupData.members || [];

                    const userDocs = await Promise.all(
                        memberUIDs.map(uid => getDoc(doc(db, 'users', uid)))
                    );

                    const names = userDocs.map(userDoc => {
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            return userData.name || 'Unknown';
                        }
                        return 'Unknown';
                    });

                    setMemberNames(names);

                } else {
                    alert('Group not found');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
                alert('Error loading group.');
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

                    {/* Save button */}
                    <button
                        disabled={isLoading}
                        className={`py-2 px-4 mt-3 rounded-lg font-medium text-center transition-colors text-white ${isLoading ? 'bg-[#0A4A6E]/50' : 'bg-[#0A4A6E]'}`}
                    >
                        {isLoading ? 'Joining...' : 'Join'}
                    </button>


                    {/* Members */}
                    <div className="text-center mt-4 text-[#0A4A6E]">
                        {memberNames.length} {memberNames.length === 1 ? 'member' : 'members'} {memberNames.join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
}
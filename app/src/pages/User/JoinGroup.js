import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';

export default function JoinGroup() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const groupDoc = await getDoc(doc(db, 'groups', groupId));
                if (groupDoc.exists()) {
                    const groupData = groupDoc.data();
                    setGroupName(groupData.name);

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
                if (!auth.currentUser) {
                    console.log('User not signed in, skipping error alert.');
                } else {
                    alert('Error loading group.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [groupId, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5">
            <h1 className="mt-12 text-2xl font-semibold">Join Group</h1>

            {loading ? (
                <p className="mt-10 text-center">Loading group info...</p>
            ) : (
                <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                    {/* Group name */}
                    <FormInput
                        label="Group name"
                        type="text"
                        value={groupName}
                        readOnly
                        disabled
                        variant="readonly"
                    />

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

                    {/* Join button */}
                    <FormButton
                        type="button"
                        onClick={() => {
                            localStorage.setItem('joinGroupId', groupId);
                            navigate('/auth');
                        }}
                        loading={loading}
                        loadingText="Joining..."
                    >
                        Sign in to join
                    </FormButton>
                </div>
            )}
        </div>
    );
}
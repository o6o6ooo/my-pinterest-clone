import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AuthProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // pages open to public (not signed in)
    const publicPages = ['/auth', '/verify-email', '/group/join', '/invite', '/'];

    // pages only for signed in user
    const authPages = [
        '/home',
        '/browse-by-year',
        '/upload',
        '/user',
        '/post',
        '/user/create-group',
        '/user/change-email',
        '/user/change-password',
        '/user/edit-group',
        '/user/edit-profile-icon',
        '/user/hashtags'
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!user.emailVerified) {
                    if (location.pathname !== '/verify-email') {
                        navigate('/verify-email');
                    }
                } else {
                    // join group
                    const joinGroupId = localStorage.getItem('joinGroupId');
                    if (joinGroupId) {
                        try {
                            const groupRef = doc(db, 'groups', joinGroupId);
                            const groupDoc = await getDoc(groupRef);

                            if (groupDoc.exists()) {
                                const groupData = groupDoc.data();
                                if (!groupData.members.includes(user.uid)) {
                                    // add user to group
                                    const updatedMembers = [...groupData.members, user.uid];
                                    await setDoc(groupRef, { ...groupData, members: updatedMembers });
                                    console.log('User added to group!');

                                    // update user collection
                                    const userRef = doc(db, 'users', user.uid);
                                    const userDoc = await getDoc(userRef);
                                    const userData = userDoc.data();
                                    const updatedGroups = userData.groups
                                        ? [...new Set([...userData.groups, joinGroupId])]
                                        : [joinGroupId];

                                    await setDoc(userRef, { ...userData, groups: updatedGroups });
                                }
                                navigate('/user/edit-group');
                            } else {
                                console.error('Group not found.');
                                navigate('/home');
                            }
                        } catch (error) {
                            console.error('Error joining group:', error);
                            navigate('/home');
                        } finally {
                            localStorage.removeItem('joinGroupId');
                        }
                        return;
                    }

                    // go to /home after normal sign in
                    if (
                        user &&
                        joinGroupId === null &&
                        publicPages.includes(location.pathname)
                    ) {
                        navigate('/home');
                    }

                    // go to /home instead somewhere not allowed
                    const isAllowedPage =
                        publicPages.some(path => location.pathname.startsWith(path)) ||
                        authPages.some(path => location.pathname.startsWith(path));
                    if (!isAllowedPage) {
                        navigate('/home');
                    }
                }
            } else {
                const isPublicPage = publicPages.some(path => location.pathname.startsWith(path));
                if (!isPublicPage) {
                    navigate('/auth');
                }
            }
        });

        return () => unsubscribe();
        // eslint-disable-next-line
    }, [navigate, location]);

    return children;
}
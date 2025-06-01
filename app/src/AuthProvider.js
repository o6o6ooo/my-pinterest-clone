import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AuthProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // 👇 公開ページ（サインアウト状態でもアクセス可能）
    const publicPages = ['/auth', '/verify-email', '/group/join'];

    // 👇 認証後にアクセス可能なページ（公開ページ以外で）
    const authPages = [
        '/home',
        '/gallery',
        '/upload',
        '/notifications',
        '/user',
        '/post',
        '/user/create-group',
        '/user/change-email',
        '/user/change-password',
        '/user/edit-group',
        '/user/edit-profile-icon'
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!user.emailVerified) {
                    if (location.pathname !== '/verify-email') {
                        navigate('/verify-email');
                    }
                } else {
                    // グループ参加処理（サインイン後だけ）
                    const joinGroupId = localStorage.getItem('joinGroupId');
                    if (joinGroupId) {
                        try {
                            const groupRef = doc(db, 'groups', joinGroupId);
                            const groupDoc = await getDoc(groupRef);

                            if (groupDoc.exists()) {
                                const groupData = groupDoc.data();
                                if (!groupData.members.includes(user.uid)) {
                                    const updatedMembers = [...groupData.members, user.uid];
                                    await setDoc(groupRef, { ...groupData, members: updatedMembers });
                                    console.log('User added to group!');
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
                        return; // ここで return することで通常の処理をスキップ
                    }

                    // 👇 許可されていないページなら /home にリダイレクト
                    const isAllowedPage =
                        publicPages.some(path => location.pathname.startsWith(path)) ||
                        authPages.some(path => location.pathname.startsWith(path));
                    if (!isAllowedPage) {
                        navigate('/home');
                    }
                }
            } else {
                // サインアウト状態
                const isPublicPage = publicPages.some(path => location.pathname.startsWith(path));
                if (!isPublicPage) {
                    navigate('/auth');
                }
            }
        });

        return () => unsubscribe();
    }, [navigate, location]);

    return children;
}
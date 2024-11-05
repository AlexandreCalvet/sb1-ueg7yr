import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useStore } from '../stores/useStore';
import { useAuthStore } from '../stores/useAuthStore';
export function useInitializeApp(navigate, location) {
    const initializeSubscriptions = useStore((state) => state.initializeSubscriptions);
    const cleanup = useStore((state) => state.cleanup);
    const setAuthState = useAuthStore((state) => state.setAuthState);
    useEffect(() => {
        const publicPaths = ['/', '/login', '/signup', '/recipes'];
        let isInitialLoad = true;
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.data();
                    if (userData) {
                        const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
                        const orgData = orgDoc.data();
                        if (orgData) {
                            setAuthState({
                                currentUser: { id: userDoc.id, ...userData },
                                organization: { id: orgDoc.id, ...orgData },
                                isAuthenticated: true
                            });
                            initializeSubscriptions();
                            // Only redirect if coming from login/signup pages
                            if (location.pathname === '/login' || location.pathname === '/signup') {
                                navigate('/recipes');
                            }
                        }
                    }
                }
                catch (error) {
                    console.error('Error restoring auth state:', error);
                    setAuthState({
                        currentUser: null,
                        organization: null,
                        isAuthenticated: false
                    });
                    if (!isInitialLoad && !publicPaths.includes(location.pathname)) {
                        navigate('/login');
                    }
                }
            }
            else {
                setAuthState({
                    currentUser: null,
                    organization: null,
                    isAuthenticated: false
                });
                // Only redirect to login if trying to access protected routes
                if (!isInitialLoad && !publicPaths.includes(location.pathname)) {
                    navigate('/login');
                }
            }
            isInitialLoad = false;
        });
        return () => {
            unsubscribe();
            cleanup();
        };
    }, []);
}

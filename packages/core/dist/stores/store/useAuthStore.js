import { create } from 'zustand';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
export const useAuthStore = create((set, get) => ({
    currentUser: null,
    organization: null,
    isAuthenticated: false,
    setAuthState: (state) => set(state),
    login: async (email, password) => {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, email, password);
    },
    signup: async (email, password, name, organizationName) => {
        await setPersistence(auth, browserLocalPersistence);
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
        // Create organization
        const orgRef = doc(collection(db, 'organizations'));
        const organization = {
            id: orgRef.id,
            name: organizationName,
            ownerId: firebaseUser.uid,
            users: []
        };
        await setDoc(orgRef, organization);
        // Create user
        const user = {
            id: firebaseUser.uid,
            email,
            name,
            organizationId: orgRef.id,
            role: 'owner'
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), user);
        // Update organization with the user
        organization.users = [user];
        await updateDoc(orgRef, { users: [user] });
    },
    logout: async () => {
        await signOut(auth);
    },
    updateOrganization: async (updates) => {
        const { organization } = get();
        if (!organization)
            return;
        const orgRef = doc(db, 'organizations', organization.id);
        await updateDoc(orgRef, updates);
        set({ organization: { ...organization, ...updates } });
    },
    addUserToOrganization: async (email, role) => {
        const { organization } = get();
        if (!organization)
            return;
        const newUser = {
            id: crypto.randomUUID(),
            email,
            name: email.split('@')[0],
            organizationId: organization.id,
            role,
        };
        await setDoc(doc(db, 'users', newUser.id), newUser);
        set((state) => ({
            organization: state.organization ? {
                ...state.organization,
                users: [...state.organization.users, newUser],
            } : null,
        }));
    },
    removeUserFromOrganization: async (userId) => {
        await deleteDoc(doc(db, 'users', userId));
        set((state) => ({
            organization: state.organization ? {
                ...state.organization,
                users: state.organization.users.filter(user => user.id !== userId),
            } : null,
        }));
    },
    updateUserRole: async (userId, role) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role });
        set((state) => ({
            organization: state.organization ? {
                ...state.organization,
                users: state.organization.users.map(user => user.id === userId ? { ...user, role } : user),
            } : null,
        }));
    },
}));

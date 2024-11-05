import type { User, Organization, UserRole } from '../types';
interface AuthState {
    currentUser: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
}
interface AuthStore extends AuthState {
    setAuthState: (state: AuthState) => void;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string, organizationName: string) => Promise<void>;
    logout: () => Promise<void>;
    updateOrganization: (updates: Partial<Organization>) => Promise<void>;
    addUserToOrganization: (email: string, role: UserRole) => Promise<void>;
    removeUserFromOrganization: (userId: string) => Promise<void>;
    updateUserRole: (userId: string, role: UserRole) => Promise<void>;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthStore>>;
export {};

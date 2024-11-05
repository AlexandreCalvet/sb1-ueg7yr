import { create } from 'zustand';
import { collection, doc, addDoc, deleteDoc, query, where, onSnapshot, updateDoc, getDocs, writeBatch, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
export const useStore = create((set, get) => {
    let recipesUnsubscribe = null;
    let mealPlansUnsubscribe = null;
    let groceryListUnsubscribe = null;
    let bookmarksUnsubscribe = null;
    return {
        recipes: [],
        publicRecipes: [],
        mealPlan: [],
        groceryList: [],
        bookmarks: [],
        isLoading: false,
        error: null,
        fetchPublicRecipes: async () => {
            try {
                const publicRecipesQuery = query(collection(db, 'recipes'), where('isPublic', '==', true));
                const snapshot = await getDocs(publicRecipesQuery);
                const recipes = [];
                snapshot.forEach((doc) => {
                    recipes.push({ id: doc.id, ...doc.data() });
                });
                set({ publicRecipes: recipes });
            }
            catch (error) {
                console.error('Error fetching public recipes:', error);
                set({ error: error.message });
            }
        },
        initializeSubscriptions: () => {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser)
                return;
            set({ isLoading: true, error: null });
            try {
                // Subscribe to recipes
                const recipesQuery = query(collection(db, 'recipes'), where('organizationId', '==', currentUser.organizationId));
                recipesUnsubscribe = onSnapshot(recipesQuery, (snapshot) => {
                    const recipes = [];
                    snapshot.forEach((doc) => {
                        recipes.push({ id: doc.id, ...doc.data() });
                    });
                    set({ recipes, error: null });
                }, (error) => {
                    console.error('Error in recipes subscription:', error);
                    set({ error: error.message });
                });
                // Subscribe to meal plans
                const mealPlansQuery = query(collection(db, 'mealPlans'), where('userId', '==', currentUser.id));
                mealPlansUnsubscribe = onSnapshot(mealPlansQuery, (snapshot) => {
                    const mealPlans = [];
                    snapshot.forEach((doc) => {
                        mealPlans.push({ id: doc.id, ...doc.data() });
                    });
                    set({ mealPlan: mealPlans, error: null });
                }, (error) => {
                    console.error('Error in meal plans subscription:', error);
                    set({ error: error.message });
                });
                // Subscribe to grocery items
                const groceryListQuery = query(collection(db, 'groceryItems'), where('userId', '==', currentUser.id));
                groceryListUnsubscribe = onSnapshot(groceryListQuery, (snapshot) => {
                    const groceryItems = [];
                    snapshot.forEach((doc) => {
                        groceryItems.push({ id: doc.id, ...doc.data() });
                    });
                    set({ groceryList: groceryItems, error: null });
                }, (error) => {
                    console.error('Error in grocery list subscription:', error);
                    set({ error: error.message });
                });
                // Subscribe to bookmarks
                const bookmarksQuery = query(collection(db, 'bookmarks'), where('userId', '==', currentUser.id));
                bookmarksUnsubscribe = onSnapshot(bookmarksQuery, (snapshot) => {
                    const bookmarks = [];
                    snapshot.forEach((doc) => {
                        bookmarks.push({ id: doc.id, ...doc.data() });
                    });
                    set({ bookmarks, error: null });
                }, (error) => {
                    console.error('Error in bookmarks subscription:', error);
                    if (error.code !== 'permission-denied') {
                        set({ error: error.message });
                    }
                });
            }
            catch (error) {
                console.error('Error initializing subscriptions:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        cleanup: () => {
            if (recipesUnsubscribe)
                recipesUnsubscribe();
            if (mealPlansUnsubscribe)
                mealPlansUnsubscribe();
            if (groceryListUnsubscribe)
                groceryListUnsubscribe();
            if (bookmarksUnsubscribe)
                bookmarksUnsubscribe();
            set({
                recipes: [],
                mealPlan: [],
                groceryList: [],
                bookmarks: [],
                error: null
            });
        },
        addRecipe: async (recipe) => {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser)
                return;
            set({ isLoading: true, error: null });
            try {
                await addDoc(collection(db, 'recipes'), {
                    ...recipe,
                    organizationId: currentUser.organizationId,
                    createdBy: {
                        id: currentUser.id,
                        name: currentUser.name
                    },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            catch (error) {
                console.error('Error adding recipe:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        updateRecipe: async (id, recipe) => {
            set({ isLoading: true, error: null });
            try {
                await updateDoc(doc(db, 'recipes', id), {
                    ...recipe,
                    updatedAt: serverTimestamp()
                });
            }
            catch (error) {
                console.error('Error updating recipe:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        removeRecipe: async (id) => {
            set({ isLoading: true, error: null });
            try {
                await deleteDoc(doc(db, 'recipes', id));
            }
            catch (error) {
                console.error('Error removing recipe:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        addToMealPlan: async (mealPlan) => {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser)
                return;
            set({ isLoading: true, error: null });
            try {
                await addDoc(collection(db, 'mealPlans'), {
                    ...mealPlan,
                    userId: currentUser.id,
                    createdAt: serverTimestamp()
                });
            }
            catch (error) {
                console.error('Error adding to meal plan:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        removeFromMealPlan: async (id) => {
            set({ isLoading: true, error: null });
            try {
                await deleteDoc(doc(db, 'mealPlans', id));
            }
            catch (error) {
                console.error('Error removing from meal plan:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        updateGroceryList: async () => {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser)
                return;
            set({ isLoading: true, error: null });
            try {
                const { mealPlan, recipes } = get();
                const plannedRecipes = mealPlan
                    .map((meal) => recipes.find((recipe) => recipe.id === meal.recipeId))
                    .filter((recipe) => recipe !== undefined);
                const batch = writeBatch(db);
                // Delete existing items
                const existingItemsQuery = query(collection(db, 'groceryItems'), where('userId', '==', currentUser.id));
                const existingItems = await getDocs(existingItemsQuery);
                existingItems.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                // Create new items
                const groceryItems = new Map();
                plannedRecipes.forEach((recipe) => {
                    recipe.ingredients.forEach((ingredient) => {
                        const key = `${ingredient.name}-${ingredient.unit}`;
                        if (groceryItems.has(key)) {
                            const existingItem = groceryItems.get(key);
                            existingItem.quantity += ingredient.quantity;
                        }
                        else {
                            const newItem = {
                                id: doc(collection(db, 'groceryItems')).id,
                                ...ingredient,
                                checked: false,
                                userId: currentUser.id,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            };
                            groceryItems.set(key, newItem);
                            batch.set(doc(db, 'groceryItems', newItem.id), newItem);
                        }
                    });
                });
                await batch.commit();
            }
            catch (error) {
                console.error('Error updating grocery list:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        toggleGroceryItem: async (id) => {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser)
                return;
            set({ error: null });
            try {
                const itemRef = doc(db, 'groceryItems', id);
                await runTransaction(db, async (transaction) => {
                    const itemDoc = await transaction.get(itemRef);
                    if (itemDoc.exists()) {
                        const item = itemDoc.data();
                        transaction.update(itemRef, {
                            checked: !item.checked,
                            updatedAt: serverTimestamp()
                        });
                    }
                });
            }
            catch (error) {
                console.error('Error toggling grocery item:', error);
                set({ error: error.message });
            }
        },
        clearGroceryList: async () => {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser)
                return;
            set({ isLoading: true, error: null });
            try {
                const batch = writeBatch(db);
                const groceryListQuery = query(collection(db, 'groceryItems'), where('userId', '==', currentUser.id));
                const snapshot = await getDocs(groceryListQuery);
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }
            catch (error) {
                console.error('Error clearing grocery list:', error);
                set({ error: error.message });
            }
            finally {
                set({ isLoading: false });
            }
        },
        bookmarkRecipe: async (recipeId) => {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser)
                return;
            set({ error: null });
            try {
                await addDoc(collection(db, 'bookmarks'), {
                    userId: currentUser.id,
                    recipeId,
                    createdAt: serverTimestamp()
                });
            }
            catch (error) {
                console.error('Error bookmarking recipe:', error);
                set({ error: error.message });
            }
        },
        removeBookmark: async (bookmarkId) => {
            set({ error: null });
            try {
                await deleteDoc(doc(db, 'bookmarks', bookmarkId));
            }
            catch (error) {
                console.error('Error removing bookmark:', error);
                set({ error: error.message });
            }
        }
    };
});

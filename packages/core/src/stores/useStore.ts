import { create } from 'zustand';
import { 
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Recipe, MealPlan, GroceryItem, Bookmark } from '../types';

interface Store {
  recipes: Recipe[];
  publicRecipes: Recipe[];
  mealPlan: MealPlan[];
  groceryList: GroceryItem[];
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  fetchPublicRecipes: () => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'organizationId'>) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  addToMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'organizationId'>) => Promise<void>;
  removeFromMealPlan: (id: string) => Promise<void>;
  updateGroceryList: () => Promise<void>;
  toggleGroceryItem: (id: string) => Promise<void>;
  clearGroceryList: () => Promise<void>;
  bookmarkRecipe: (recipeId: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  initializeSubscriptions: () => void;
  cleanup: () => void;
}

export const useStore = create<Store>((set, get) => {
  let recipesUnsubscribe: (() => void) | null = null;
  let mealPlansUnsubscribe: (() => void) | null = null;
  let groceryListUnsubscribe: (() => void) | null = null;
  let bookmarksUnsubscribe: (() => void) | null = null;

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
        const publicRecipesQuery = query(
          collection(db, 'recipes'),
          where('isPublic', '==', true)
        );
        
        const snapshot = await getDocs(publicRecipesQuery);
        const recipes: Recipe[] = [];
        snapshot.forEach((doc) => {
          recipes.push({ id: doc.id, ...doc.data() } as Recipe);
        });
        
        set({ publicRecipes: recipes });
      } catch (error) {
        console.error('Error fetching public recipes:', error);
        set({ error: (error as Error).message });
      }
    },

    initializeSubscriptions: () => {
      set({ isLoading: true, error: null });

      try {
        // Subscribe to recipes
        const recipesQuery = query(
          collection(db, 'recipes')
        );

        recipesUnsubscribe = onSnapshot(recipesQuery, 
          (snapshot) => {
            const recipes: Recipe[] = [];
            snapshot.forEach((doc) => {
              recipes.push({ id: doc.id, ...doc.data() } as Recipe);
            });
            set({ recipes, error: null });
          },
          (error) => {
            console.error('Error in recipes subscription:', error);
            set({ error: error.message });
          }
        );

        // Subscribe to meal plans
        const mealPlansQuery = query(
          collection(db, 'mealPlans')
        );

        mealPlansUnsubscribe = onSnapshot(mealPlansQuery, 
          (snapshot) => {
            const mealPlans: MealPlan[] = [];
            snapshot.forEach((doc) => {
              mealPlans.push({ id: doc.id, ...doc.data() } as MealPlan);
            });
            set({ mealPlan: mealPlans, error: null });
          },
          (error) => {
            console.error('Error in meal plans subscription:', error);
            set({ error: error.message });
          }
        );

        // Subscribe to grocery items
        const groceryListQuery = query(
          collection(db, 'groceryItems')
        );

        groceryListUnsubscribe = onSnapshot(groceryListQuery,
          (snapshot) => {
            const groceryItems: GroceryItem[] = [];
            snapshot.forEach((doc) => {
              groceryItems.push({ id: doc.id, ...doc.data() } as GroceryItem);
            });
            set({ groceryList: groceryItems, error: null });
          },
          (error) => {
            console.error('Error in grocery list subscription:', error);
            set({ error: error.message });
          }
        );

        // Subscribe to bookmarks
        const bookmarksQuery = query(
          collection(db, 'bookmarks')
        );

        bookmarksUnsubscribe = onSnapshot(bookmarksQuery,
          (snapshot) => {
            const bookmarks: Bookmark[] = [];
            snapshot.forEach((doc) => {
              bookmarks.push({ id: doc.id, ...doc.data() } as Bookmark);
            });
            set({ bookmarks, error: null });
          },
          (error) => {
            console.error('Error in bookmarks subscription:', error);
            if (error.code !== 'permission-denied') {
              set({ error: error.message });
            }
          }
        );

      } catch (error) {
        console.error('Error initializing subscriptions:', error);
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    cleanup: () => {
      if (recipesUnsubscribe) recipesUnsubscribe();
      if (mealPlansUnsubscribe) mealPlansUnsubscribe();
      if (groceryListUnsubscribe) groceryListUnsubscribe();
      if (bookmarksUnsubscribe) bookmarksUnsubscribe();
      set({
        recipes: [],
        mealPlan: [],
        groceryList: [],
        bookmarks: [],
        error: null
      });
    },

    addRecipe: async (recipe) => {
      set({ isLoading: true, error: null });

      try {
        await addDoc(collection(db, 'recipes'), {
          ...recipe,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error adding recipe:', error);
        set({ error: (error as Error).message });
      } finally {
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
      } catch (error) {
        console.error('Error updating recipe:', error);
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    removeRecipe: async (id) => {
      set({ isLoading: true, error: null });

      try {
        await deleteDoc(doc(db, 'recipes', id));
      } catch (error) {
        console.error('Error removing recipe:', error);
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    addToMealPlan: async (mealPlan) => {
      set({ isLoading: true, error: null });

      try {
        await addDoc(collection(db, 'mealPlans'), {
          ...mealPlan,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error adding to meal plan:', error);
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    removeFromMealPlan: async (id) => {
      set({ isLoading: true, error: null });

      try {
        await deleteDoc(doc(db, 'mealPlans', id));
      } catch (error) {
        console.error('Error removing from meal plan:', error);
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    updateGroceryList: async () => {
      set({ isLoading: true, error: null });

      try {
        const { mealPlan, recipes } = get();
        const plannedRecipes = mealPlan
          .map((meal) => recipes.find((recipe) => recipe.id === meal.recipeId))
          .filter((recipe): recipe is Recipe => recipe !== undefined);

        const batch = writeBatch(db);

        // Delete existing items
        const existingItemsQuery = query(
          collection(db, 'groceryItems')
        );
        const existingItems = await getDocs(existingItemsQuery);
        existingItems.forEach((doc) => {
          batch.delete(doc.ref);
        });

        // Create new items
        const groceryItems = new Map<string, GroceryItem>();
        
        plannedRecipes.forEach((recipe) => {
          recipe.ingredients.forEach((ingredient) => {
            const key = `${ingredient.name}-${ingredient.unit}`;
            if (groceryItems.has(key)) {
              const existingItem = groceryItems.get(key)!;
              existingItem.quantity += ingredient.quantity;
            } else {
              const newItem: GroceryItem = {
                id: doc(collection(db, 'groceryItems')).id,
                ...ingredient,
                checked: false,
                userId: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              groceryItems.set(key, newItem);
              batch.set(doc(db, 'groceryItems', newItem.id), newItem);
            }
          });
        });

        await batch.commit();
      } catch (error) {
        console.error('Error updating grocery list:', error);
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    toggleGroceryItem: async (id: string) => {
      set({ error: null });

      try {
        const itemRef = doc(db, 'groceryItems', id);
        await runTransaction(db, async (transaction) => {
          const itemDoc = await transaction.get(itemRef);
          if (itemDoc.exists()) {
            const item = itemDoc.data() as GroceryItem;
            transaction.update(itemRef, {
              checked: !item.checked,
              updatedAt: serverTimestamp()
            });
          }
        });
      } catch (error) {
        console.error('Error toggling grocery item:', error);
        set({ error: (error as Error).message });
      }
    },

    clearGroceryList: async () => {
      set({ isLoading: true, error: null });

      try {
        const batch = writeBatch(db);
        const groceryListQuery = query(
          collection(db, 'groceryItems')
        );
        const snapshot = await getDocs(groceryListQuery);
        
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
      } catch (error) {
        console.error('Error clearing grocery list:', error);
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    bookmarkRecipe: async (recipeId: string) => {
      set({ error: null });

      try {
        await addDoc(collection(db, 'bookmarks'), {
          recipeId,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error bookmarking recipe:', error);
        set({ error: (error as Error).message });
      }
    },

    removeBookmark: async (bookmarkId: string) => {
      set({ error: null });

      try {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      } catch (error) {
        console.error('Error removing bookmark:', error);
        set({ error: (error as Error).message });
      }
    }
  };
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Category, categories as defaultCategories } from '../data/categories';

interface CategoriesContextType {
  categories: Category[];
  updateCategory: (categoryId: string, name: string, words: string[], icon: string) => Promise<void>;
  addCategory: (name: string, words: string[], icon?: string) => Promise<string>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  addWordToCategory: (categoryId: string, word: string) => Promise<boolean>;
  removeWordFromCategory: (categoryId: string, word: string) => Promise<boolean>;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const STORAGE_KEY = '@spyroyale:custom_categories_v5';

const DEFAULT_CATEGORIES: Category[] = Array.isArray(defaultCategories) ? defaultCategories : [];

export const CategoriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const saveToStorage = async (allCats: Category[]) => {
    try {
      const customOnly = allCats.filter((c) => c.isCustom === true);
      const jsonData = JSON.stringify(customOnly);
      await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    } catch (error) {}
  };

  const loadFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const customCats: Category[] = JSON.parse(stored);

        const validCustom = customCats.filter(
          (c) => c && c.id && c.name && c.isCustom === true
        );

        const merged = [...DEFAULT_CATEGORIES, ...validCustom];
        setCategories(merged);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const addCategory = async (name: string, words: string[], icon: string = 'Folder'): Promise<string> => {
    let finalName = name;
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );
    if (existingCategory) {
      finalName = `${name} (Kopya)`;
    }

    const newCategory: Category = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: finalName,
      icon,
      words: words || [],
      isCustom: true,
    };

    const updatedList = [...categories, newCategory];
    setCategories(updatedList);
    await saveToStorage(updatedList);
    return newCategory.id;
  };

  const updateCategory = async (categoryId: string, name: string, words: string[], icon: string) => {
    const updatedList = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name, words, icon } : cat
    );

    setCategories(updatedList);
    await saveToStorage(updatedList);
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return false;
    if (!category.isCustom) return false;

    const updatedList = categories.filter((cat) => cat.id !== categoryId);
    setCategories(updatedList);
    await saveToStorage(updatedList);
    return true;
  };

  const addWordToCategory = async (categoryId: string, word: string): Promise<boolean> => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return false;

    if (category.words.includes(word)) {
      return false;
    }

    const updatedWords = [...category.words, word];
    await updateCategory(categoryId, category.name, updatedWords, category.icon);
    return true;
  };

  const removeWordFromCategory = async (categoryId: string, word: string): Promise<boolean> => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return false;

    if (!category.words.includes(word)) {
      return false;
    }

    const updatedWords = category.words.filter((w) => w !== word);
    await updateCategory(categoryId, category.name, updatedWords, category.icon);
    return true;
  };

  const refreshCategories = async () => {
    await loadFromStorage();
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        updateCategory,
        addCategory,
        deleteCategory,
        addWordToCategory,
        removeWordFromCategory,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
};

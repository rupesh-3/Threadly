// Simple authentication utilities for client-side only app
// Note: This is NOT production-grade security. For production, use a proper backend.

import { User } from '../types';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Simple hash, not secure for production
  createdAt: string;
  lastLoginAt: string;
}

// Simple hash function (NOT cryptographically secure - for demo only)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

const STORAGE_KEY_USERS = 'threadly_users';
const STORAGE_KEY_CURRENT_USER = 'threadly_current_user';

export const signUp = (email: string, password: string, name: string): boolean => {
  try {
    const users = getStoredUsers();
    
    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Auto-login after signup
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    };
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    
    return true;
  } catch (error) {
    console.error('Sign up error:', error);
    return false;
  }
};

export const login = (email: string, password: string): User | null => {
  try {
    const users = getStoredUsers();
    const passwordHash = simpleHash(password);
    
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash
    );

    if (!user) {
      return null;
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    const updatedUsers = users.map(u => 
      u.id === user.id ? user : u
    );
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));

    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };

    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const updateUserProfile = (userId: string, name: string): boolean => {
  try {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;

    users[userIndex].name = name.trim();
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.name = name.trim();
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    }

    return true;
  } catch (error) {
    console.error('Update profile error:', error);
    return false;
  }
};

const getStoredUsers = (): StoredUser[] => {
  try {
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  } catch (error) {
    console.error('Get stored users error:', error);
    return [];
  }
};


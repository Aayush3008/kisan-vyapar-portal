'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  district?: string;
  state?: string;
  pincode?: string;
  avatar_url?: string;
  farmer_profile?: {
    farm_name: string;
    farm_description?: string;
    crops_grown?: string[];
    is_verified: boolean;
  } | null;
}

export interface UserLocation {
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  detected: boolean;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile | null;
  loginUser: (profile: UserProfile) => void;
  logoutUser: () => void;
  showRoleModal: boolean;
  setShowRoleModal: (show: boolean) => void;
  userLocation: UserLocation;
  setUserLocation: (loc: Partial<UserLocation>) => void;
  detectLocation: () => Promise<UserLocation>;
}

const DEFAULT_LOCATION: UserLocation = {
  district: 'Meerut',
  state: 'Uttar Pradesh',
  detected: false,
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('buyer');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [userLocation, setUserLocationState] = useState<UserLocation>(DEFAULT_LOCATION);

  // Helper to reverse geocode lat/lng to Indian city/district
  const reverseGeocode = async (lat: number, lon: number): Promise<{ district: string; state: string }> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' },
      });
      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};
        const district = address.state_district || address.city || address.county || address.town || 'Meerut';
        const state = address.state || 'Uttar Pradesh';
        return {
          district: district.replace(/district/gi, '').trim(),
          state: state.trim(),
        };
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    // Fallback based on northern/UP coordinates:
    if (lat > 28.5 && lat < 29.5 && lon > 77.3 && lon < 78.0) {
      return { district: 'Meerut', state: 'Uttar Pradesh' };
    }
    return { district: 'Meerut', state: 'Uttar Pradesh' };
  };

  const detectLocation = async (): Promise<UserLocation> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const geo = await reverseGeocode(latitude, longitude);
            const resolvedLocation: UserLocation = {
              district: geo.district,
              state: geo.state,
              latitude,
              longitude,
              detected: true,
            };
            setUserLocationState(resolvedLocation);
            localStorage.setItem('kvp_user_location', JSON.stringify(resolvedLocation));
            resolve(resolvedLocation);
          },
          (err) => {
            console.warn('Geolocation blocked or timed out, using Meerut, UP:', err.message);
            const fallbackLoc: UserLocation = {
              district: 'Meerut',
              state: 'Uttar Pradesh',
              detected: true,
            };
            setUserLocationState(fallbackLoc);
            localStorage.setItem('kvp_user_location', JSON.stringify(fallbackLoc));
            resolve(fallbackLoc);
          },
          { timeout: 7000, enableHighAccuracy: true }
        );
      } else {
        const fallbackLoc: UserLocation = {
          district: 'Meerut',
          state: 'Uttar Pradesh',
          detected: true,
        };
        setUserLocationState(fallbackLoc);
        resolve(fallbackLoc);
      }
    });
  };

  const setUserLocation = (loc: Partial<UserLocation>) => {
    setUserLocationState((prev) => {
      const updated = { ...prev, ...loc, detected: true };
      localStorage.setItem('kvp_user_location', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('kvp_current_user');
    const savedLocation = localStorage.getItem('kvp_user_location');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
          setRoleState(parsed.role || 'buyer');
          if (parsed.district) {
            setUserLocationState({
              district: parsed.district,
              state: parsed.state || 'Uttar Pradesh',
              detected: true,
            });
          }
          setShowRoleModal(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

    // MANDATORY SECURITY GATE: If not signed up / logged in, block portal and open auth modal
    setShowRoleModal(true);

    if (savedLocation) {
      try {
        setUserLocationState(JSON.parse(savedLocation));
      } catch {
        setUserLocationState(DEFAULT_LOCATION);
      }
    } else {
      detectLocation();
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('kvp_user_role', newRole);
    setShowRoleModal(false);

    // If a user is already signed in, dynamically switch their active session role without re-asking credentials
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      localStorage.setItem('kvp_current_user', JSON.stringify(updatedUser));
    }
  };

  const loginUser = (profile: UserProfile) => {
    setCurrentUser(profile);
    setRoleState(profile.role);
    if (profile.district) {
      setUserLocationState({
        district: profile.district,
        state: profile.state || 'Uttar Pradesh',
        detected: true,
      });
      localStorage.setItem('kvp_user_location', JSON.stringify({
        district: profile.district,
        state: profile.state || 'Uttar Pradesh',
        detected: true,
      }));
    }
    localStorage.setItem('kvp_user_role', profile.role);
    localStorage.setItem('kvp_current_user', JSON.stringify(profile));
    setShowRoleModal(false);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setRoleState('buyer');
    localStorage.removeItem('kvp_current_user');
    localStorage.setItem('kvp_user_role', 'buyer');
    // Immediately prompt login again to preserve mandatory access gate
    setShowRoleModal(true);
  };

  return (
    <RoleContext.Provider value={{ 
      role, 
      setRole, 
      currentUser, 
      loginUser, 
      logoutUser, 
      showRoleModal, 
      setShowRoleModal,
      userLocation,
      setUserLocation,
      detectLocation,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

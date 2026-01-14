import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "mimirProfile";
const defaultProfile = { nickname: "", avatar: "sunrise" };

const safeParse = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

export const getStoredProfile = () => {
  if (typeof window === "undefined") {
    return defaultProfile;
  }
  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!stored) {
    return defaultProfile;
  }
  return {
    nickname: typeof stored.nickname === "string" ? stored.nickname : "",
    avatar: typeof stored.avatar === "string" ? stored.avatar : "sunrise",
  };
};

export const useProfile = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  // Fetch profile from Airtable if logged in
  const fetchProfile = useCallback(async () => {
    if (!session?.user?.email) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        const serverProfile = {
          nickname: data.user.nickname || "",
          avatar: data.user.avatar || "sunrise",
        };
        setProfile(serverProfile);
        // Also update localStorage as cache
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProfile));
        }
        setSynced(true);
      } else if (response.status === 404) {
        // User doesn't exist in Airtable yet, create them
        const createResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name || "",
            nickname: profile.nickname || "",
            avatar: profile.avatar || "sunrise",
          }),
        });
        if (createResponse.ok) {
          setSynced(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    // First load from localStorage for instant display
    setProfile(getStoredProfile());

    const handleStorage = () => setProfile(getStoredProfile());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Fetch from server when session is available
  useEffect(() => {
    if (session?.user?.email && !synced) {
      fetchProfile();
    }
  }, [session?.user?.email, synced, fetchProfile]);

  const saveProfile = async (next) => {
    setProfile(next);
    // Save to localStorage immediately for instant feedback
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    // Sync to Airtable if logged in
    if (session?.user?.email) {
      try {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name || "",
            nickname: next.nickname,
            avatar: next.avatar,
          }),
        });
      } catch (error) {
        console.error("Failed to sync profile:", error);
      }
    }
  };

  return { profile, saveProfile, loading };
};

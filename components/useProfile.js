import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY_PREFIX = "mimirProfile";
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

const getStorageKey = (email) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  return normalizedEmail
    ? `${STORAGE_KEY_PREFIX}:${normalizedEmail}`
    : `${STORAGE_KEY_PREFIX}:anonymous`;
};

export const getStoredProfile = (email) => {
  if (typeof window === "undefined") {
    return defaultProfile;
  }
  const stored = safeParse(window.localStorage.getItem(getStorageKey(email)));
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
  const userEmail = session?.user?.email || "";

  // Fetch profile from Airtable if logged in
  const fetchProfile = useCallback(async () => {
    if (!userEmail) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        const serverProfile = {
          nickname: data.user.nickname || "",
          avatar: data.user.avatar || "sunrise",
        };
        setProfile(serverProfile);
        // Also update localStorage as cache
        if (typeof window !== "undefined") {
          window.localStorage.setItem(getStorageKey(userEmail), JSON.stringify(serverProfile));
        }
        setSynced(true);
      } else if (response.status === 404) {
        // User doesn't exist in Airtable yet, create with neutral defaults
        const createResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            name: session.user.name || "",
            nickname: "",
            avatar: "sunrise",
          }),
        });
        if (createResponse.ok) {
          setProfile(defaultProfile);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(getStorageKey(userEmail), JSON.stringify(defaultProfile));
          }
          setSynced(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [userEmail, session?.user?.name]);

  useEffect(() => {
    // Load from this user's local cache for instant display
    setProfile(getStoredProfile(userEmail));
    setSynced(false);

    const handleStorage = () => setProfile(getStoredProfile(userEmail));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [userEmail]);

  // Fetch from server when session is available
  useEffect(() => {
    if (userEmail && !synced) {
      fetchProfile();
    }
  }, [userEmail, synced, fetchProfile]);

  const saveProfile = async (next) => {
    setProfile(next);
    // Save to localStorage immediately for instant feedback
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getStorageKey(userEmail), JSON.stringify(next));
    }

    // Sync to Airtable if logged in
    if (userEmail) {
      try {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
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

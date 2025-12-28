import { useEffect, useState } from "react";

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
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    setProfile(getStoredProfile());
    const handleStorage = () => setProfile(getStoredProfile());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveProfile = (next) => {
    setProfile(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  return { profile, saveProfile };
};

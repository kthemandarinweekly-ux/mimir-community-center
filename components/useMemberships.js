import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export const useMemberships = () => {
  const { data: session } = useSession();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMemberships = useCallback(async () => {
    if (!session?.user?.email) {
      setMemberships([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/memberships?email=${encodeURIComponent(session.user.email)}`
      );
      if (response.ok) {
        const data = await response.json();
        setMemberships(data.memberships || []);
      }
    } catch (error) {
      console.error("Failed to fetch memberships:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const joinGroup = async (groupSlug, groupName) => {
    if (!session?.user?.email) {
      return { success: false, error: "Not logged in" };
    }

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,
          userName: session.user.name || "",
          groupSlug,
          groupName,
        }),
      });

      if (response.ok) {
        await fetchMemberships();
        return { success: true };
      } else if (response.status === 409) {
        return { success: false, error: "Already a member" };
      } else {
        return { success: false, error: "Failed to join group" };
      }
    } catch (error) {
      return { success: false, error: "Failed to join group" };
    }
  };

  const leaveGroup = async (groupSlug) => {
    if (!session?.user?.email) {
      return { success: false, error: "Not logged in" };
    }

    try {
      const response = await fetch("/api/memberships", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,
          groupSlug,
        }),
      });

      if (response.ok) {
        await fetchMemberships();
        return { success: true };
      } else {
        return { success: false, error: "Failed to leave group" };
      }
    } catch (error) {
      return { success: false, error: "Failed to leave group" };
    }
  };

  const isMember = (groupSlug) => {
    return memberships.some((m) => m.groupSlug === groupSlug);
  };

  return { memberships, loading, joinGroup, leaveGroup, isMember, refetch: fetchMemberships };
};

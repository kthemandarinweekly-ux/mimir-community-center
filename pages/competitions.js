import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MinimalNav from "../components/MinimalNav";
import { getCurrentSeason } from "../data/seasons";

const languageConfigs = [
  {
    key: "english",
    label: "English",
    keywords: ["english"],
  },
  {
    key: "spanish",
    label: "Spanish",
    keywords: ["spanish"],
  },
  {
    key: "chinese",
    label: "Chinese",
    keywords: ["chinese"],
  },
];

// Fetch all materials and group by language
async function fetchAllMaterials() {
  const response = await fetch("/api/materials");
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.materials || [];
}

export default function CompetitionsPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const currentSeason = getCurrentSeason();

  const [materials, setMaterials] = useState({
    english: { watch: [], read: [] },
    spanish: { watch: [], read: [] },
    chinese: { watch: [], read: [] },
  });
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const loadMaterials = async () => {
      const allMaterials = await fetchAllMaterials();

      // Group materials by language based on groupSlug keywords
      const grouped = {
        english: { watch: [], read: [] },
        spanish: { watch: [], read: [] },
        chinese: { watch: [], read: [] },
      };

      allMaterials.forEach((material) => {
        const slugs = Array.isArray(material.groupSlug) ? material.groupSlug : [material.groupSlug];
        const slugString = slugs.join(" ").toLowerCase();

        languageConfigs.forEach((lang) => {
          const matchesLang = lang.keywords.some((kw) => slugString.includes(kw));
          if (matchesLang) {
            const type = material.type === "watch" ? "watch" : "read";
            // Avoid duplicates
            if (!grouped[lang.key][type].some((m) => m.id === material.id)) {
              grouped[lang.key][type].push(material);
            }
          }
        });
      });

      setMaterials(grouped);
    };

    loadMaterials();
  }, []);

  // Load saved materials for logged-in users
  useEffect(() => {
    if (!session?.user?.email) return;

    const loadSavedMaterials = async () => {
      try {
        const response = await fetch(`/api/saved-materials?email=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setSavedIds(new Set((data.savedMaterials || []).map((m) => m.materialId)));
        }
      } catch (error) {
        console.error("Failed to load saved materials:", error);
      }
    };

    loadSavedMaterials();
  }, [session?.user?.email]);

  const handleSave = async (material, type, language) => {
    if (!session?.user?.email) return;

    setSavingId(material.id);
    const isSaved = savedIds.has(material.id);

    try {
      const response = await fetch("/api/saved-materials", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          materialId: material.id,
          materialTitle: material.title,
          materialUrl: material.fileUrl,
          materialType: type,
          materialLanguage: language,
        }),
      });

      if (response.ok) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (isSaved) {
            next.delete(material.id);
          } else {
            next.add(material.id);
          }
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to save material:", error);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Materials | Mimir Language Community</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="minimal-page">
        <MinimalNav />

        <main className="minimal-content">
          <section className="minimal-hero">
            <p className="minimal-label">{currentSeason.label}</p>
            <h1 className="minimal-title">{currentSeason.topic}</h1>
            <p className="minimal-subtitle">
              Explore curated materials by language. Save your favorites to your library.
            </p>
            {isLoggedIn && (
              <Link href="/account" className="hero-account-link">
                View saved materials →
              </Link>
            )}
          </section>

          {languageConfigs.map((lang) => {
            const langMaterials = materials[lang.key] || { watch: [], read: [] };
            return (
              <section key={lang.key} className="minimal-section">
                <h2 className="minimal-section-title">{lang.label}</h2>
                <div className="materials-row">
                  <article className="materials-card">
                    <h3>Watch</h3>
                    {langMaterials.watch.length > 0 ? (
                      <ul className="materials-list-saveable">
                        {langMaterials.watch.map((item) => (
                          <li key={item.id}>
                            <div className="material-content">
                              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                                {item.title}
                              </a>
                              {item.description && <span>{item.description}</span>}
                            </div>
                            {isLoggedIn && (
                              <button
                                className={`save-btn ${savedIds.has(item.id) ? "saved" : ""}`}
                                onClick={() => handleSave(item, "Watch", lang.label)}
                                disabled={savingId === item.id}
                              >
                                {savingId === item.id ? "..." : savedIds.has(item.id) ? "Saved" : "Save"}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="materials-empty">No watch materials yet.</p>
                    )}
                  </article>
                  <article className="materials-card">
                    <h3>Read</h3>
                    {langMaterials.read.length > 0 ? (
                      <ul className="materials-list-saveable">
                        {langMaterials.read.map((item) => (
                          <li key={item.id}>
                            <div className="material-content">
                              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                                {item.title}
                              </a>
                              {item.description && <span>{item.description}</span>}
                            </div>
                            {isLoggedIn && (
                              <button
                                className={`save-btn ${savedIds.has(item.id) ? "saved" : ""}`}
                                onClick={() => handleSave(item, "Read", lang.label)}
                                disabled={savingId === item.id}
                              >
                                {savingId === item.id ? "..." : savedIds.has(item.id) ? "Saved" : "Save"}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="materials-empty">No reading materials yet.</p>
                    )}
                  </article>
                </div>
              </section>
            );
          })}

          {!isLoggedIn && (
            <section className="materials-cta-section">
              <h2>Want to save materials?</h2>
              <p>Sign in to build your personal study library.</p>
              <Link href="/signin" className="materials-cta">
                Sign In Free
              </Link>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

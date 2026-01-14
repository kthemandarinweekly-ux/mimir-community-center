import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MinimalNav from "../components/MinimalNav";

const seasonTopic = "Should AI tools be used in schools?";

const languageConfigs = [
  {
    key: "english",
    label: "English",
    groupSlug: "season-2026-1-english",
  },
  {
    key: "spanish",
    label: "Spanish",
    groupSlug: "season-2026-1-spanish",
  },
  {
    key: "chinese",
    label: "Chinese",
    groupSlug: "season-2026-1-chinese",
  },
];

async function fetchMaterials(groupSlug, type) {
  const response = await fetch(
    `/api/materials?groupSlug=${encodeURIComponent(groupSlug)}&type=${encodeURIComponent(type)}`
  );
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.materials || [];
}

export default function CompetitionsPage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [materials, setMaterials] = useState({
    english: { video: [], reading: [] },
    spanish: { video: [], reading: [] },
    chinese: { video: [], reading: [] },
  });
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    const loadMaterials = async () => {
      const updates = {};
      await Promise.all(
        languageConfigs.map(async (lang) => {
          const [video, reading] = await Promise.all([
            fetchMaterials(lang.groupSlug, "video"),
            fetchMaterials(lang.groupSlug, "reading"),
          ]);
          updates[lang.key] = { video, reading };
        })
      );
      setMaterials((prev) => ({ ...prev, ...updates }));
    };

    loadMaterials();

    // Load saved materials from localStorage
    const saved = JSON.parse(localStorage.getItem("savedMaterials") || "[]");
    setSavedIds(new Set(saved.map((m) => m.id)));
  }, []);

  const handleSave = (material, type, language) => {
    const saved = JSON.parse(localStorage.getItem("savedMaterials") || "[]");
    const exists = saved.some((m) => m.id === material.id);

    if (exists) {
      // Remove from saved
      const updated = saved.filter((m) => m.id !== material.id);
      localStorage.setItem("savedMaterials", JSON.stringify(updated));
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(material.id);
        return next;
      });
    } else {
      // Add to saved
      const newMaterial = {
        id: material.id,
        title: material.title,
        description: material.description,
        url: material.fileUrl,
        type: type,
        language: language,
        savedAt: new Date().toISOString(),
      };
      saved.push(newMaterial);
      localStorage.setItem("savedMaterials", JSON.stringify(saved));
      setSavedIds((prev) => new Set(prev).add(material.id));
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
            <p className="minimal-label">2026 Season 1</p>
            <h1 className="minimal-title">{seasonTopic}</h1>
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
            const langMaterials = materials[lang.key] || { video: [], reading: [] };
            return (
              <section key={lang.key} className="minimal-section">
                <h2 className="minimal-section-title">{lang.label}</h2>
                <div className="materials-row">
                  <article className="materials-card">
                    <h3>Watch</h3>
                    {langMaterials.video.length > 0 ? (
                      <ul className="materials-list-saveable">
                        {langMaterials.video.map((item) => (
                          <li key={item.id}>
                            <div className="material-content">
                              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                                {item.title}
                              </a>
                              {item.description && <span>{item.description}</span>}
                            </div>
                            <button
                              className={`save-btn ${savedIds.has(item.id) ? "saved" : ""}`}
                              onClick={() => handleSave(item, "Video", lang.label)}
                            >
                              {savedIds.has(item.id) ? "Saved" : "Save"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="materials-empty">No video materials yet.</p>
                    )}
                  </article>
                  <article className="materials-card">
                    <h3>Read</h3>
                    {langMaterials.reading.length > 0 ? (
                      <ul className="materials-list-saveable">
                        {langMaterials.reading.map((item) => (
                          <li key={item.id}>
                            <div className="material-content">
                              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                                {item.title}
                              </a>
                              {item.description && <span>{item.description}</span>}
                            </div>
                            <button
                              className={`save-btn ${savedIds.has(item.id) ? "saved" : ""}`}
                              onClick={() => handleSave(item, "Reading", lang.label)}
                            >
                              {savedIds.has(item.id) ? "Saved" : "Save"}
                            </button>
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

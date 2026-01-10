import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

const languageOptions = [
  { id: "english", label: "English" },
  { id: "spanish", label: "Spanish" },
  { id: "chinese", label: "Chinese (Mandarin)" },
];

const exampleByLanguage = {
  english: {
    q2: "For example: greeting someone and answering simple questions.",
    q3: "For example: explaining what you did recently or how you feel.",
    q5: "For example: agreeing or disagreeing and explaining why.",
  },
  spanish: {
    q2: "Por ejemplo: saludar y responder preguntas sencillas.",
    q3: "Por ejemplo: explicar lo que hiciste recientemente o cómo te sientes.",
    q5: "Por ejemplo: estar de acuerdo o en desacuerdo y explicar por qué.",
  },
  chinese: {
    q2: "例如：打招呼并回答简单的问题。",
    q3: "例如：描述你最近做了什么或你的感受。",
    q5: "例如：表达同意或不同意，并说明原因。",
  },
};

const questions = [
  {
    id: "q1",
    title: "When listening to everyday conversation in this language, how much do you usually understand?",
    options: [
      "Only a few familiar words or phrases",
      "The main idea, if the language is slow and clear",
      "Most of the conversation, with occasional gaps",
      "Almost everything, including details",
    ],
  },
  {
    id: "q2",
    title: "How comfortable are you participating in a short, everyday conversation?",
    exampleKey: "q2",
    options: [
      "I mostly listen; speaking is very limited",
      "I can respond with short or memorized phrases",
      "I can participate using complete sentences",
      "I can speak comfortably and respond naturally",
    ],
  },
  {
    id: "q3",
    title: "Can you explain your thoughts or experiences in this language?",
    exampleKey: "q3",
    options: [
      "Not yet",
      "Only with very simple words",
      "Yes, with connected sentences",
      "Yes, clearly and with detail",
    ],
  },
  {
    id: "q4",
    title: "How broad is the vocabulary you can actively use?",
    options: [
      "Very limited — mostly basic survival words",
      "Enough for familiar topics",
      "Enough to discuss a range of topics",
      "Wide enough for abstract or complex topics",
    ],
  },
  {
    id: "q5",
    title: "How well can you express and support an opinion in this language?",
    exampleKey: "q5",
    options: [
      "I cannot do this yet",
      "I can state an opinion, but not explain it",
      "I can explain my opinion simply",
      "I can explain, compare viewpoints, and respond to others",
    ],
  },
];

const levelCopy = {
  entry: {
    headline: "Entry Level",
    body:
      "You're building your foundation. This level focuses on confidence, comprehension, and simple communication.",
    bullets: [
      "Guided materials at a comfortable pace",
      "Supportive weekly teacher-led sessions",
      "Small-group discussion with no pressure",
    ],
    cta: "Join Entry Group",
  },
  intermediate: {
    headline: "Intermediate Level",
    body: "You're ready to exchange ideas and build meaning through discussion.",
    bullets: [
      "Topic-based materials for deeper thinking",
      "Weekly guided speaking practice",
      "Mini-debates to build fluency",
    ],
    cta: "Join Intermediate Group",
  },
  advanced: {
    headline: "Advanced Level",
    body:
      "You can communicate ideas clearly and engage in meaningful discussion and debate.",
    bullets: [
      "Complex topics and multiple perspectives",
      "Interactive discussion and debate prep",
      "Seasonal debate showcases",
    ],
    cta: "Join Advanced Group",
  },
};

const kickstartUrls = {
  english: "https://www.themimir.com/kickstart",
  spanish: "https://www.themimir.com/kickstart",
  chinese: "https://www.themimir.com/kickstart",
};

const scoreMap = [0, 1, 2, 3];

function calculatePlacement(answers) {
  const totalScore = answers.reduce((sum, val) => sum + val, 0);
  const maxScore = questions.length * 3;
  const percent = totalScore / maxScore;

  let level = "entry";
  if (percent >= 0.75) level = "advanced";
  else if (percent >= 0.45) level = "intermediate";

  const q2to5 = answers.slice(1);
  const min = Math.min(...q2to5);
  const max = Math.max(...q2to5);
  if (max - min >= 2) {
    if (level === "advanced") level = "intermediate";
    else if (level === "intermediate") level = "entry";
  }

  return { level, totalScore, percent };
}

export default function LevelPlacementModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("english");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const dialogRef = useRef(null);
  const lastActiveRef = useRef(null);

  const examples = exampleByLanguage[language];

  const result = useMemo(() => {
    if (answers.length !== questions.length) return null;
    return calculatePlacement(answers);
  }, [answers]);

  useEffect(() => {
    const handleTrigger = (event) => {
      const trigger = event.target.closest('[data-mimir-level-button="true"]');
      if (!trigger) return;
      event.preventDefault();
      lastActiveRef.current = trigger;
      setOpen(true);
      setStep(0);
      setAnswers([]);
    };

    document.addEventListener("click", handleTrigger);
    return () => document.removeEventListener("click", handleTrigger);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first) first.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      if (focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (lastActiveRef.current) {
        lastActiveRef.current.focus();
      } else if (previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  const handleAnswer = (value) => {
    const nextAnswers = [...answers, value];
    setAnswers(nextAnswers);
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      setStep(questions.length + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    if (step <= questions.length) {
      setAnswers((prev) => prev.slice(0, -1));
      setStep(step - 1);
    }
  };

  const handleResultCta = () => {
    if (!result) return;
    const groupSlug = `${result.level}-${language}`;
    const path = `/groups/${groupSlug}`;
    const fallback = `/groups?language=${language}&level=${result.level}`;

    const selection = {
      language,
      level: result.level,
      score: result.totalScore,
      percent: result.percent,
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mimirPlacement", JSON.stringify(selection));
      window.dispatchEvent(
        new CustomEvent("mimir_level_placement_complete", {
          detail: selection,
        })
      );
    }

    router.push(path).catch(() => router.push(fallback));
  };

  if (!open) return null;

  const totalSteps = questions.length + 1;
  const progressValue = step > questions.length ? 1 : step / totalSteps;

  return (
    <div className="level-overlay" role="dialog" aria-modal="true">
      <div className="level-modal" ref={dialogRef}>
        <div className="level-header">
          <div>
            <p className="level-kicker">Placement guide</p>
            <h2>Which level should I choose?</h2>
          </div>
          <button className="level-close" type="button" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </button>
        </div>

        <div className="level-progress">
          <div className="level-progress-bar" style={{ width: `${progressValue * 100}%` }}></div>
        </div>

        {step === 0 && (
          <div className="level-step">
            <h3>Which language are you learning?</h3>
            <div className="level-grid">
              {languageOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`level-option ${language === option.id ? "active" : ""}`}
                  onClick={() => setLanguage(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="level-actions">
              <button className="cta" type="button" onClick={() => setStep(1)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step > 0 && step <= questions.length && (
          <div className="level-step">
            <p className="level-count">
              Question {step} of {questions.length}
            </p>
            <h3>{questions[step - 1].title}</h3>
            {questions[step - 1].exampleKey ? (
              <p className="level-example">{examples[questions[step - 1].exampleKey]}</p>
            ) : null}
            <div className="level-options">
              {questions[step - 1].options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className="level-choice"
                  onClick={() => handleAnswer(scoreMap[index])}
                >
                  <span className="level-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
            <div className="level-actions">
              <button className="cta ghost" type="button" onClick={handleBack}>
                Back
              </button>
            </div>
          </div>
        )}

        {step > questions.length && result && (
          <div className="level-step">
            <p className="level-count">Result</p>
            <h3>Your Recommended Level</h3>
            <p className="level-subhead">Based on how you use the language today.</p>
            <div className="level-result">
              <h4>{levelCopy[result.level].headline}</h4>
              {result.level === "entry" ? (
                <p>
                  You're just getting started--and that's a great place to be. Start with our{" "}
                  <a className="level-link" href={kickstartUrls[language]} target="_blank" rel="noreferrer">
                    Premier Kickstart page
                  </a>{" "}
                  to build a strong foundation. You can switch your learning language anytime by signing
                  in and updating your settings. Feel free to join our free community lessons--check the{" "}
                  <a className="level-link" href="/calendar">
                    Calendar
                  </a>{" "}
                  and drop in anytime.
                </p>
              ) : (
                <>
                  <p>{levelCopy[result.level].body}</p>
                  <ul>
                    {levelCopy[result.level].bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="level-actions">
              {result.level === "entry" ? (
                <></>
              ) : (
                <button className="cta" type="button" onClick={handleResultCta}>
                  {`Join ${languageOptions.find((option) => option.id === language)?.label || language} ${
                    result.level.charAt(0).toUpperCase() + result.level.slice(1)
                  }`}
                </button>
              )}
              <button className="cta ghost" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <p className="level-footnote">
              You can always switch levels later. Confidence matters more than pressure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

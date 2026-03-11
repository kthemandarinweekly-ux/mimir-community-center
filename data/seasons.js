export const seasons = [
  {
    id: "2026-2",
    label: "2026 Season 2",
    timeline: "April - June 2026",
    active: true,
    status: "active",
    topic: "Does globalization make different cultures more similar or resilient?",
    description:
      "As ideas, media, and markets travel faster than ever, this season explores whether globalization erases cultural differences or helps cultures adapt and stay strong.",
    bannerDescription:
      "One global question. Three languages. Compare perspectives across cultures.",
    why: {
      intro:
        "Globalization shapes how we eat, speak, learn, and connect. This topic helps learners examine real cultural change while building nuanced argument skills in Chinese, Spanish, and English.",
      chinese: {
        title: "为什么这个话题很重要",
        points: [
          "全球平台和跨境消费正在改变年轻人的生活方式与价值表达",
          "传统文化在数字时代可能被弱化，也可能通过创新被重新激活",
          "讨论“趋同还是韧性”能训练更细致的比较、定义与反驳能力",
        ],
      },
      spanish: {
        title: "Por que este tema importa",
        points: [
          "La globalizacion influye en el lenguaje, el consumo y las identidades en contextos hispanohablantes",
          "Las tradiciones locales no solo se preservan: muchas veces se transforman y se fortalecen",
          "Este debate desarrolla matices: no es blanco o negro, sino adaptacion, mezcla y resistencia cultural",
        ],
      },
      english: {
        title: "Why This Topic Matters",
        points: [
          "Global culture spreads quickly through media, education, and technology",
          "Local communities often respond with adaptation, revival, and hybrid cultural forms",
          "Debating similarity vs. resilience builds stronger comparative reasoning and evidence use",
        ],
      },
    },
    languages: ["Chinese", "Spanish", "English"],
    materialLinks: {
      chinese: "/competitions#chinese",
      spanish: "/competitions#spanish",
      english: "/competitions#english",
    },
    relatedGroups: [
      { slug: "intermediate-chinese", name: "Intermediate Chinese" },
      { slug: "advanced-chinese", name: "Advanced Chinese" },
      { slug: "intermediate-spanish", name: "Intermediate Spanish" },
      { slug: "advanced-spanish", name: "Advanced Spanish" },
      { slug: "intermediate-english", name: "Intermediate English" },
      { slug: "advanced-english", name: "Advanced English" },
    ],
  },
  {
    id: "2026-1",
    label: "2026 Season 1",
    timeline: "January - March 2026",
    active: false,
    status: "archived",
    topic: "Should AI tools be used in schools?",
    description:
      "Season 1 archive: We examined how AI in education changes teaching, learning, and fairness across school systems.",
  },
  {
    id: "2026-3",
    label: "2026 Season 3",
    timeline: "July - September 2026",
    active: false,
    status: "upcoming",
    topic: "Coming Soon",
    description:
      "Next season topic will be announced soon. Follow announcements for updates.",
  },
  {
    id: "2026-4",
    label: "2026 Season 4",
    timeline: "October - December 2026",
    active: false,
    status: "upcoming",
    topic: "Coming Soon",
    description:
      "Future season topic will be announced. Stay tuned.",
  },
];

export const getCurrentSeason = () => seasons.find((season) => season.active) || seasons[0];

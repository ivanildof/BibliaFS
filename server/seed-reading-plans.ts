import { InsertReadingPlanTemplate } from "@shared/schema";

export const readingPlanTemplates: InsertReadingPlanTemplate[] = [
  {
    name: "Plano de 30 Dias - Novo Testamento",
    description: "Leia todo o Novo Testamento em 30 dias com leituras diárias equilibradas",
    duration: 30,
    category: "novo-testamento",
    difficulty: "intermediário",
    schedule: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      readings: [
        { book: "Mateus", chapter: i + 1, verses: "" }
      ],
      isCompleted: false
    })),
  },
  {
    name: "Plano de 90 Dias - Bíblia Completa",
    description: "Leia toda a Bíblia em 90 dias com aproximadamente 13 capítulos por dia",
    duration: 90,
    category: "biblia-completa",
    difficulty: "avançado",
    schedule: [
      { day: 1, readings: [{ book: "Gênesis", chapter: 1, verses: "" }, { book: "Gênesis", chapter: 2, verses: "" }], isCompleted: false },
      { day: 2, readings: [{ book: "Gênesis", chapter: 3, verses: "" }, { book: "Gênesis", chapter: 4, verses: "" }], isCompleted: false },
      { day: 3, readings: [{ book: "Gênesis", chapter: 5, verses: "" }, { book: "Gênesis", chapter: 6, verses: "" }], isCompleted: false },
    ],
  },
  {
    name: "Plano de 365 Dias - Bíblia Completa",
    description: "Leia toda a Bíblia em um ano com leituras diárias confortáveis",
    duration: 365,
    category: "biblia-completa",
    difficulty: "iniciante",
    schedule: [
      { day: 1, readings: [{ book: "Gênesis", chapter: 1, verses: "" }], isCompleted: false },
      { day: 2, readings: [{ book: "Gênesis", chapter: 2, verses: "" }], isCompleted: false },
      { day: 3, readings: [{ book: "Gênesis", chapter: 3, verses: "" }], isCompleted: false },
    ],
  },
  {
    name: "Plano de 7 Dias - Salmos de Louvor",
    description: "Uma semana focada nos salmos de louvor e adoração",
    duration: 7,
    category: "devocional",
    difficulty: "iniciante",
    schedule: [
      { day: 1, readings: [{ book: "Salmos", chapter: 23, verses: "" }], isCompleted: false },
      { day: 2, readings: [{ book: "Salmos", chapter: 100, verses: "" }], isCompleted: false },
      { day: 3, readings: [{ book: "Salmos", chapter: 103, verses: "" }], isCompleted: false },
      { day: 4, readings: [{ book: "Salmos", chapter: 145, verses: "" }], isCompleted: false },
      { day: 5, readings: [{ book: "Salmos", chapter: 146, verses: "" }], isCompleted: false },
      { day: 6, readings: [{ book: "Salmos", chapter: 147, verses: "" }], isCompleted: false },
      { day: 7, readings: [{ book: "Salmos", chapter: 150, verses: "" }], isCompleted: false },
    ],
  },
  {
    name: "Plano de 14 Dias - Evangelho de João",
    description: "Explore o Evangelho de João em duas semanas",
    duration: 14,
    category: "evangelhos",
    difficulty: "iniciante",
    schedule: [
      { day: 1, readings: [{ book: "João", chapter: 1, verses: "" }, { book: "João", chapter: 2, verses: "" }], isCompleted: false },
      { day: 2, readings: [{ book: "João", chapter: 3, verses: "" }, { book: "João", chapter: 4, verses: "" }], isCompleted: false },
      { day: 3, readings: [{ book: "João", chapter: 5, verses: "" }, { book: "João", chapter: 6, verses: "" }], isCompleted: false },
      { day: 4, readings: [{ book: "João", chapter: 7, verses: "" }, { book: "João", chapter: 8, verses: "" }], isCompleted: false },
      { day: 5, readings: [{ book: "João", chapter: 9, verses: "" }, { book: "João", chapter: 10, verses: "" }], isCompleted: false },
      { day: 6, readings: [{ book: "João", chapter: 11, verses: "" }, { book: "João", chapter: 12, verses: "" }], isCompleted: false },
      { day: 7, readings: [{ book: "João", chapter: 13, verses: "" }, { book: "João", chapter: 14, verses: "" }], isCompleted: false },
      { day: 8, readings: [{ book: "João", chapter: 15, verses: "" }, { book: "João", chapter: 16, verses: "" }], isCompleted: false },
      { day: 9, readings: [{ book: "João", chapter: 17, verses: "" }, { book: "João", chapter: 18, verses: "" }], isCompleted: false },
      { day: 10, readings: [{ book: "João", chapter: 19, verses: "" }], isCompleted: false },
      { day: 11, readings: [{ book: "João", chapter: 20, verses: "" }], isCompleted: false },
      { day: 12, readings: [{ book: "João", chapter: 21, verses: "" }], isCompleted: false },
      { day: 13, readings: [{ book: "João", chapter: 1, verses: "1-18" }], isCompleted: false },
      { day: 14, readings: [{ book: "João", chapter: 3, verses: "16-21" }], isCompleted: false },
    ],
  },
  {
    name: "Plano de 21 Dias - Provérbios",
    description: "Um capítulo de Provérbios por dia para sabedoria diária",
    duration: 21,
    category: "sabedoria",
    difficulty: "iniciante",
    schedule: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      readings: [{ book: "Provérbios", chapter: i + 1, verses: "" }],
      isCompleted: false
    })),
  },
];

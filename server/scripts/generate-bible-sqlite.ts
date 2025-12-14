import initSqlJs, { Database } from "sql.js";
import * as fs from "fs";
import * as path from "path";

const NVI_JSON_URL = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_nvi.json";
const OUTPUT_PATH = path.join(process.cwd(), "client/public/bible.db");

interface BibleBook {
  abbrev: string;
  chapters: string[][];
}

const bookInfo: Record<string, { order: number; testament: string; name: string }> = {
  gn: { order: 1, testament: "AT", name: "Gênesis" },
  ex: { order: 2, testament: "AT", name: "Êxodo" },
  lv: { order: 3, testament: "AT", name: "Levítico" },
  nm: { order: 4, testament: "AT", name: "Números" },
  dt: { order: 5, testament: "AT", name: "Deuteronômio" },
  js: { order: 6, testament: "AT", name: "Josué" },
  jz: { order: 7, testament: "AT", name: "Juízes" },
  rt: { order: 8, testament: "AT", name: "Rute" },
  "1sm": { order: 9, testament: "AT", name: "1 Samuel" },
  "2sm": { order: 10, testament: "AT", name: "2 Samuel" },
  "1rs": { order: 11, testament: "AT", name: "1 Reis" },
  "2rs": { order: 12, testament: "AT", name: "2 Reis" },
  "1cr": { order: 13, testament: "AT", name: "1 Crônicas" },
  "2cr": { order: 14, testament: "AT", name: "2 Crônicas" },
  ed: { order: 15, testament: "AT", name: "Esdras" },
  ne: { order: 16, testament: "AT", name: "Neemias" },
  et: { order: 17, testament: "AT", name: "Ester" },
  job: { order: 18, testament: "AT", name: "Jó" },
  jó: { order: 18, testament: "AT", name: "Jó" },
  sl: { order: 19, testament: "AT", name: "Salmos" },
  pv: { order: 20, testament: "AT", name: "Provérbios" },
  ec: { order: 21, testament: "AT", name: "Eclesiastes" },
  ct: { order: 22, testament: "AT", name: "Cantares" },
  is: { order: 23, testament: "AT", name: "Isaías" },
  jr: { order: 24, testament: "AT", name: "Jeremias" },
  lm: { order: 25, testament: "AT", name: "Lamentações" },
  ez: { order: 26, testament: "AT", name: "Ezequiel" },
  dn: { order: 27, testament: "AT", name: "Daniel" },
  os: { order: 28, testament: "AT", name: "Oséias" },
  jl: { order: 29, testament: "AT", name: "Joel" },
  am: { order: 30, testament: "AT", name: "Amós" },
  ob: { order: 31, testament: "AT", name: "Obadias" },
  jn: { order: 32, testament: "AT", name: "Jonas" },
  mq: { order: 33, testament: "AT", name: "Miquéias" },
  na: { order: 34, testament: "AT", name: "Naum" },
  hc: { order: 35, testament: "AT", name: "Habacuque" },
  sf: { order: 36, testament: "AT", name: "Sofonias" },
  ag: { order: 37, testament: "AT", name: "Ageu" },
  zc: { order: 38, testament: "AT", name: "Zacarias" },
  ml: { order: 39, testament: "AT", name: "Malaquias" },
  mt: { order: 40, testament: "NT", name: "Mateus" },
  mc: { order: 41, testament: "NT", name: "Marcos" },
  lc: { order: 42, testament: "NT", name: "Lucas" },
  jo: { order: 43, testament: "NT", name: "João" },
  at: { order: 44, testament: "NT", name: "Atos" },
  atos: { order: 44, testament: "NT", name: "Atos" },
  rm: { order: 45, testament: "NT", name: "Romanos" },
  "1co": { order: 46, testament: "NT", name: "1 Coríntios" },
  "2co": { order: 47, testament: "NT", name: "2 Coríntios" },
  gl: { order: 48, testament: "NT", name: "Gálatas" },
  ef: { order: 49, testament: "NT", name: "Efésios" },
  fp: { order: 50, testament: "NT", name: "Filipenses" },
  cl: { order: 51, testament: "NT", name: "Colossenses" },
  "1ts": { order: 52, testament: "NT", name: "1 Tessalonicenses" },
  "2ts": { order: 53, testament: "NT", name: "2 Tessalonicenses" },
  "1tm": { order: 54, testament: "NT", name: "1 Timóteo" },
  "2tm": { order: 55, testament: "NT", name: "2 Timóteo" },
  tt: { order: 56, testament: "NT", name: "Tito" },
  fm: { order: 57, testament: "NT", name: "Filemom" },
  hb: { order: 58, testament: "NT", name: "Hebreus" },
  tg: { order: 59, testament: "NT", name: "Tiago" },
  "1pe": { order: 60, testament: "NT", name: "1 Pedro" },
  "2pe": { order: 61, testament: "NT", name: "2 Pedro" },
  "1jo": { order: 62, testament: "NT", name: "1 João" },
  "2jo": { order: 63, testament: "NT", name: "2 João" },
  "3jo": { order: 64, testament: "NT", name: "3 João" },
  jd: { order: 65, testament: "NT", name: "Judas" },
  ap: { order: 66, testament: "NT", name: "Apocalipse" },
};

async function fetchBibleJson(): Promise<BibleBook[]> {
  console.log("Fetching Bible JSON from GitHub...");
  const response = await fetch(NVI_JSON_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Bible JSON: ${response.statusText}`);
  }
  const data = await response.json();
  console.log(`Fetched ${data.length} books`);
  return data;
}

async function generateSQLiteDatabase(books: BibleBook[]): Promise<Uint8Array> {
  console.log("Initializing sql.js...");
  const SQL = await initSqlJs();
  const db: Database = new SQL.Database();

  console.log("Creating tables...");
  db.run(`
    CREATE TABLE books (
      id INTEGER PRIMARY KEY,
      abbrev TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      chapters INTEGER NOT NULL,
      testament TEXT NOT NULL,
      book_order INTEGER NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);

  db.run(`CREATE INDEX idx_verses_book_chapter ON verses(book_id, chapter);`);
  db.run(`CREATE INDEX idx_books_abbrev ON books(abbrev);`);

  console.log("Inserting books and verses...");
  let totalVerses = 0;

  const insertBook = db.prepare(
    "INSERT INTO books (id, abbrev, name, chapters, testament, book_order) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertVerse = db.prepare(
    "INSERT INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)"
  );

  for (const book of books) {
    const abbrev = book.abbrev.toLowerCase();
    const info = bookInfo[abbrev];
    
    if (!info) {
      console.warn(`Unknown book abbreviation: ${abbrev}, skipping...`);
      continue;
    }

    const bookId = info.order;
    const chapterCount = book.chapters.length;

    insertBook.run([bookId, abbrev, info.name, chapterCount, info.testament, info.order]);

    for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
      const chapterNum = chapterIdx + 1;
      const verses = book.chapters[chapterIdx];

      for (let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
        const verseNum = verseIdx + 1;
        const verseText = verses[verseIdx] || "";
        if (verseText) {
          insertVerse.run([bookId, chapterNum, verseNum, verseText]);
          totalVerses++;
        }
      }
    }
  }

  insertBook.free();
  insertVerse.free();

  console.log(`Inserted ${books.length} books and ${totalVerses} verses`);

  const data = db.export();
  db.close();

  return data;
}

async function main() {
  try {
    const books = await fetchBibleJson();
    const dbData = await generateSQLiteDatabase(books);

    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, Buffer.from(dbData));
    console.log(`SQLite database saved to: ${OUTPUT_PATH}`);
    console.log(`File size: ${(dbData.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error("Error generating SQLite database:", error);
    process.exit(1);
  }
}

main();

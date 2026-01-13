import initSqlJs, { Database } from "sql.js";

const abbrevMapping: Record<string, string> = {
  job: "jó",
  at: "atos",
};

function normalizeAbbrev(abbrev: string): string {
  const lower = abbrev.toLowerCase();
  return abbrevMapping[lower] || lower;
}

interface BibleBook {
  id: number;
  abbrev: string;
  name: string;
  chapters: number;
  testament: string;
  book_order: number;
}

interface BibleVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

interface ChapterData {
  book: string;
  bookName: string;
  chapter: number;
  verses: { verse: number; text: string }[];
  totalChapters: number;
}

class BibleSQLiteService {
  private db: Database | null = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async init(): Promise<boolean> {
    if (this.db) return true;
    
    if (this.loadPromise) {
      await this.loadPromise;
      return this.db !== null;
    }

    this.loadPromise = this.loadDatabase();
    await this.loadPromise;
    return this.db !== null;
  }

  private async loadDatabase(): Promise<void> {
    if (this.isLoading || this.db) return;
    
    this.isLoading = true;
    try {
      console.log("[BibleSQLite] Initializing sql.js...");
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      console.log("[BibleSQLite] Fetching bible.db...");
      const response = await fetch("./bible.db");
      if (!response.ok) {
        throw new Error(`Failed to fetch bible.db: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      this.db = new SQL.Database(new Uint8Array(buffer));
      console.log("[BibleSQLite] Database loaded successfully");
    } catch (error) {
      console.error("[BibleSQLite] Error loading database:", error);
      this.db = null;
    } finally {
      this.isLoading = false;
    }
  }

  async getBooks(): Promise<BibleBook[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const result = this.db.exec("SELECT * FROM books ORDER BY book_order");
      if (!result.length) return [];

      const columns = result[0].columns;
      return result[0].values.map((row) => {
        const book: any = {};
        columns.forEach((col, idx) => {
          book[col] = row[idx];
        });
        return book as BibleBook;
      });
    } catch (error) {
      console.error("[BibleSQLite] Error getting books:", error);
      return [];
    }
  }

  async getBook(abbrev: string): Promise<BibleBook | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const normalizedAbbrev = normalizeAbbrev(abbrev);
      const stmt = this.db.prepare("SELECT * FROM books WHERE abbrev = ?");
      stmt.bind([normalizedAbbrev]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row as unknown as BibleBook;
      }
      stmt.free();
      return null;
    } catch (error) {
      console.error("[BibleSQLite] Error getting book:", error);
      return null;
    }
  }

  async getChapter(abbrev: string, chapter: number): Promise<ChapterData | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const book = await this.getBook(abbrev);
      if (!book) {
        console.warn(`[BibleSQLite] Book not found: ${abbrev}`);
        return null;
      }

      const stmt = this.db.prepare(
        "SELECT verse, text FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse"
      );
      stmt.bind([book.id, chapter]);

      const verses: { verse: number; text: string }[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        verses.push({
          verse: row.verse as number,
          text: row.text as string,
        });
      }
      stmt.free();

      if (verses.length === 0) {
        console.warn(`[BibleSQLite] No verses found for ${abbrev} ${chapter}`);
        return null;
      }

      return {
        book: book.abbrev,
        bookName: book.name,
        chapter,
        verses,
        totalChapters: book.chapters,
      };
    } catch (error) {
      console.error("[BibleSQLite] Error getting chapter:", error);
      return null;
    }
  }

  async getVerse(abbrev: string, chapter: number, verse: number): Promise<string | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const book = await this.getBook(abbrev);
      if (!book) return null;

      const stmt = this.db.prepare(
        "SELECT text FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?"
      );
      stmt.bind([book.id, chapter, verse]);

      let text: string | null = null;
      if (stmt.step()) {
        const row = stmt.getAsObject();
        text = row.text as string;
      }
      stmt.free();
      return text;
    } catch (error) {
      console.error("[BibleSQLite] Error getting verse:", error);
      return null;
    }
  }

  async searchVerses(query: string, limit = 50): Promise<{ book: string; chapter: number; verse: number; text: string }[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const searchQuery = `%${query}%`;
      const stmt = this.db.prepare(`
        SELECT b.abbrev as book, v.chapter, v.verse, v.text 
        FROM verses v 
        JOIN books b ON v.book_id = b.id 
        WHERE v.text LIKE ? 
        ORDER BY b.book_order, v.chapter, v.verse
        LIMIT ?
      `);
      stmt.bind([searchQuery, limit]);

      const results: { book: string; chapter: number; verse: number; text: string }[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
          book: row.book as string,
          chapter: row.chapter as number,
          verse: row.verse as number,
          text: row.text as string,
        });
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error("[BibleSQLite] Error searching verses:", error);
      return [];
    }
  }

  isReady(): boolean {
    return this.db !== null;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const bibleSqlite = new BibleSQLiteService();

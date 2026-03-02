import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const NVI_JSON_URL = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_nvi.json";

const bookInfo = {
  gn: { order: 1, testament: "OT", name: "Gênesis" },
  ex: { order: 2, testament: "OT", name: "Êxodo" },
  lv: { order: 3, testament: "OT", name: "Levítico" },
  nm: { order: 4, testament: "OT", name: "Números" },
  dt: { order: 5, testament: "OT", name: "Deuteronômio" },
  js: { order: 6, testament: "OT", name: "Josué" },
  jz: { order: 7, testament: "OT", name: "Juízes" },
  rt: { order: 8, testament: "OT", name: "Rute" },
  "1sm": { order: 9, testament: "OT", name: "1 Samuel" },
  "2sm": { order: 10, testament: "OT", name: "2 Samuel" },
  "1rs": { order: 11, testament: "OT", name: "1 Reis" },
  "2rs": { order: 12, testament: "OT", name: "2 Reis" },
  "1cr": { order: 13, testament: "OT", name: "1 Crônicas" },
  "2cr": { order: 14, testament: "OT", name: "2 Crônicas" },
  ed: { order: 15, testament: "OT", name: "Esdras" },
  ne: { order: 16, testament: "OT", name: "Neemias" },
  et: { order: 17, testament: "OT", name: "Ester" },
  job: { order: 18, testament: "OT", name: "Jó" },
  jó: { order: 18, testament: "OT", name: "Jó" },
  sl: { order: 19, testament: "OT", name: "Salmos" },
  pv: { order: 20, testament: "OT", name: "Provérbios" },
  ec: { order: 21, testament: "OT", name: "Eclesiastes" },
  ct: { order: 22, testament: "OT", name: "Cantares" },
  is: { order: 23, testament: "OT", name: "Isaías" },
  jr: { order: 24, testament: "OT", name: "Jeremias" },
  lm: { order: 25, testament: "OT", name: "Lamentações" },
  ez: { order: 26, testament: "OT", name: "Ezequiel" },
  dn: { order: 27, testament: "OT", name: "Daniel" },
  os: { order: 28, testament: "OT", name: "Oséias" },
  jl: { order: 29, testament: "OT", name: "Joel" },
  am: { order: 30, testament: "OT", name: "Amós" },
  ob: { order: 31, testament: "OT", name: "Obadias" },
  jn: { order: 32, testament: "OT", name: "Jonas" },
  mq: { order: 33, testament: "OT", name: "Miquéias" },
  na: { order: 34, testament: "OT", name: "Naum" },
  hc: { order: 35, testament: "OT", name: "Habacuque" },
  sf: { order: 36, testament: "OT", name: "Sofonias" },
  ag: { order: 37, testament: "OT", name: "Ageu" },
  zc: { order: 38, testament: "OT", name: "Zacarias" },
  ml: { order: 39, testament: "OT", name: "Malaquias" },
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

async function fetchBibleJson() {
  console.log("📥 Baixando dados da Bíblia NVI do GitHub...");
  const response = await fetch(NVI_JSON_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Bible JSON: ${response.statusText}`);
  }
  const data = await response.json();
  console.log(`✅ ${data.length} livros baixados\n`);
  return data;
}

async function populateSupabase() {
  console.log("🔥 POPULANDO SUPABASE COM DADOS DA BÍBLIA NVI\n");
  console.log("=" .repeat(70) + "\n");

  try {
    // Passo 1: Criar tradução
    console.log("📖 Passo 1: Criando tradução NVI...");
    const translation = {
      id: "nvi",
      name: "Nova Versão Internacional",
      abbreviation: "NVI",
      language: "Português",
      is_available: true,
      access_level: "free"
    };

    const { error: transError } = await supabase
      .from("bible_translations")
      .upsert(translation);

    if (transError) {
      console.error(`❌ Erro ao criar tradução: ${transError.message}`);
      return;
    }
    console.log("✅ Tradução NVI criada\n");

    // Passo 2: Baixar dados
    const books = await fetchBibleJson();

    // Passo 3: Inserir livros
    console.log("📚 Passo 2: Inserindo livros...");
    for (const book of books) {
      const abbrev = book.abbrev.toLowerCase();
      const info = bookInfo[abbrev];
      
      if (!info) {
        console.warn(`  ⚠️  Livro desconhecido: ${abbrev}, pulando...`);
        continue;
      }

      const bookData = {
        id: `nvi-${abbrev}`,
        name: info.name,
        abbreviation: abbrev.toUpperCase(),
        testament: info.testament,
        order_index: info.order,
        chapter_count: book.chapters.length
      };

      const { error: bookError } = await supabase
        .from("bible_books")
        .upsert(bookData);

      if (bookError) {
        console.error(`  ❌ Erro ao inserir ${info.name}: ${bookError.message}`);
      } else {
        console.log(`  ✅ ${info.name} (${book.chapters.length} capítulos)`);
      }
    }
    console.log(`\n✅ ${books.length} livros inseridos\n`);

    // Passo 4: Inserir capítulos e versículos
    console.log("📝 Passo 3: Inserindo versículos...");
    console.log("   (Isso pode levar alguns minutos)\n");
    
    let totalVerses = 0;
    let batchVerses = [];
    const BATCH_SIZE = 500;

    for (const book of books) {
      const abbrev = book.abbrev.toLowerCase();
      const info = bookInfo[abbrev];
      
      if (!info) continue;

      const bookId = `nvi-${abbrev}`;

      for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
        const chapterNum = chapterIdx + 1;
        const verses = book.chapters[chapterIdx];

        // Inserir capítulo
        const chapterData = {
          id: `${bookId}-${chapterNum}`,
          book_id: bookId,
          chapter_number: chapterNum,
          verse_count: verses.length
        };

        await supabase.from("bible_chapters").upsert(chapterData);

        // Preparar versículos para inserção em lote
        for (let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
          const verseNum = verseIdx + 1;
          const verseText = verses[verseIdx] || "";
          
          if (verseText) {
            batchVerses.push({
              id: `${bookId}-${chapterNum}-${verseNum}`,
              translation_id: "nvi",
              book_id: bookId,
              chapter_number: chapterNum,
              verse_number: verseNum,
              verse_text: verseText,
              created_at: new Date().toISOString()
            });
            totalVerses++;

            // Inserir em lotes
            if (batchVerses.length >= BATCH_SIZE) {
              const { error } = await supabase
                .from("bible_verses")
                .upsert(batchVerses);
              
              if (error) {
                console.error(`❌ Erro no lote: ${error.message}`);
              } else {
                console.log(`   ✅ ${totalVerses} versículos inseridos...`);
              }
              batchVerses = [];
            }
          }
        }
      }
    }

    // Inserir versículos restantes
    if (batchVerses.length > 0) {
      const { error } = await supabase
        .from("bible_verses")
        .upsert(batchVerses);
      
      if (error) {
        console.error(`❌ Erro no lote final: ${error.message}`);
      }
    }

    console.log(`\n✅ ${totalVerses} versículos inseridos!\n`);

    console.log("=" .repeat(70));
    console.log("\n🎉 IMPORTAÇÃO CONCLUÍDA COM SUCESSO!\n");
    console.log("📊 Resumo:");
    console.log(`   📖 1 tradução (NVI)`);
    console.log(`   📚 ${books.length} livros`);
    console.log(`   📝 ${totalVerses} versículos\n`);

  } catch (error) {
    console.error("\n❌ Erro durante a importação:", error);
    throw error;
  }
}

await populateSupabase();

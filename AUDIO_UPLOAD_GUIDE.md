# 📚 Como Upload de Áudio para Supabase Storage

## 1️⃣ Organizar seus arquivos localmente

Crie uma pasta com todos os MP3s que você baixou:

```
audio-files/
├── 1.mp3  (Genesis 1)
├── 2.mp3  (Genesis 2)
├── 3.mp3  (Genesis 3)
└── ... (mais capítulos)
```

**Importante:** Os arquivos devem ser nomeados como `{CAPÍTULO}.mp3`

## 2️⃣ Fazer upload usando o script

```bash
# Para Inglês (EN/WEB)
npx tsx server/scripts/upload-local-audio.ts ./audio-files EN WEB gn

# Para Português (PT/ARC)
npx tsx server/scripts/upload-local-audio.ts ./audio-files PT ARC mt

# Genérico
npx tsx server/scripts/upload-local-audio.ts [pasta-local] [IDIOMA] [VERSÃO] [LIVRO]
```

## 3️⃣ Parâmetros

| Parâmetro | Exemplo | Descrição |
|-----------|---------|-----------|
| `[pasta-local]` | `./audio-files` | Pasta com MP3s |
| `[IDIOMA]` | `EN`, `PT` | EN = English, PT = Português |
| `[VERSÃO]` | `WEB`, `ARC` | WEB = World English Bible, ARC = Almeida |
| `[LIVRO]` | `gn`, `mt`, `jo` | Abreviação do livro |

## 4️⃣ Abreviações de Livros

```
OT: gn, ex, lv, nm, dt, js, jz, rt, 1sm, 2sm, 1rs, 2rs, 1cr, 2cr, ed, ne, et, job, sl, pv, ec, ct, is, jr, lm, ez, dn, os, jl, am, ob, jn, mq, na, hc, sf, ag, zc, ml
NT: mt, mc, lc, jo, at, rm, 1co, 2co, gl, ef, fp, cl, 1ts, 2ts, 1tm, 2tm, tt, fm, hb, tg, 1pe, 2pe, 1jo, 2jo, 3jo, jd, ap
```

## 5️⃣ Exemplo Completo

```bash
# Baixei Genesis em inglês em ./my-audio/
npx tsx server/scripts/upload-local-audio.ts ./my-audio EN WEB gn

# Esperado:
# ✅ EN/WEB/gn/1.mp3 (7.2 MB)
# ✅ EN/WEB/gn/2.mp3 (4.5 MB)
# ... 50 capítulos no total
```

## ⚠️ Dicas

- **Formato**: Apenas MP3 funciona
- **Taxa**: 1 arquivo por segundo (para não sobrecarregar)
- **Credenciais**: Precisa de `SUPABASE_SERVICE_ROLE_KEY` no `.env`
- **Espaço**: Supabase oferece 1 GB grátis por projeto

## ✨ Depois do Upload

Os arquivos estarão disponíveis em:
```
https://[seu-supabase-url]/storage/v1/object/public/bible-audio/EN/WEB/gn/1.mp3
```

E o app automaticamente conseguirá reproduzir! 🎵

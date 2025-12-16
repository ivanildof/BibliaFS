# 🎵 Download Áudio Português Brasil - Automático

## 🚀 Quick Start

```bash
# Genesis (50 capítulos)
npx tsx server/scripts/download-pt-audio-from-archive.ts gn 50

# Mateus (28 capítulos)
npx tsx server/scripts/download-pt-audio-from-archive.ts mt 28

# João (21 capítulos)
npx tsx server/scripts/download-pt-audio-from-archive.ts jo 21
```

✅ **Pronto!** Vai fazer download de Archive.org + upload automático para Supabase!

---

## 📖 Livros Disponíveis

```
gn - Genesis             (50 capítulos)
ex - Êxodo              (40 capítulos)
lv - Levítico           (27 capítulos)
nm - Números            (36 capítulos)
dt - Deuteronômio       (34 capítulos)
js - Josué              (24 capítulos)
jz - Juízes             (21 capítulos)
rt - Rute               (4 capítulos)
mt - Mateus             (28 capítulos)
mc - Marcos             (16 capítulos)
lc - Lucas              (24 capítulos)
jo - João               (21 capítulos)
```

---

## ⚙️ O que o Script Faz

1. **Baixa** do Archive.org (públicamente disponível)
2. **Organiza** em formato correto
3. **Sobe** automaticamente para Supabase Storage
4. **Limpa** arquivos temporários
5. **Sincroniza** com seu app em tempo real

---

## ⏱️ Tempo Estimado

- Genesis: ~50 minutos (50 arquivos x 1s delay)
- Mateus: ~28 minutos
- Livro pequeno: ~5 minutos

---

## 📊 Resultado Final

Depois de rodar, seus áudios estarão em:

```
PT/ARC/gn/1.mp3
PT/ARC/gn/2.mp3
...
PT/ARC/gn/50.mp3
```

E o app **automaticamente consegue reproduzir**! 🎵

---

## ❓ Dúvidas?

- **Espaço**: Supabase oferece 1 GB grátis
- **Qualidade**: MP3 em qualidade alta
- **Fontes**: Archive.org + Faith Comes By Hearing
- **Credenciais**: Precisa de `SUPABASE_SERVICE_ROLE_KEY` no `.env`

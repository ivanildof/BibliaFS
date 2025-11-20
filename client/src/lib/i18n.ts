export type Language = 'pt' | 'en' | 'nl' | 'es';

export interface Translations {
  common: {
    appName: string;
    loading: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    close: string;
  };
  nav: {
    home: string;
    bible: string;
    plans: string;
    discover: string;
    you: string;
    progress: string;
    prayers: string;
    aiStudy: string;
    podcasts: string;
    teacherMode: string;
    settings: string;
  };
  sections: {
    mainMenu: string;
    study: string;
    teaching: string;
    premiumStudy: string;
  };
  bible: {
    readChapter: string;
    bookmarks: string;
    settings: string;
    selectBook: string;
    selectChapter: string;
    selectVersion: string;
    markAsRead: string;
    offlineMode: string;
    searchVerses: string;
  };
  bibleBooks: Record<string, string>;
  plans: {
    title: string;
    myPlans: string;
    available: string;
    createPlan: string;
    startPlan: string;
    days: string;
    progress: string;
    completeDay: string;
    dayCompleted: string;
  };
  progress: {
    title: string;
    level: string;
    xp: string;
    streak: string;
    achievements: string;
    milestone: string;
    reading: string;
    streakCategory: string;
  };
  achievements: {
    firstRead: string;
    firstReadDesc: string;
    streak7: string;
    streak7Desc: string;
    streak30: string;
    streak30Desc: string;
    streak100: string;
    streak100Desc: string;
  };
  dailyVerse: {
    verse_of_the_day: string;
    copy: string;
    share: string;
    download_image: string;
    verse_copied: string;
    verse_copied_description: string;
    copy_failed: string;
    copy_failed_description: string;
    image_downloaded: string;
    image_downloaded_description: string;
    download_failed: string;
    download_failed_description: string;
  };
  donate: {
    title: string;
    subtitle: string;
    one_time: string;
    recurring: string;
    monthly: string;
    amount: string;
    custom_amount: string;
    destination: string;
    app_operations: string;
    bible_translation: string;
    anonymous: string;
    message: string;
    message_placeholder: string;
    donate_button: string;
    processing: string;
    success_title: string;
    success_message: string;
    error_title: string;
    configure_stripe: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    common: {
      appName: 'Bíblia+',
      loading: 'Carregando...',
      error: 'Erro',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      search: 'Buscar',
      close: 'Fechar',
    },
    nav: {
      home: 'Início',
      bible: 'Bíblia',
      plans: 'Planos',
      discover: 'Descubra',
      you: 'Você',
      progress: 'Progresso',
      prayers: 'Orações',
      aiStudy: 'Estudo com IA',
      podcasts: 'Podcasts',
      teacherMode: 'Modo Professor',
      settings: 'Configurações',
    },
    sections: {
      mainMenu: 'Menu Principal',
      study: 'Estudo',
      teaching: 'Ensino',
      premiumStudy: 'Estudo Premium',
    },
    bible: {
      readChapter: 'Ler Capítulo',
      bookmarks: 'Favoritos',
      settings: 'Configurações',
      selectBook: 'Selecione um livro',
      selectChapter: 'Selecione um capítulo',
      selectVersion: 'Versão da Bíblia',
      markAsRead: 'Marcar como Lido',
      offlineMode: 'Modo Offline',
      searchVerses: 'Buscar versículos',
    },
    bibleBooks: {
      'gn': 'Gênesis', 'ex': 'Êxodo', 'lv': 'Levítico', 'nm': 'Números', 'dt': 'Deuteronômio',
      'js': 'Josué', 'jz': 'Juízes', 'rt': 'Rute', '1sm': '1 Samuel', '2sm': '2 Samuel',
      '1rs': '1 Reis', '2rs': '2 Reis', '1cr': '1 Crônicas', '2cr': '2 Crônicas',
      'ed': 'Esdras', 'ne': 'Neemias', 'et': 'Ester', 'job': 'Jó', 'sl': 'Salmos',
      'pv': 'Provérbios', 'ec': 'Eclesiastes', 'ct': 'Cânticos', 'is': 'Isaías',
      'jr': 'Jeremias', 'lm': 'Lamentações', 'ez': 'Ezequiel', 'dn': 'Daniel',
      'os': 'Oseias', 'jl': 'Joel', 'am': 'Amós', 'ob': 'Obadias', 'jn': 'Jonas',
      'mq': 'Miqueias', 'na': 'Naum', 'hc': 'Habacuque', 'sf': 'Sofonias',
      'ag': 'Ageu', 'zc': 'Zacarias', 'ml': 'Malaquias',
      'mt': 'Mateus', 'mc': 'Marcos', 'lc': 'Lucas', 'jo': 'João', 'at': 'Atos',
      'rm': 'Romanos', '1co': '1 Coríntios', '2co': '2 Coríntios', 'gl': 'Gálatas',
      'ef': 'Efésios', 'fp': 'Filipenses', 'cl': 'Colossenses',
      '1ts': '1 Tessalonicenses', '2ts': '2 Tessalonicenses',
      '1tm': '1 Timóteo', '2tm': '2 Timóteo', 'tt': 'Tito', 'fm': 'Filemom',
      'hb': 'Hebreus', 'tg': 'Tiago', '1pe': '1 Pedro', '2pe': '2 Pedro',
      '1jo': '1 João', '2jo': '2 João', '3jo': '3 João', 'jd': 'Judas', 'ap': 'Apocalipse',
    },
    plans: {
      title: 'Planos de Leitura',
      myPlans: 'Meus Planos',
      available: 'Planos Disponíveis',
      createPlan: 'Criar Plano',
      startPlan: 'Iniciar Plano',
      days: 'dias',
      progress: 'Progresso',
      completeDay: 'Completar Dia',
      dayCompleted: 'Dia Completo',
    },
    progress: {
      title: 'Seu Progresso',
      level: 'Nível',
      xp: 'XP',
      streak: 'Sequência',
      achievements: 'Conquistas',
      milestone: 'Marco',
      reading: 'Leitura',
      streakCategory: 'Sequência',
    },
    achievements: {
      firstRead: 'Primeira Leitura',
      firstReadDesc: 'Leia seu primeiro capítulo',
      streak7: 'Sequência de 7 Dias',
      streak7Desc: 'Leia por 7 dias seguidos',
      streak30: 'Sequência de 30 Dias',
      streak30Desc: 'Leia por 30 dias seguidos',
      streak100: 'Sequência de 100 Dias',
      streak100Desc: 'Leia por 100 dias seguidos',
    },
    dailyVerse: {
      verse_of_the_day: 'Versículo do Dia',
      copy: 'Copiar',
      share: 'Compartilhar',
      download_image: 'Baixar Imagem',
      verse_copied: 'Versículo copiado!',
      verse_copied_description: 'Texto copiado para a área de transferência',
      copy_failed: 'Erro ao copiar',
      copy_failed_description: 'Não foi possível copiar o texto',
      image_downloaded: 'Imagem baixada!',
      image_downloaded_description: 'Versículo salvo como imagem',
      download_failed: 'Erro ao baixar',
      download_failed_description: 'Não foi possível salvar a imagem',
    },
    donate: {
      title: 'Apoie o Bíblia+',
      subtitle: 'Sua doação mantém o Bíblia+ 100% gratuito e ajuda a levar a Palavra a mais pessoas, em mais idiomas. Cada contribuição sustenta o desenvolvimento contínuo do app, permitindo melhorias constantes, novos recursos e maior acessibilidade. Você não está apenas doando — está sendo parte da história de quem busca a Palavra, onde quer que esteja.',
      one_time: 'Doação Única',
      recurring: 'Doação Recorrente',
      monthly: 'Mensal',
      amount: 'Valor',
      custom_amount: 'Valor personalizado',
      destination: 'Destino da doação',
      app_operations: 'Operações do aplicativo',
      bible_translation: 'Tradução bíblica',
      anonymous: 'Doar anonimamente',
      message: 'Mensagem (opcional)',
      message_placeholder: 'Deixe uma mensagem de apoio...',
      donate_button: 'Doar Agora',
      processing: 'Processando...',
      success_title: 'Doação realizada com sucesso!',
      success_message: 'Muito obrigado pelo seu apoio. Que Deus abençoe você!',
      error_title: 'Erro ao processar doação',
      configure_stripe: 'Sistema de doações não configurado. Entre em contato com o suporte para habilitar doações.',
    },
  },
  en: {
    common: {
      appName: 'Bible+',
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      close: 'Close',
    },
    nav: {
      home: 'Home',
      bible: 'Bible',
      plans: 'Plans',
      discover: 'Discover',
      you: 'You',
      progress: 'Progress',
      prayers: 'Prayers',
      aiStudy: 'AI Study',
      podcasts: 'Podcasts',
      teacherMode: 'Teacher Mode',
      settings: 'Settings',
    },
    sections: {
      mainMenu: 'Main Menu',
      study: 'Study',
      teaching: 'Teaching',
      premiumStudy: 'Premium Study',
    },
    bible: {
      readChapter: 'Read Chapter',
      bookmarks: 'Bookmarks',
      settings: 'Settings',
      selectBook: 'Select a book',
      selectChapter: 'Select a chapter',
      selectVersion: 'Bible Version',
      markAsRead: 'Mark as Read',
      offlineMode: 'Offline Mode',
      searchVerses: 'Search verses',
    },
    bibleBooks: {
      'gn': 'Genesis', 'ex': 'Exodus', 'lv': 'Leviticus', 'nm': 'Numbers', 'dt': 'Deuteronomy',
      'js': 'Joshua', 'jz': 'Judges', 'rt': 'Ruth', '1sm': '1 Samuel', '2sm': '2 Samuel',
      '1rs': '1 Kings', '2rs': '2 Kings', '1cr': '1 Chronicles', '2cr': '2 Chronicles',
      'ed': 'Ezra', 'ne': 'Nehemiah', 'et': 'Esther', 'job': 'Job', 'sl': 'Psalms',
      'pv': 'Proverbs', 'ec': 'Ecclesiastes', 'ct': 'Song of Songs', 'is': 'Isaiah',
      'jr': 'Jeremiah', 'lm': 'Lamentations', 'ez': 'Ezekiel', 'dn': 'Daniel',
      'os': 'Hosea', 'jl': 'Joel', 'am': 'Amos', 'ob': 'Obadiah', 'jn': 'Jonah',
      'mq': 'Micah', 'na': 'Nahum', 'hc': 'Habakkuk', 'sf': 'Zephaniah',
      'ag': 'Haggai', 'zc': 'Zechariah', 'ml': 'Malachi',
      'mt': 'Matthew', 'mc': 'Mark', 'lc': 'Luke', 'jo': 'John', 'at': 'Acts',
      'rm': 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', 'gl': 'Galatians',
      'ef': 'Ephesians', 'fp': 'Philippians', 'cl': 'Colossians',
      '1ts': '1 Thessalonians', '2ts': '2 Thessalonians',
      '1tm': '1 Timothy', '2tm': '2 Timothy', 'tt': 'Titus', 'fm': 'Philemon',
      'hb': 'Hebrews', 'tg': 'James', '1pe': '1 Peter', '2pe': '2 Peter',
      '1jo': '1 John', '2jo': '2 John', '3jo': '3 John', 'jd': 'Jude', 'ap': 'Revelation',
    },
    plans: {
      title: 'Reading Plans',
      myPlans: 'My Plans',
      available: 'Available Plans',
      createPlan: 'Create Plan',
      startPlan: 'Start Plan',
      days: 'days',
      progress: 'Progress',
      completeDay: 'Complete Day',
      dayCompleted: 'Day Completed',
    },
    progress: {
      title: 'Your Progress',
      level: 'Level',
      xp: 'XP',
      streak: 'Streak',
      achievements: 'Achievements',
      milestone: 'Milestone',
      reading: 'Reading',
      streakCategory: 'Streak',
    },
    achievements: {
      firstRead: 'First Read',
      firstReadDesc: 'Read your first chapter',
      streak7: '7-Day Streak',
      streak7Desc: 'Read for 7 consecutive days',
      streak30: '30-Day Streak',
      streak30Desc: 'Read for 30 consecutive days',
      streak100: '100-Day Streak',
      streak100Desc: 'Read for 100 consecutive days',
    },
    dailyVerse: {
      verse_of_the_day: 'Verse of the Day',
      copy: 'Copy',
      share: 'Share',
      download_image: 'Download Image',
      verse_copied: 'Verse copied!',
      verse_copied_description: 'Text copied to clipboard',
      copy_failed: 'Copy failed',
      copy_failed_description: 'Could not copy text',
      image_downloaded: 'Image downloaded!',
      image_downloaded_description: 'Verse saved as image',
      download_failed: 'Download failed',
      download_failed_description: 'Could not save image',
    },
    donate: {
      title: 'Support Bible+',
      subtitle: 'Your donation keeps Bible+ 100% free and helps bring the Word to more people, in more languages. But that\'s not all: each contribution sustains the developers who work tirelessly — day and night — to improve the experience, fix bugs, add features, and make the app lighter, faster, and accessible to everyone. You\'re not just donating. You\'re being part of the story of those seeking the Word, wherever they are.',
      one_time: 'One-Time',
      recurring: 'Recurring',
      monthly: 'Monthly',
      amount: 'Amount',
      custom_amount: 'Custom amount',
      destination: 'Donation destination',
      app_operations: 'App operations',
      bible_translation: 'Bible translation',
      anonymous: 'Donate anonymously',
      message: 'Message (optional)',
      message_placeholder: 'Leave a support message...',
      donate_button: 'Donate',
      processing: 'Processing...',
      success_title: 'Donation successful!',
      success_message: 'Thank you so much for your support!',
      error_title: 'Error processing donation',
      configure_stripe: 'Donation system not configured. Configure Stripe keys to enable donations.',
    },
  },
  nl: {
    common: {
      appName: 'Bijbel+',
      loading: 'Laden...',
      error: 'Fout',
      save: 'Opslaan',
      cancel: 'Annuleren',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      search: 'Zoeken',
      close: 'Sluiten',
    },
    nav: {
      home: 'Thuis',
      bible: 'Bijbel',
      plans: 'Plannen',
      discover: 'Ontdekken',
      you: 'Jij',
      progress: 'Voortgang',
      prayers: 'Gebeden',
      aiStudy: 'AI Studie',
      podcasts: 'Podcasts',
      teacherMode: 'Leermodus',
      settings: 'Instellingen',
    },
    sections: {
      mainMenu: 'Hoofdmenu',
      study: 'Studie',
      teaching: 'Onderwijs',
      premiumStudy: 'Premium Studie',
    },
    bible: {
      readChapter: 'Hoofdstuk Lezen',
      bookmarks: 'Bladwijzers',
      settings: 'Instellingen',
      selectBook: 'Selecteer een boek',
      selectChapter: 'Selecteer een hoofdstuk',
      selectVersion: 'Bijbelversie',
      markAsRead: 'Markeren als Gelezen',
      offlineMode: 'Offline Modus',
      searchVerses: 'Verzen zoeken',
    },
    bibleBooks: {
      'gn': 'Genesis', 'ex': 'Exodus', 'lv': 'Leviticus', 'nm': 'Numeri', 'dt': 'Deuteronomium',
      'js': 'Jozua', 'jz': 'Rechters', 'rt': 'Ruth', '1sm': '1 Samuël', '2sm': '2 Samuël',
      '1rs': '1 Koningen', '2rs': '2 Koningen', '1cr': '1 Kronieken', '2cr': '2 Kronieken',
      'ed': 'Ezra', 'ne': 'Nehemia', 'et': 'Esther', 'job': 'Job', 'sl': 'Psalmen',
      'pv': 'Spreuken', 'ec': 'Prediker', 'ct': 'Hooglied', 'is': 'Jesaja',
      'jr': 'Jeremia', 'lm': 'Klaagliederen', 'ez': 'Ezechiël', 'dn': 'Daniël',
      'os': 'Hosea', 'jl': 'Joël', 'am': 'Amos', 'ob': 'Obadja', 'jn': 'Jona',
      'mq': 'Micha', 'na': 'Nahum', 'hc': 'Habakuk', 'sf': 'Zefanja',
      'ag': 'Haggaï', 'zc': 'Zacharia', 'ml': 'Maleachi',
      'mt': 'Matteüs', 'mc': 'Marcus', 'lc': 'Lucas', 'jo': 'Johannes', 'at': 'Handelingen',
      'rm': 'Romeinen', '1co': '1 Korintiërs', '2co': '2 Korintiërs', 'gl': 'Galaten',
      'ef': 'Efeziërs', 'fp': 'Filippenzen', 'cl': 'Kolossenzen',
      '1ts': '1 Tessalonicenzen', '2ts': '2 Tessalonicenzen',
      '1tm': '1 Timoteüs', '2tm': '2 Timoteüs', 'tt': 'Titus', 'fm': 'Filemon',
      'hb': 'Hebreeën', 'tg': 'Jakobus', '1pe': '1 Petrus', '2pe': '2 Petrus',
      '1jo': '1 Johannes', '2jo': '2 Johannes', '3jo': '3 Johannes', 'jd': 'Judas', 'ap': 'Openbaring',
    },
    plans: {
      title: 'Leesplannen',
      myPlans: 'Mijn Plannen',
      available: 'Beschikbare Plannen',
      createPlan: 'Plan Maken',
      startPlan: 'Plan Starten',
      days: 'dagen',
      progress: 'Voortgang',
      completeDay: 'Dag Voltooien',
      dayCompleted: 'Dag Voltooid',
    },
    progress: {
      title: 'Jouw Voortgang',
      level: 'Niveau',
      xp: 'XP',
      streak: 'Reeks',
      achievements: 'Prestaties',
      milestone: 'Mijlpaal',
      reading: 'Lezen',
      streakCategory: 'Reeks',
    },
    achievements: {
      firstRead: 'Eerste Lezing',
      firstReadDesc: 'Lees je eerste hoofdstuk',
      streak7: '7-Daagse Reeks',
      streak7Desc: 'Lees 7 opeenvolgende dagen',
      streak30: '30-Daagse Reeks',
      streak30Desc: 'Lees 30 opeenvolgende dagen',
      streak100: '100-Daagse Reeks',
      streak100Desc: 'Lees 100 opeenvolgende dagen',
    },
    dailyVerse: {
      verse_of_the_day: 'Vers van de Dag',
      copy: 'Kopiëren',
      share: 'Delen',
      download_image: 'Afbeelding Downloaden',
      verse_copied: 'Vers gekopieerd!',
      verse_copied_description: 'Tekst gekopieerd naar klembord',
      copy_failed: 'Kopiëren mislukt',
      copy_failed_description: 'Kon tekst niet kopiëren',
      image_downloaded: 'Afbeelding gedownload!',
      image_downloaded_description: 'Vers opgeslagen als afbeelding',
      download_failed: 'Download mislukt',
      download_failed_description: 'Kon afbeelding niet opslaan',
    },
    donate: {
      title: 'Ondersteun Bijbel+',
      subtitle: 'Jouw donatie houdt Bijbel+ 100% gratis en helpt het Woord naar meer mensen te brengen, in meer talen. Maar dat is niet alles: elke bijdrage ondersteunt de ontwikkelaars die onvermoeibaar werken — dag en nacht — om de ervaring te verbeteren, bugs op te lossen, functies toe te voegen en de app lichter, sneller en toegankelijker te maken voor iedereen. Je doneert niet alleen. Je maakt deel uit van het verhaal van degenen die het Woord zoeken, waar ze ook zijn.',
      one_time: 'Eenmalig',
      recurring: 'Terugkerend',
      monthly: 'Maandelijks',
      amount: 'Bedrag',
      custom_amount: 'Aangepast bedrag',
      destination: 'Donatiebestemming',
      app_operations: 'App-activiteiten',
      bible_translation: 'Bijbelvertaling',
      anonymous: 'Anoniem doneren',
      message: 'Bericht (optioneel)',
      message_placeholder: 'Laat een bericht achter...',
      donate_button: 'Doneren',
      processing: 'Verwerken...',
      success_title: 'Donatie geslaagd!',
      success_message: 'Hartelijk dank voor je steun!',
      error_title: 'Fout bij verwerken donatie',
      configure_stripe: 'Donatiesysteem niet geconfigureerd. Configureer Stripe-sleutels om donaties in te schakelen.',
    },
  },
  es: {
    common: {
      appName: 'Biblia+',
      loading: 'Cargando...',
      error: 'Error',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
      close: 'Cerrar',
    },
    nav: {
      home: 'Inicio',
      bible: 'Biblia',
      plans: 'Planes',
      discover: 'Descubrir',
      you: 'Tú',
      progress: 'Progreso',
      prayers: 'Oraciones',
      aiStudy: 'Estudio con IA',
      podcasts: 'Podcasts',
      teacherMode: 'Modo Profesor',
      settings: 'Configuración',
    },
    sections: {
      mainMenu: 'Menú Principal',
      study: 'Estudio',
      teaching: 'Enseñanza',
      premiumStudy: 'Estudio Premium',
    },
    bible: {
      readChapter: 'Leer Capítulo',
      bookmarks: 'Marcadores',
      settings: 'Configuración',
      selectBook: 'Seleccionar un libro',
      selectChapter: 'Seleccionar un capítulo',
      selectVersion: 'Versión de la Biblia',
      markAsRead: 'Marcar como Leído',
      offlineMode: 'Modo Sin Conexión',
      searchVerses: 'Buscar versículos',
    },
    bibleBooks: {
      'gn': 'Génesis', 'ex': 'Éxodo', 'lv': 'Levítico', 'nm': 'Números', 'dt': 'Deuteronomio',
      'js': 'Josué', 'jz': 'Jueces', 'rt': 'Rut', '1sm': '1 Samuel', '2sm': '2 Samuel',
      '1rs': '1 Reyes', '2rs': '2 Reyes', '1cr': '1 Crónicas', '2cr': '2 Crónicas',
      'ed': 'Esdras', 'ne': 'Nehemías', 'et': 'Ester', 'job': 'Job', 'sl': 'Salmos',
      'pv': 'Proverbios', 'ec': 'Eclesiastés', 'ct': 'Cantares', 'is': 'Isaías',
      'jr': 'Jeremías', 'lm': 'Lamentaciones', 'ez': 'Ezequiel', 'dn': 'Daniel',
      'os': 'Oseas', 'jl': 'Joel', 'am': 'Amós', 'ob': 'Abdías', 'jn': 'Jonás',
      'mq': 'Miqueas', 'na': 'Nahúm', 'hc': 'Habacuc', 'sf': 'Sofonías',
      'ag': 'Hageo', 'zc': 'Zacarías', 'ml': 'Malaquías',
      'mt': 'Mateo', 'mc': 'Marcos', 'lc': 'Lucas', 'jo': 'Juan', 'at': 'Hechos',
      'rm': 'Romanos', '1co': '1 Corintios', '2co': '2 Corintios', 'gl': 'Gálatas',
      'ef': 'Efesios', 'fp': 'Filipenses', 'cl': 'Colosenses',
      '1ts': '1 Tesalonicenses', '2ts': '2 Tesalonicenses',
      '1tm': '1 Timoteo', '2tm': '2 Timoteo', 'tt': 'Tito', 'fm': 'Filemón',
      'hb': 'Hebreos', 'tg': 'Santiago', '1pe': '1 Pedro', '2pe': '2 Pedro',
      '1jo': '1 Juan', '2jo': '2 Juan', '3jo': '3 Juan', 'jd': 'Judas', 'ap': 'Apocalipsis',
    },
    plans: {
      title: 'Planes de Lectura',
      myPlans: 'Mis Planes',
      available: 'Planes Disponibles',
      createPlan: 'Crear Plan',
      startPlan: 'Iniciar Plan',
      days: 'días',
      progress: 'Progreso',
      completeDay: 'Completar Día',
      dayCompleted: 'Día Completado',
    },
    progress: {
      title: 'Tu Progreso',
      level: 'Nivel',
      xp: 'XP',
      streak: 'Racha',
      achievements: 'Logros',
      milestone: 'Hito',
      reading: 'Lectura',
      streakCategory: 'Racha',
    },
    achievements: {
      firstRead: 'Primera Lectura',
      firstReadDesc: 'Lee tu primer capítulo',
      streak7: 'Racha de 7 Días',
      streak7Desc: 'Lee durante 7 días consecutivos',
      streak30: 'Racha de 30 Días',
      streak30Desc: 'Lee durante 30 días consecutivos',
      streak100: 'Racha de 100 Días',
      streak100Desc: 'Lee durante 100 días consecutivos',
    },
    dailyVerse: {
      verse_of_the_day: 'Versículo del Día',
      copy: 'Copiar',
      share: 'Compartir',
      download_image: 'Descargar Imagen',
      verse_copied: '¡Versículo copiado!',
      verse_copied_description: 'Texto copiado al portapapeles',
      copy_failed: 'Error al copiar',
      copy_failed_description: 'No se pudo copiar el texto',
      image_downloaded: '¡Imagen descargada!',
      image_downloaded_description: 'Versículo guardado como imagen',
      download_failed: 'Error al descargar',
      download_failed_description: 'No se pudo guardar la imagen',
    },
    donate: {
      title: 'Apoya Biblia+',
      subtitle: 'Tu donación mantiene Biblia+ 100% gratis y ayuda a llevar la Palabra a más personas, en más idiomas. Pero eso no es todo: cada contribución sustenta a los desarrolladores que trabajan incansablemente — día y noche — para mejorar la experiencia, corregir errores, agregar funciones y hacer la aplicación más ligera, rápida y accesible para todos. No solo estás donando. Estás siendo parte de la historia de quienes buscan la Palabra, donde quiera que estén.',
      one_time: 'Donación Única',
      recurring: 'Donación Recurrente',
      monthly: 'Mensual',
      amount: 'Cantidad',
      custom_amount: 'Cantidad personalizada',
      destination: 'Destino de la donación',
      app_operations: 'Operaciones de la aplicación',
      bible_translation: 'Traducción bíblica',
      anonymous: 'Donar anónimamente',
      message: 'Mensaje (opcional)',
      message_placeholder: 'Deja un mensaje de apoyo...',
      donate_button: 'Donar',
      processing: 'Procesando...',
      success_title: '¡Donación exitosa!',
      success_message: '¡Muchas gracias por tu apoyo!',
      error_title: 'Error al procesar donación',
      configure_stripe: 'Sistema de donaciones no configurado. Configura las claves de Stripe para habilitar donaciones.',
    },
  },
};

export function getBookName(bookAbbrev: string, language: Language): string {
  const lowerAbbrev = bookAbbrev.toLowerCase();
  return translations[language].bibleBooks[lowerAbbrev] || bookAbbrev;
}

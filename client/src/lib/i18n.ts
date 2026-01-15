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
    tryAgainLater: string;
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
    compareVersions: string;
    studyGroups: string;
  };
  sections: {
    mainMenu: string;
    study: string;
    teaching: string;
    premiumStudy: string;
    about: string;
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
    contentNotAvailableOffline: string;
    addNote: string;
    shareVerse: string;
    copyText: string;
    downloadImage: string;
    chooseColor: string;
    saveNote: string;
    cancel: string;
    yellow: string;
    green: string;
    blue: string;
    purple: string;
    pink: string;
    orange: string;
    chooseHighlightColor: string;
    removeHighlight: string;
    writeNoteHere: string;
    update: string;
    save: string;
    delete: string;
    selectBookToStart: string;
    offlineModeTitle: string;
    loadingSavedContent: string;
    copied: string;
    verseCopied: string;
    error: string;
    failedToCopy: string;
    downloadStarted: string;
    verseImageDownloaded: string;
    failedToGenerate: string;
    audioStarted: string;
    listenWhileBrowsing: string;
    errorLoadingBooks: string;
    errorLoadingChapter: string;
    chapterComplete: string;
    noteRemoved: string;
    noteRemovedSuccess: string;
    bookmarkAdded: string;
    bookmarkRemoved: string;
    highlightAdded: string;
    highlightRemoved: string;
    highlightRemovedSuccess: string;
  };
  bibleBooks: Record<string, string>;
  plans: {
    title: string;
    subtitle: string;
    myPlans: string;
    available: string;
    createPlan: string;
    startPlan: string;
    starting: string;
    days: string;
    of_days_completed: string;
    progress: string;
    completeDay: string;
    dayCompleted: string;
    selectTemplate: string;
    noPlanTemplate: string;
    activePlans: string;
    completedPlans: string;
    currentDay: string;
    noActivePlans: string;
    startFirstPlan: string;
    choosePlanDescription: string;
    day: string;
    todayReading: string;
    markDayComplete: string;
    completed: string;
    completedOn: string;
    dayComplete: string;
    youEarnedXP: string;
    errorMarkingProgress: string;
  };
  progress: {
    title: string;
    subtitle: string;
    level: string;
    xp: string;
    streak: string;
    achievements: string;
    milestone: string;
    reading: string;
    streakCategory: string;
    experiencePoints: string;
    readingStreak: string;
    totalXpAccumulated: string;
    consecutiveDays: string;
    ofTotalUnlocked: string;
    nextLevel: string;
    continueReadingToLevel: string;
    progressToNextLevel: string;
    xpNeededForLevel: string;
    unlocked: string;
    complete: string;
    loadingProgress: string;
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
  landing: {
    hero_title: string;
    hero_subtitle: string;
    start_free: string;
    see_features: string;
    premium_features: string;
    premium_subtitle: string;
    customize_experience: string;
    customize_subtitle: string;
    why_bible_plus: string;
    why_subtitle: string;
    cta_title: string;
    cta_subtitle: string;
    start_free_cta: string;
    footer_description: string;
    footer_plans: string;
    footer_contact: string;
    footer_support: string;
    newGeneration: string;
    nav_resources: string;
    nav_themes: string;
    nav_testimonials: string;
    nav_faq: string;
    powerful_resources: string;
    incredible_themes: string;
    premium_content: string;
    faq_title: string;
    what_users_say: string;
    transform_study: string;
    features: {
      aiTitle: string;
      aiDesc: string;
      plansTitle: string;
      plansDesc: string;
      podcastsTitle: string;
      podcastsDesc: string;
      teacherTitle: string;
      teacherDesc: string;
      communityTitle: string;
      communityDesc: string;
      themesTitle: string;
      themesDesc: string;
    };
  };
  pricing: {
    page_title: string;
    page_subtitle: string;
    free_plan: string;
    premium_plan: string;
    lifetime_plan: string;
    per_month: string;
    one_time: string;
    select_plan: string;
    guarantee_title: string;
    guarantee_description: string;
    faq_title: string;
  };
  community: {
    title: string;
    what_studying: string;
    verse_reference: string;
    your_reflection: string;
    post: string;
    trending_topics: string;
    likes: string;
    comments: string;
  };
  favorites: {
    title: string;
    subtitle: string;
    bookmarks: string;
    highlights: string;
    notes: string;
    no_favorites: string;
    add_first: string;
  };
  profile: {
    title: string;
    my_plans: string;
    prayer: string;
    achievements: string;
    reading_streak: string;
    spiritual_level: string;
    edit_profile: string;
    logout: string;
  };
  aiStudy: {
    title: string;
    subtitle: string;
    ai_chat: string;
    ask_question: string;
    type_message: string;
  };
  teacherMode: {
    title: string;
    new_lesson: string;
    lesson_title: string;
    students: string;
    progress: string;
    export_report: string;
  };
  offline: {
    title: string;
    chapters_saved: string;
    space_used: string;
    books_downloaded: string;
    download_chapter: string;
    delete_chapter: string;
    clear_all: string;
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    message: string;
    send: string;
    success: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    common: {
      appName: 'BíbliaFS',
      loading: 'Carregando...',
      error: 'Erro',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      search: 'Buscar',
      close: 'Fechar',
      tryAgainLater: 'Tente novamente mais tarde.',
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
      podcasts: 'BíbliaFS Rádio',
      teacherMode: 'Modo Professor',
      settings: 'Configurações',
      compareVersions: 'Comparar Versões',
      studyGroups: 'Grupos de Estudo',
    },
    sections: {
      mainMenu: 'Menu Principal',
      study: 'Estudo',
      teaching: 'Ensino',
      premiumStudy: 'Estudo Premium',
      about: 'Sobre',
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
      contentNotAvailableOffline: 'Conteúdo não disponível offline',
      addNote: 'Adicionar Nota',
      shareVerse: 'Compartilhar Versículo',
      copyText: 'Copiar Texto',
      downloadImage: 'Baixar Imagem',
      chooseColor: 'Escolher Cor',
      saveNote: 'Salvar Nota',
      cancel: 'Cancelar',
      yellow: 'Amarelo',
      green: 'Verde',
      blue: 'Azul',
      purple: 'Roxo',
      pink: 'Rosa',
      orange: 'Laranja',
      chooseHighlightColor: 'Escolha a cor do destaque',
      removeHighlight: 'Remover Destaque',
      writeNoteHere: 'Escreva sua nota aqui...',
      update: 'Atualizar',
      save: 'Salvar',
      delete: 'Excluir',
      selectBookToStart: 'Selecione um livro para começar',
      offlineModeTitle: 'Modo Offline',
      loadingSavedContent: 'Carregando conteúdo salvo',
      copied: 'Copiado!',
      verseCopied: 'Versículo copiado para a área de transferência',
      error: 'Erro',
      failedToCopy: 'Falha ao copiar texto',
      downloadStarted: 'Download iniciado!',
      verseImageDownloaded: 'Imagem do versículo baixada com sucesso',
      failedToGenerate: 'Falha ao gerar imagem',
      audioStarted: 'Áudio iniciado',
      listenWhileBrowsing: 'Ouça enquanto navega!',
      errorLoadingBooks: 'Erro ao carregar livros',
      errorLoadingChapter: 'Erro ao carregar capítulo',
      chapterComplete: 'Capítulo completo! 🎉',
      noteRemoved: 'Nota removida!',
      noteRemovedSuccess: 'Nota removida com sucesso.',
      bookmarkAdded: 'Favorito adicionado!',
      bookmarkRemoved: 'Favorito removido!',
      highlightAdded: 'Highlight adicionado!',
      highlightRemoved: 'Highlight removido!',
      highlightRemovedSuccess: 'Highlight removido com sucesso.',
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
      subtitle: 'Organize e acompanhe seu estudo bíblico',
      myPlans: 'Meus Planos',
      available: 'Planos Disponíveis',
      createPlan: 'Criar Plano',
      startPlan: 'Iniciar Plano',
      starting: 'Iniciando...',
      days: 'dias',
      of_days_completed: 'de {total} dias completos',
      progress: 'Progresso',
      completeDay: 'Completar Dia',
      dayCompleted: 'Dia Completo',
      selectTemplate: 'Selecione um Plano',
      noPlanTemplate: 'Nenhum plano disponível',
      activePlans: 'Planos Ativos',
      completedPlans: 'Planos Concluídos',
      currentDay: 'Dia Atual',
      noActivePlans: 'Nenhum plano ativo',
      startFirstPlan: 'Iniciar Primeiro Plano',
      choosePlanDescription: 'Escolha um plano predefinido para começar sua jornada',
      day: 'Dia',
      todayReading: 'Leitura de hoje:',
      markDayComplete: 'Marcar Dia Como Completo',
      completed: 'Concluído',
      completedOn: 'Completado em',
      dayComplete: 'Dia completo! 🎉',
      youEarnedXP: 'Você ganhou {xp} XP pela sua leitura.',
      errorMarkingProgress: 'Erro ao marcar progresso',
    },
    progress: {
      title: 'Seu Progresso',
      subtitle: 'Acompanhe seu crescimento espiritual',
      level: 'Nível',
      xp: 'XP',
      streak: 'Sequência',
      achievements: 'Conquistas',
      milestone: 'Marco',
      reading: 'Leitura',
      streakCategory: 'Sequência',
      experiencePoints: 'Pontos de Experiência',
      readingStreak: 'Sequência de Leitura',
      totalXpAccumulated: 'XP total acumulado',
      consecutiveDays: 'dias consecutivos',
      ofTotalUnlocked: 'de {total} desbloqueadas',
      nextLevel: 'Próximo Nível',
      continueReadingToLevel: 'Continue lendo para alcançar o nível {level}',
      progressToNextLevel: 'Progresso para o próximo nível',
      xpNeededForLevel: 'Faltam {xp} XP para o nível {level}',
      unlocked: 'Desbloqueada',
      complete: 'completo',
      loadingProgress: 'Carregando progresso...',
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
      title: 'Apoie o BíbliaFS',
      subtitle: 'Sua doação mantém o BíbliaFS 100% gratuito e ajuda a levar a Palavra a mais pessoas, em mais idiomas. Cada contribuição sustenta o desenvolvimento contínuo do app, permitindo melhorias constantes, novos recursos e maior acessibilidade. Você não está apenas doando — está sendo parte da história de quem busca a Palavra, onde quer que esteja.',
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
    landing: {
      hero_title: 'Transforme Seu Estudo Bíblico',
      hero_subtitle: 'Inteligência Artificial, Podcasts, Comunidade e Ensino em uma única plataforma premium. O futuro do estudo bíblico chegou.',
      start_free: 'Começar Grátis',
      see_features: 'Ver Recursos',
      premium_features: 'Recursos Premium',
      premium_subtitle: 'Tudo que você precisa para um estudo bíblico profundo e transformador',
      customize_experience: 'Personalize Sua Experiência',
      customize_subtitle: '4 temas prontos ou crie o seu próprio com cores personalizadas',
      why_bible_plus: 'Por Que BíbliaFS?',
      why_subtitle: 'Muito mais do que um simples aplicativo bíblico',
      cta_title: 'Comece Hoje Sua Jornada',
      cta_subtitle: 'Junte-se a milhares de pessoas transformando seu estudo bíblico',
      start_free_cta: 'Começar Gratuitamente',
      footer_description: 'Estudo Premium com IA',
      footer_plans: 'Planos',
      footer_contact: 'Contato',
      footer_support: 'Suporte',
      newGeneration: 'v2.0 - Nova Geração',
      nav_resources: 'Recursos',
      nav_themes: 'Temas',
      nav_testimonials: 'Testemunhos',
      nav_faq: 'Perguntas',
      powerful_resources: 'Recursos Poderosos Para Seu Estudo',
      incredible_themes: 'Temas Incríveis',
      premium_content: 'Recursos Premium',
      faq_title: 'Perguntas Frequentes',
      what_users_say: 'O Que Dizem Nossos Usuários',
      transform_study: 'Transforme seu estudo com BíbliaFS',
      features: {
        aiTitle: 'IA Teológica',
        aiDesc: 'Assistente inteligente responde perguntas bíblicas, compara doutrinas e oferece contexto histórico profundo.',
        plansTitle: 'Planos Personalizados',
        plansDesc: 'Crie planos de leitura integrados com podcasts e acompanhe seu progresso diário.',
        podcastsTitle: 'BíbliaFS Rádio',
        podcastsDesc: 'Ouça, baixe e inclua episódios de rádio nos seus planos de estudo bíblico.',
        teacherTitle: 'Modo Professor',
        teacherDesc: 'Crie aulas, avalie alunos e gerencie turmas com ferramentas profissionais.',
        communityTitle: 'Comunidade Ativa',
        communityDesc: 'Compartilhe insights, conecte-se com outros estudantes e cresça juntos.',
        themesTitle: 'Temas Personalizáveis',
        themesDesc: '5 temas premium ou crie o seu próprio com seletor de cores RGB personalizado.',
      },
    },
    pricing: {
      page_title: 'Planos e Preços',
      page_subtitle: 'Escolha o plano perfeito para sua jornada espiritual',
      free_plan: 'Gratuito',
      premium_plan: 'Premium',
      lifetime_plan: 'Vitalício',
      per_month: '/mês',
      one_time: 'pagamento único',
      select_plan: 'Escolher Plano',
      guarantee_title: 'Garantia de 30 Dias',
      guarantee_description: '100% de reembolso se não ficar satisfeito',
      faq_title: 'Perguntas Frequentes',
    },
    community: {
      title: 'Comunidade',
      what_studying: 'O que você está estudando?',
      verse_reference: 'Referência do Versículo',
      your_reflection: 'Sua Reflexão',
      post: 'Publicar',
      trending_topics: 'Temas em Alta',
      likes: 'curtidas',
      comments: 'comentários',
    },
    favorites: {
      title: 'Meus Favoritos',
      subtitle: 'Versículos salvos, destaques e notas',
      bookmarks: 'Favoritos',
      highlights: 'Destaques',
      notes: 'Notas',
      no_favorites: 'Nenhum favorito ainda',
      add_first: 'Comece adicionando seus versículos favoritos',
    },
    profile: {
      title: 'Perfil',
      my_plans: 'Meus Planos',
      prayer: 'Oração',
      achievements: 'Conquistas',
      reading_streak: 'Sequência de Leitura',
      spiritual_level: 'Nível Espiritual',
      edit_profile: 'Editar Perfil',
      logout: 'Sair',
    },
    aiStudy: {
      title: 'Estudar com IA',
      subtitle: 'Assistente teológico inteligente',
      ai_chat: 'Conversa com IA',
      ask_question: 'Faça uma pergunta teológica',
      type_message: 'Digite sua mensagem...',
    },
    teacherMode: {
      title: 'Modo Professor',
      new_lesson: 'Nova Aula',
      lesson_title: 'Título da Aula',
      students: 'Alunos',
      progress: 'Progresso',
      export_report: 'Exportar Relatório',
    },
    offline: {
      title: 'Modo Offline',
      chapters_saved: 'Capítulos Salvos',
      space_used: 'Espaço Usado',
      books_downloaded: 'Livros Baixados',
      download_chapter: 'Baixar Capítulo',
      delete_chapter: 'Excluir',
      clear_all: 'Limpar Tudo',
    },
    contact: {
      title: 'Fale Conosco',
      subtitle: 'Envie sua Mensagem',
      name: 'Nome',
      email: 'E-mail',
      message: 'Mensagem',
      send: 'Enviar',
      success: 'Mensagem enviada com sucesso!',
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
      tryAgainLater: 'Try again later.',
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
      compareVersions: 'Compare Versions',
      studyGroups: 'Study Groups',
    },
    sections: {
      mainMenu: 'Main Menu',
      study: 'Study',
      teaching: 'Teaching',
      premiumStudy: 'Premium Study',
      about: 'About',
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
      contentNotAvailableOffline: 'Content not available offline',
      addNote: 'Add Note',
      shareVerse: 'Share Verse',
      copyText: 'Copy Text',
      downloadImage: 'Download Image',
      chooseColor: 'Choose Color',
      saveNote: 'Save Note',
      cancel: 'Cancel',
      yellow: 'Yellow',
      green: 'Green',
      blue: 'Blue',
      purple: 'Purple',
      pink: 'Pink',
      orange: 'Orange',
      chooseHighlightColor: 'Choose highlight color',
      removeHighlight: 'Remove Highlight',
      writeNoteHere: 'Write your note here...',
      update: 'Update',
      save: 'Save',
      delete: 'Delete',
      selectBookToStart: 'Select a book to start',
      offlineModeTitle: 'Offline Mode',
      loadingSavedContent: 'Loading saved content',
      copied: 'Copied!',
      verseCopied: 'Verse copied to clipboard',
      error: 'Error',
      failedToCopy: 'Failed to copy text',
      downloadStarted: 'Download started!',
      verseImageDownloaded: 'Verse image downloaded successfully',
      failedToGenerate: 'Failed to generate image',
      audioStarted: 'Audio started',
      listenWhileBrowsing: 'Listen while browsing!',
      errorLoadingBooks: 'Error loading books',
      errorLoadingChapter: 'Error loading chapter',
      chapterComplete: 'Chapter complete! 🎉',
      noteRemoved: 'Note removed!',
      noteRemovedSuccess: 'Note successfully removed.',
      bookmarkAdded: 'Bookmark added!',
      bookmarkRemoved: 'Bookmark removed!',
      highlightAdded: 'Highlight added!',
      highlightRemoved: 'Highlight removed!',
      highlightRemovedSuccess: 'Highlight successfully removed.',
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
      subtitle: 'Organize and track your Bible study',
      myPlans: 'My Plans',
      available: 'Available Plans',
      createPlan: 'Create Plan',
      startPlan: 'Start Plan',
      starting: 'Starting...',
      days: 'days',
      of_days_completed: 'of {total} days completed',
      progress: 'Progress',
      completeDay: 'Complete Day',
      dayCompleted: 'Day Completed',
      selectTemplate: 'Select a Plan',
      noPlanTemplate: 'No plan available',
      activePlans: 'Active Plans',
      completedPlans: 'Completed Plans',
      currentDay: 'Current Day',
      noActivePlans: 'No active plans',
      startFirstPlan: 'Start First Plan',
      choosePlanDescription: 'Choose a preset plan to begin your journey',
      day: 'Day',
      todayReading: 'Today\'s reading:',
      markDayComplete: 'Mark Day as Complete',
      completed: 'Completed',
      completedOn: 'Completed on',
      dayComplete: 'Day complete! 🎉',
      youEarnedXP: 'You earned {xp} XP for your reading.',
      errorMarkingProgress: 'Error marking progress',
    },
    progress: {
      title: 'Your Progress',
      subtitle: 'Track your spiritual growth',
      level: 'Level',
      xp: 'XP',
      streak: 'Streak',
      achievements: 'Achievements',
      milestone: 'Milestone',
      reading: 'Reading',
      streakCategory: 'Streak',
      experiencePoints: 'Experience Points',
      readingStreak: 'Reading Streak',
      totalXpAccumulated: 'Total XP accumulated',
      consecutiveDays: 'consecutive days',
      ofTotalUnlocked: 'of {total} unlocked',
      nextLevel: 'Next Level',
      continueReadingToLevel: 'Keep reading to reach level {level}',
      progressToNextLevel: 'Progress to next level',
      xpNeededForLevel: '{xp} XP needed for level {level}',
      unlocked: 'Unlocked',
      complete: 'complete',
      loadingProgress: 'Loading progress...',
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
    landing: {
      hero_title: 'Transform Your Bible Study',
      hero_subtitle: 'Artificial Intelligence, Podcasts, Community, and Teaching in one premium platform. The future of Bible study is here.',
      start_free: 'Start Free',
      see_features: 'See Features',
      premium_features: 'Premium Features',
      premium_subtitle: 'Everything you need for deep and transformative Bible study',
      customize_experience: 'Customize Your Experience',
      customize_subtitle: '4 ready-made themes or create your own with custom colors',
      why_bible_plus: 'Why Bible+?',
      why_subtitle: 'Much more than just a Bible app',
      cta_title: 'Start Your Journey Today',
      cta_subtitle: 'Join thousands of people transforming their Bible study',
      start_free_cta: 'Start Free',
      footer_description: 'Premium AI-Powered Study',
      footer_plans: 'Plans',
      footer_contact: 'Contact',
      footer_support: 'Support',
      newGeneration: 'v2.0 - New Generation',
      nav_resources: 'Resources',
      nav_themes: 'Themes',
      nav_testimonials: 'Testimonials',
      nav_faq: 'FAQ',
      powerful_resources: 'Powerful Resources For Your Study',
      incredible_themes: 'Incredible Themes',
      premium_content: 'Premium Resources',
      faq_title: 'Frequently Asked Questions',
      what_users_say: 'What Our Users Say',
      transform_study: 'Transform your study with Bible+',
      features: {
        aiTitle: 'Theological AI',
        aiDesc: 'Intelligent assistant answers biblical questions, compares doctrines, and offers deep historical context.',
        plansTitle: 'Custom Plans',
        plansDesc: 'Create reading plans integrated with podcasts and track your daily progress.',
        podcastsTitle: 'Integrated Podcasts',
        podcastsDesc: 'Listen, download, and include podcast episodes in your Bible study plans.',
        teacherTitle: 'Teacher Mode',
        teacherDesc: 'Create lessons, assess students, and manage classes with professional tools.',
        communityTitle: 'Active Community',
        communityDesc: 'Share insights, connect with other students, and grow together.',
        themesTitle: 'Customizable Themes',
        themesDesc: '5 premium themes or create your own with custom RGB color picker.',
      },
    },
    pricing: {
      page_title: 'Plans & Pricing',
      page_subtitle: 'Choose the perfect plan for your spiritual journey',
      free_plan: 'Free',
      premium_plan: 'Premium',
      lifetime_plan: 'Lifetime',
      per_month: '/month',
      one_time: 'one-time payment',
      select_plan: 'Select Plan',
      guarantee_title: '30-Day Guarantee',
      guarantee_description: '100% refund if not satisfied',
      faq_title: 'Frequently Asked Questions',
    },
    community: {
      title: 'Community',
      what_studying: 'What are you studying?',
      verse_reference: 'Verse Reference',
      your_reflection: 'Your Reflection',
      post: 'Post',
      trending_topics: 'Trending Topics',
      likes: 'likes',
      comments: 'comments',
    },
    favorites: {
      title: 'My Favorites',
      subtitle: 'Saved verses, highlights, and notes',
      bookmarks: 'Bookmarks',
      highlights: 'Highlights',
      notes: 'Notes',
      no_favorites: 'No favorites yet',
      add_first: 'Start adding your favorite verses',
    },
    profile: {
      title: 'Profile',
      my_plans: 'My Plans',
      prayer: 'Prayer',
      achievements: 'Achievements',
      reading_streak: 'Reading Streak',
      spiritual_level: 'Spiritual Level',
      edit_profile: 'Edit Profile',
      logout: 'Logout',
    },
    aiStudy: {
      title: 'Study with AI',
      subtitle: 'Intelligent theological assistant',
      ai_chat: 'AI Chat',
      ask_question: 'Ask a theological question',
      type_message: 'Type your message...',
    },
    teacherMode: {
      title: 'Teacher Mode',
      new_lesson: 'New Lesson',
      lesson_title: 'Lesson Title',
      students: 'Students',
      progress: 'Progress',
      export_report: 'Export Report',
    },
    offline: {
      title: 'Offline Mode',
      chapters_saved: 'Saved Chapters',
      space_used: 'Space Used',
      books_downloaded: 'Downloaded Books',
      download_chapter: 'Download Chapter',
      delete_chapter: 'Delete',
      clear_all: 'Clear All',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Send Your Message',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
      success: 'Message sent successfully!',
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
      tryAgainLater: 'Probeer het later opnieuw.',
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
      compareVersions: 'Versies Vergelijken',
      studyGroups: 'Studiegroepen',
    },
    sections: {
      mainMenu: 'Hoofdmenu',
      study: 'Studie',
      teaching: 'Onderwijs',
      premiumStudy: 'Premium Studie',
      about: 'Over',
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
      contentNotAvailableOffline: 'Inhoud niet offline beschikbaar',
      addNote: 'Notitie Toevoegen',
      shareVerse: 'Vers Delen',
      copyText: 'Tekst Kopiëren',
      downloadImage: 'Afbeelding Downloaden',
      chooseColor: 'Kleur Kiezen',
      saveNote: 'Notitie Opslaan',
      cancel: 'Annuleren',
      yellow: 'Geel',
      green: 'Groen',
      blue: 'Blauw',
      purple: 'Paars',
      pink: 'Roze',
      orange: 'Oranje',
      chooseHighlightColor: 'Kies markeerkleur',
      removeHighlight: 'Markering Verwijderen',
      writeNoteHere: 'Schrijf hier je notitie...',
      update: 'Bijwerken',
      save: 'Opslaan',
      delete: 'Verwijderen',
      selectBookToStart: 'Selecteer een boek om te beginnen',
      offlineModeTitle: 'Offline Modus',
      loadingSavedContent: 'Opgeslagen inhoud laden',
      copied: 'Gekopieerd!',
      verseCopied: 'Vers gekopieerd naar klembord',
      error: 'Fout',
      failedToCopy: 'Tekst kopiëren mislukt',
      downloadStarted: 'Download gestart!',
      verseImageDownloaded: 'Versafbeelding succesvol gedownload',
      failedToGenerate: 'Afbeelding genereren mislukt',
      audioStarted: 'Audio gestart',
      listenWhileBrowsing: 'Luister terwijl je bladert!',
      errorLoadingBooks: 'Fout bij laden van boeken',
      errorLoadingChapter: 'Fout bij laden van hoofdstuk',
      chapterComplete: 'Hoofdstuk voltooid! 🎉',
      noteRemoved: 'Notitie verwijderd!',
      noteRemovedSuccess: 'Notitie succesvol verwijderd.',
      bookmarkAdded: 'Favoriet toegevoegd!',
      bookmarkRemoved: 'Favoriet verwijderd!',
      highlightAdded: 'Markering toegevoegd!',
      highlightRemoved: 'Markering verwijderd!',
      highlightRemovedSuccess: 'Markering succesvol verwijderd.',
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
      subtitle: 'Organiseer en volg je Bijbelstudie',
      myPlans: 'Mijn Plannen',
      available: 'Beschikbare Plannen',
      createPlan: 'Plan Maken',
      startPlan: 'Plan Starten',
      starting: 'Starten...',
      days: 'dagen',
      of_days_completed: 'van {total} dagen voltooid',
      progress: 'Voortgang',
      completeDay: 'Dag Voltooien',
      dayCompleted: 'Dag Voltooid',
      selectTemplate: 'Selecteer een Plan',
      noPlanTemplate: 'Geen plan beschikbaar',
      activePlans: 'Actieve Plannen',
      completedPlans: 'Voltooide Plannen',
      currentDay: 'Huidige Dag',
      noActivePlans: 'Geen actieve plannen',
      startFirstPlan: 'Start Eerste Plan',
      choosePlanDescription: 'Kies een vooraf ingesteld plan om je reis te beginnen',
      day: 'Dag',
      todayReading: 'Lezing van vandaag:',
      markDayComplete: 'Dag Markeren als Voltooid',
      completed: 'Voltooid',
      completedOn: 'Voltooid op',
      dayComplete: 'Dag voltooid! 🎉',
      youEarnedXP: 'Je hebt {xp} XP verdiend met lezen.',
      errorMarkingProgress: 'Fout bij markeren voortgang',
    },
    progress: {
      title: 'Jouw Voortgang',
      subtitle: 'Volg je spirituele groei',
      level: 'Niveau',
      xp: 'XP',
      streak: 'Reeks',
      achievements: 'Prestaties',
      milestone: 'Mijlpaal',
      reading: 'Lezen',
      streakCategory: 'Reeks',
      experiencePoints: 'Ervaringspunten',
      readingStreak: 'Leesreeks',
      totalXpAccumulated: 'Totaal verzamelde XP',
      consecutiveDays: 'opeenvolgende dagen',
      ofTotalUnlocked: 'van {total} ontgrendeld',
      nextLevel: 'Volgend Niveau',
      continueReadingToLevel: 'Blijf lezen om niveau {level} te bereiken',
      progressToNextLevel: 'Voortgang naar volgend niveau',
      xpNeededForLevel: '{xp} XP nodig voor niveau {level}',
      unlocked: 'Ontgrendeld',
      complete: 'compleet',
      loadingProgress: 'Voortgang laden...',
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
    landing: {
      hero_title: 'Transformeer Je Bijbelstudie',
      hero_subtitle: 'Kunstmatige Intelligentie, Podcasts, Gemeenschap en Onderwijs in één premium platform. De toekomst van Bijbelstudie is hier.',
      start_free: 'Gratis Beginnen',
      see_features: 'Bekijk Functies',
      premium_features: 'Premium Functies',
      premium_subtitle: 'Alles wat je nodig hebt voor een diepe en transformerende Bijbelstudie',
      customize_experience: 'Personaliseer Je Ervaring',
      customize_subtitle: '4 kant-en-klare thema\'s of creëer je eigen met aangepaste kleuren',
      why_bible_plus: 'Waarom Bijbel+?',
      why_subtitle: 'Veel meer dan alleen een Bijbel-app',
      cta_title: 'Begin Vandaag Je Reis',
      cta_subtitle: 'Sluit je aan bij duizenden mensen die hun Bijbelstudie transformeren',
      start_free_cta: 'Gratis Starten',
      footer_description: 'Premium Studie met AI',
      footer_plans: 'Plannen',
      footer_contact: 'Contact',
      footer_support: 'Ondersteuning',
      newGeneration: 'v2.0 - Nieuwe Generatie',
      nav_resources: 'Bronnen',
      nav_themes: 'Thema\'s',
      nav_testimonials: 'Getuigenissen',
      nav_faq: 'Veelgestelde Vragen',
      powerful_resources: 'Krachtige Hulpmiddelen Voor Je Studie',
      incredible_themes: 'Ongelooflijke Thema\'s',
      premium_content: 'Premium Inhoud',
      faq_title: 'Veelgestelde Vragen',
      what_users_say: 'Wat Onze Gebruikers Zeggen',
      transform_study: 'Transformeer je studie met Bijbel+',
      features: {
        aiTitle: 'Theologische AI',
        aiDesc: 'Intelligente assistent beantwoordt Bijbelse vragen, vergelijkt doctrines en biedt diepe historische context.',
        plansTitle: 'Aangepaste Plannen',
        plansDesc: 'Creëer leesplannen geïntegreerd met podcasts en volg je dagelijkse voortgang.',
        podcastsTitle: 'Geïntegreerde Podcasts',
        podcastsDesc: 'Luister, download en neem podcast-afleveringen op in je Bijbelstudie plannen.',
        teacherTitle: 'Leermodus',
        teacherDesc: 'Creëer lessen, beoordeel studenten en beheer klassen met professionele tools.',
        communityTitle: 'Actieve Gemeenschap',
        communityDesc: 'Deel inzichten, maak verbinding met andere studenten en groei samen.',
        themesTitle: 'Aanpasbare Thema\'s',
        themesDesc: '5 premium thema\'s of creëer je eigen met aangepaste RGB-kleurenkiezer.',
      },
    },
    pricing: {
      page_title: 'Plannen & Prijzen',
      page_subtitle: 'Kies het perfecte plan voor jouw spirituele reis',
      free_plan: 'Gratis',
      premium_plan: 'Premium',
      lifetime_plan: 'Levenslang',
      per_month: '/maand',
      one_time: 'eenmalige betaling',
      select_plan: 'Selecteer Plan',
      guarantee_title: '30 Dagen Garantie',
      guarantee_description: '100% terugbetaling als je niet tevreden bent',
      faq_title: 'Veelgestelde Vragen',
    },
    community: {
      title: 'Gemeenschap',
      what_studying: 'Wat studeer je?',
      verse_reference: 'Vers Referentie',
      your_reflection: 'Jouw Reflectie',
      post: 'Plaatsen',
      trending_topics: 'Trending Onderwerpen',
      likes: 'likes',
      comments: 'reacties',
    },
    favorites: {
      title: 'Mijn Favorieten',
      subtitle: 'Opgeslagen verzen, highlights en notities',
      bookmarks: 'Bladwijzers',
      highlights: 'Highlights',
      notes: 'Notities',
      no_favorites: 'Nog geen favorieten',
      add_first: 'Begin met het toevoegen van je favoriete verzen',
    },
    profile: {
      title: 'Profiel',
      my_plans: 'Mijn Plannen',
      prayer: 'Gebed',
      achievements: 'Prestaties',
      reading_streak: 'Leesreeks',
      spiritual_level: 'Spiritueel Niveau',
      edit_profile: 'Profiel Bewerken',
      logout: 'Uitloggen',
    },
    aiStudy: {
      title: 'Studeren met AI',
      subtitle: 'Intelligente theologische assistent',
      ai_chat: 'AI Chat',
      ask_question: 'Stel een theologische vraag',
      type_message: 'Typ je bericht...',
    },
    teacherMode: {
      title: 'Leermodus',
      new_lesson: 'Nieuwe Les',
      lesson_title: 'Les Titel',
      students: 'Studenten',
      progress: 'Voortgang',
      export_report: 'Rapport Exporteren',
    },
    offline: {
      title: 'Offline Modus',
      chapters_saved: 'Opgeslagen Hoofdstukken',
      space_used: 'Gebruikte Ruimte',
      books_downloaded: 'Gedownloade Boeken',
      download_chapter: 'Hoofdstuk Downloaden',
      delete_chapter: 'Verwijderen',
      clear_all: 'Alles Wissen',
    },
    contact: {
      title: 'Neem Contact Op',
      subtitle: 'Verstuur Je Bericht',
      name: 'Naam',
      email: 'E-mail',
      message: 'Bericht',
      send: 'Verzenden',
      success: 'Bericht succesvol verzonden!',
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
      tryAgainLater: 'Inténtalo de nuevo más tarde.',
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
      compareVersions: 'Comparar Versiones',
      studyGroups: 'Grupos de Estudio',
    },
    sections: {
      mainMenu: 'Menú Principal',
      study: 'Estudio',
      teaching: 'Enseñanza',
      premiumStudy: 'Estudio Premium',
      about: 'Acerca de',
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
      contentNotAvailableOffline: 'Contenido no disponible sin conexión',
      addNote: 'Añadir Nota',
      shareVerse: 'Compartir Versículo',
      copyText: 'Copiar Texto',
      downloadImage: 'Descargar Imagen',
      chooseColor: 'Elegir Color',
      saveNote: 'Guardar Nota',
      cancel: 'Cancelar',
      yellow: 'Amarillo',
      green: 'Verde',
      blue: 'Azul',
      purple: 'Morado',
      pink: 'Rosa',
      orange: 'Naranja',
      chooseHighlightColor: 'Elegir color del resaltado',
      removeHighlight: 'Eliminar Resaltado',
      writeNoteHere: 'Escribe tu nota aquí...',
      update: 'Actualizar',
      save: 'Guardar',
      delete: 'Eliminar',
      selectBookToStart: 'Selecciona un libro para comenzar',
      offlineModeTitle: 'Modo Sin Conexión',
      loadingSavedContent: 'Cargando contenido guardado',
      copied: '¡Copiado!',
      verseCopied: 'Versículo copiado al portapapeles',
      error: 'Error',
      failedToCopy: 'Error al copiar texto',
      downloadStarted: '¡Descarga iniciada!',
      verseImageDownloaded: 'Imagen del versículo descargada con éxito',
      failedToGenerate: 'Error al generar imagen',
      audioStarted: 'Audio iniciado',
      listenWhileBrowsing: '¡Escucha mientras navegas!',
      errorLoadingBooks: 'Error al cargar libros',
      errorLoadingChapter: 'Error al cargar capítulo',
      chapterComplete: '¡Capítulo completo! 🎉',
      noteRemoved: '¡Nota eliminada!',
      noteRemovedSuccess: 'Nota eliminada con éxito.',
      bookmarkAdded: '¡Favorito añadido!',
      bookmarkRemoved: '¡Favorito eliminado!',
      highlightAdded: '¡Resaltado añadido!',
      highlightRemoved: '¡Resaltado eliminado!',
      highlightRemovedSuccess: 'Resaltado eliminado con éxito.',
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
      subtitle: 'Organiza y sigue tu estudio bíblico',
      myPlans: 'Mis Planes',
      available: 'Planes Disponibles',
      createPlan: 'Crear Plan',
      startPlan: 'Iniciar Plan',
      starting: 'Iniciando...',
      days: 'días',
      of_days_completed: 'de {total} días completados',
      progress: 'Progreso',
      completeDay: 'Completar Día',
      dayCompleted: 'Día Completado',
      selectTemplate: 'Selecciona un Plan',
      noPlanTemplate: 'Ningún plan disponible',
      activePlans: 'Planes Activos',
      completedPlans: 'Planes Completados',
      currentDay: 'Día Actual',
      noActivePlans: 'Sin planes activos',
      startFirstPlan: 'Iniciar Primer Plan',
      choosePlanDescription: 'Elige un plan predefinido para comenzar tu jornada',
      day: 'Día',
      todayReading: 'Lectura de hoy:',
      markDayComplete: 'Marcar Día como Completo',
      completed: 'Completado',
      completedOn: 'Completado el',
      dayComplete: '¡Día completo! 🎉',
      youEarnedXP: 'Ganaste {xp} XP por tu lectura.',
      errorMarkingProgress: 'Error al marcar progreso',
    },
    progress: {
      title: 'Tu Progreso',
      subtitle: 'Sigue tu crecimiento espiritual',
      level: 'Nivel',
      xp: 'XP',
      streak: 'Racha',
      achievements: 'Logros',
      milestone: 'Hito',
      reading: 'Lectura',
      streakCategory: 'Racha',
      experiencePoints: 'Puntos de Experiencia',
      readingStreak: 'Racha de Lectura',
      totalXpAccumulated: 'XP total acumulado',
      consecutiveDays: 'días consecutivos',
      ofTotalUnlocked: 'de {total} desbloqueados',
      nextLevel: 'Siguiente Nivel',
      continueReadingToLevel: 'Continúa leyendo para alcanzar el nivel {level}',
      progressToNextLevel: 'Progreso al siguiente nivel',
      xpNeededForLevel: 'Faltan {xp} XP para el nivel {level}',
      unlocked: 'Desbloqueado',
      complete: 'completo',
      loadingProgress: 'Cargando progreso...',
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
    landing: {
      hero_title: 'Transforma Tu Estudio Bíblico',
      hero_subtitle: 'Inteligencia Artificial, Podcasts, Comunidad y Enseñanza en una única plataforma premium. El futuro del estudio bíblico ha llegado.',
      start_free: 'Comenzar Gratis',
      see_features: 'Ver Características',
      premium_features: 'Características Premium',
      premium_subtitle: 'Todo lo que necesitas para un estudio bíblico profundo y transformador',
      customize_experience: 'Personaliza Tu Experiencia',
      customize_subtitle: '4 temas listos o crea el tuyo propio con colores personalizados',
      why_bible_plus: '¿Por Qué Biblia+?',
      why_subtitle: 'Mucho más que una simple aplicación bíblica',
      cta_title: 'Comienza Hoy Tu Jornada',
      cta_subtitle: 'Únete a miles de personas transformando su estudio bíblico',
      start_free_cta: 'Comenzar Gratis',
      footer_description: 'Estudio Premium con IA',
      footer_plans: 'Planes',
      footer_contact: 'Contacto',
      footer_support: 'Soporte',
      newGeneration: 'v2.0 - Nueva Generación',
      nav_resources: 'Recursos',
      nav_themes: 'Temas',
      nav_testimonials: 'Testimonios',
      nav_faq: 'Preguntas',
      powerful_resources: 'Recursos Poderosos Para Tu Estudio',
      incredible_themes: 'Temas Increíbles',
      premium_content: 'Contenido Premium',
      faq_title: 'Preguntas Frecuentes',
      what_users_say: 'Lo Que Dicen Nuestros Usuarios',
      transform_study: 'Transforma tu estudio con Biblia+',
      features: {
        aiTitle: 'IA Teológica',
        aiDesc: 'Asistente inteligente responde preguntas bíblicas, compara doctrinas y ofrece contexto histórico profundo.',
        plansTitle: 'Planes Personalizados',
        plansDesc: 'Crea planes de lectura integrados con podcasts y sigue tu progreso diario.',
        podcastsTitle: 'Podcasts Integrados',
        podcastsDesc: 'Escucha, descarga e incluye episodios de podcast en tus planes de estudio bíblico.',
        teacherTitle: 'Modo Profesor',
        teacherDesc: 'Crea lecciones, evalúa estudiantes y gestiona clases con herramientas profesionales.',
        communityTitle: 'Comunidad Activa',
        communityDesc: 'Comparte ideas, conéctate con otros estudiantes y crece juntos.',
        themesTitle: 'Temas Personalizables',
        themesDesc: '5 temas premium o crea el tuyo propio con selector de colores RGB personalizado.',
      },
    },
    pricing: {
      page_title: 'Planes y Precios',
      page_subtitle: 'Elige el plan perfecto para tu jornada espiritual',
      free_plan: 'Gratis',
      premium_plan: 'Premium',
      lifetime_plan: 'De Por Vida',
      per_month: '/mes',
      one_time: 'pago único',
      select_plan: 'Elegir Plan',
      guarantee_title: 'Garantía de 30 Días',
      guarantee_description: '100% de reembolso si no estás satisfecho',
      faq_title: 'Preguntas Frecuentes',
    },
    community: {
      title: 'Comunidad',
      what_studying: '¿Qué estás estudiando?',
      verse_reference: 'Referencia del Versículo',
      your_reflection: 'Tu Reflexión',
      post: 'Publicar',
      trending_topics: 'Temas Destacados',
      likes: 'me gusta',
      comments: 'comentarios',
    },
    favorites: {
      title: 'Mis Favoritos',
      subtitle: 'Versículos guardados, destacados y notas',
      bookmarks: 'Marcadores',
      highlights: 'Destacados',
      notes: 'Notas',
      no_favorites: 'Aún no hay favoritos',
      add_first: 'Comienza agregando tus versículos favoritos',
    },
    profile: {
      title: 'Perfil',
      my_plans: 'Mis Planes',
      prayer: 'Oración',
      achievements: 'Logros',
      reading_streak: 'Racha de Lectura',
      spiritual_level: 'Nivel Espiritual',
      edit_profile: 'Editar Perfil',
      logout: 'Salir',
    },
    aiStudy: {
      title: 'Estudiar con IA',
      subtitle: 'Asistente teológico inteligente',
      ai_chat: 'Chat con IA',
      ask_question: 'Haz una pregunta teológica',
      type_message: 'Escribe tu mensaje...',
    },
    teacherMode: {
      title: 'Modo Profesor',
      new_lesson: 'Nueva Lección',
      lesson_title: 'Título de la Lección',
      students: 'Estudiantes',
      progress: 'Progreso',
      export_report: 'Exportar Informe',
    },
    offline: {
      title: 'Modo Sin Conexión',
      chapters_saved: 'Capítulos Guardados',
      space_used: 'Espacio Usado',
      books_downloaded: 'Libros Descargados',
      download_chapter: 'Descargar Capítulo',
      delete_chapter: 'Eliminar',
      clear_all: 'Borrar Todo',
    },
    contact: {
      title: 'Contáctanos',
      subtitle: 'Envía Tu Mensaje',
      name: 'Nombre',
      email: 'Correo Electrónico',
      message: 'Mensaje',
      send: 'Enviar',
      success: '¡Mensaje enviado exitosamente!',
    },
  },
};

export function getBookName(bookAbbrev: string, language: Language): string {
  const lowerAbbrev = bookAbbrev.toLowerCase();
  return translations[language].bibleBooks[lowerAbbrev] || bookAbbrev;
}

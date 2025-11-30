export interface GamificationLevel {
  level: number;
  title: string;
  titleEn: string;
  minXp: number;
  maxXp: number;
  badge: string;
}

export const GAMIFICATION_LEVELS: GamificationLevel[] = [
  { level: 1, title: "Iniciante", titleEn: "Beginner", minXp: 0, maxXp: 100, badge: "seedling" },
  { level: 2, title: "Curioso", titleEn: "Curious", minXp: 100, maxXp: 250, badge: "sprout" },
  { level: 3, title: "Aprendiz", titleEn: "Apprentice", minXp: 250, maxXp: 450, badge: "leaf" },
  { level: 4, title: "Estudante", titleEn: "Student", minXp: 450, maxXp: 700, badge: "book" },
  { level: 5, title: "Dedicado", titleEn: "Dedicated", minXp: 700, maxXp: 1000, badge: "star" },
  { level: 6, title: "Persistente", titleEn: "Persistent", minXp: 1000, maxXp: 1350, badge: "flame" },
  { level: 7, title: "Focado", titleEn: "Focused", minXp: 1350, maxXp: 1750, badge: "target" },
  { level: 8, title: "Constante", titleEn: "Constant", minXp: 1750, maxXp: 2200, badge: "calendar" },
  { level: 9, title: "Comprometido", titleEn: "Committed", minXp: 2200, maxXp: 2700, badge: "check" },
  { level: 10, title: "Leitor Bronze", titleEn: "Bronze Reader", minXp: 2700, maxXp: 3250, badge: "bronze" },
  { level: 11, title: "Explorador", titleEn: "Explorer", minXp: 3250, maxXp: 3850, badge: "compass" },
  { level: 12, title: "Buscador", titleEn: "Seeker", minXp: 3850, maxXp: 4500, badge: "search" },
  { level: 13, title: "Investigador", titleEn: "Investigator", minXp: 4500, maxXp: 5200, badge: "magnifier" },
  { level: 14, title: "Estudioso", titleEn: "Studious", minXp: 5200, maxXp: 5950, badge: "glasses" },
  { level: 15, title: "Aplicado", titleEn: "Diligent", minXp: 5950, maxXp: 6750, badge: "pencil" },
  { level: 16, title: "Devoto", titleEn: "Devout", minXp: 6750, maxXp: 7600, badge: "heart" },
  { level: 17, title: "Fiel", titleEn: "Faithful", minXp: 7600, maxXp: 8500, badge: "shield" },
  { level: 18, title: "Zeloso", titleEn: "Zealous", minXp: 8500, maxXp: 9450, badge: "fire" },
  { level: 19, title: "Diligente", titleEn: "Hardworking", minXp: 9450, maxXp: 10450, badge: "hammer" },
  { level: 20, title: "Leitor Prata", titleEn: "Silver Reader", minXp: 10450, maxXp: 11500, badge: "silver" },
  { level: 21, title: "Conhecedor", titleEn: "Knowledgeable", minXp: 11500, maxXp: 12600, badge: "brain" },
  { level: 22, title: "Sábio Iniciante", titleEn: "Novice Sage", minXp: 12600, maxXp: 13750, badge: "owl" },
  { level: 23, title: "Pensador", titleEn: "Thinker", minXp: 13750, maxXp: 14950, badge: "lightbulb" },
  { level: 24, title: "Reflexivo", titleEn: "Reflective", minXp: 14950, maxXp: 16200, badge: "mirror" },
  { level: 25, title: "Contemplativo", titleEn: "Contemplative", minXp: 16200, maxXp: 17500, badge: "meditation" },
  { level: 26, title: "Instruído", titleEn: "Learned", minXp: 17500, maxXp: 18850, badge: "scroll" },
  { level: 27, title: "Esclarecido", titleEn: "Enlightened", minXp: 18850, maxXp: 20250, badge: "sun" },
  { level: 28, title: "Iluminado", titleEn: "Illuminated", minXp: 20250, maxXp: 21700, badge: "lantern" },
  { level: 29, title: "Inspirado", titleEn: "Inspired", minXp: 21700, maxXp: 23200, badge: "dove" },
  { level: 30, title: "Leitor Ouro", titleEn: "Gold Reader", minXp: 23200, maxXp: 24750, badge: "gold" },
  { level: 31, title: "Discípulo", titleEn: "Disciple", minXp: 24750, maxXp: 26350, badge: "footsteps" },
  { level: 32, title: "Seguidor Fiel", titleEn: "Faithful Follower", minXp: 26350, maxXp: 28000, badge: "path" },
  { level: 33, title: "Guardião", titleEn: "Guardian", minXp: 28000, maxXp: 29700, badge: "guardian" },
  { level: 34, title: "Protetor", titleEn: "Protector", minXp: 29700, maxXp: 31450, badge: "armor" },
  { level: 35, title: "Defensor", titleEn: "Defender", minXp: 31450, maxXp: 33250, badge: "sword" },
  { level: 36, title: "Guerreiro", titleEn: "Warrior", minXp: 33250, maxXp: 35100, badge: "warrior" },
  { level: 37, title: "Vencedor", titleEn: "Victor", minXp: 35100, maxXp: 37000, badge: "victory" },
  { level: 38, title: "Campeão", titleEn: "Champion", minXp: 37000, maxXp: 38950, badge: "medal" },
  { level: 39, title: "Herói da Fé", titleEn: "Hero of Faith", minXp: 38950, maxXp: 40950, badge: "hero" },
  { level: 40, title: "Leitor Platina", titleEn: "Platinum Reader", minXp: 40950, maxXp: 43000, badge: "platinum" },
  { level: 41, title: "Mestre Iniciante", titleEn: "Novice Master", minXp: 43000, maxXp: 45100, badge: "crown-bronze" },
  { level: 42, title: "Mestre Aprendiz", titleEn: "Apprentice Master", minXp: 45100, maxXp: 47250, badge: "crown-silver" },
  { level: 43, title: "Mestre Estudioso", titleEn: "Studious Master", minXp: 47250, maxXp: 49450, badge: "crown-gold" },
  { level: 44, title: "Mestre Sábio", titleEn: "Wise Master", minXp: 49450, maxXp: 51700, badge: "wisdom" },
  { level: 45, title: "Mestre Iluminado", titleEn: "Illuminated Master", minXp: 51700, maxXp: 54000, badge: "halo" },
  { level: 46, title: "Doutor da Palavra", titleEn: "Doctor of the Word", minXp: 54000, maxXp: 56350, badge: "doctorate" },
  { level: 47, title: "Teólogo Avançado", titleEn: "Advanced Theologian", minXp: 56350, maxXp: 58750, badge: "theology" },
  { level: 48, title: "Erudito Bíblico", titleEn: "Biblical Scholar", minXp: 58750, maxXp: 61200, badge: "scholar" },
  { level: 49, title: "Grão-Mestre", titleEn: "Grand Master", minXp: 61200, maxXp: 63700, badge: "grandmaster" },
  { level: 50, title: "Mestre Teólogo", titleEn: "Master Theologian", minXp: 63700, maxXp: Infinity, badge: "ultimate" },
];

export const getLevelInfo = (level: number): GamificationLevel => {
  const clampedLevel = Math.min(Math.max(level, 1), 50);
  return GAMIFICATION_LEVELS[clampedLevel - 1];
};

export const getLevelByXp = (totalXp: number): GamificationLevel => {
  for (let i = GAMIFICATION_LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= GAMIFICATION_LEVELS[i].minXp) {
      return GAMIFICATION_LEVELS[i];
    }
  }
  return GAMIFICATION_LEVELS[0];
};

export const getXpForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= 50) return 0;
  const nextLevel = GAMIFICATION_LEVELS[currentLevel];
  return nextLevel ? nextLevel.minXp : 0;
};

export const getXpProgressInLevel = (totalXp: number, level: number): { current: number; needed: number; percent: number } => {
  const currentLevelInfo = GAMIFICATION_LEVELS[level - 1];
  const nextLevelInfo = GAMIFICATION_LEVELS[level] || currentLevelInfo;
  
  const xpInCurrentLevel = totalXp - currentLevelInfo.minXp;
  const xpNeededForNextLevel = nextLevelInfo.minXp - currentLevelInfo.minXp;
  
  if (level >= 50) {
    return { current: totalXp, needed: totalXp, percent: 100 };
  }
  
  return {
    current: xpInCurrentLevel,
    needed: xpNeededForNextLevel,
    percent: Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100)
  };
};

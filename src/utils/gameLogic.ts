import { Category } from '../data/categories';

export type Role = 'agent' | 'spy';

export interface Player {
  id: string;
  name: string;
  role: Role;
  word: string;
  categoryId: string;
  categoryName: string;
  isEliminated?: boolean;
}

export interface GameConfig {
  agentCount: number;
  spyCount: number;
  categoryIds: string[];
  playerNames: string[];
}

export interface GameState {
  players: Player[];
  selectedCategory: Category | null;
  agentWord: string;
  spyWord: string;
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const selectTwoDifferentWords = (category: Category): { word1: string; word2: string } => {
  const words = [...category.words];

  if (words.length < 2) {
    throw new Error(`Kategori "${category.name}" en az 2 kelime içermelidir.`);
  }

  const firstIndex = Math.floor(Math.random() * words.length);
  const word1 = words[firstIndex];

  let word2: string;
  let secondIndex: number;
  do {
    secondIndex = Math.floor(Math.random() * words.length);
    word2 = words[secondIndex];
  } while (word1 === word2 || secondIndex === firstIndex);

  return { word1, word2 };
};

export const selectRandomCategory = (categoryIds: string[], allCategories: Category[]): Category => {
  if (categoryIds.length === 0) {
    throw new Error('En az bir kategori seçilmelidir.');
  }

  const selectedCategories = allCategories.filter((cat) => categoryIds.includes(cat.id));
  if (selectedCategories.length === 0) {
    throw new Error('Seçilen kategoriler bulunamadı.');
  }

  const randomIndex = Math.floor(Math.random() * selectedCategories.length);
  return selectedCategories[randomIndex];
};

export const assignRolesAndWords = (config: GameConfig, allCategories: Category[]): GameState => {
  const { agentCount, spyCount, categoryIds, playerNames } = config;

  const totalPlayers = agentCount + spyCount;
  if (playerNames.length !== totalPlayers) {
    throw new Error(`Oyuncu sayısı (${playerNames.length}) toplam role (${totalPlayers}) eşit olmalıdır.`);
  }

  const selectedCategory = selectRandomCategory(categoryIds, allCategories);
  const { word1, word2 } = selectTwoDifferentWords(selectedCategory);

  const agentWord = Math.random() < 0.5 ? word1 : word2;
  const spyWord = agentWord === word1 ? word2 : word1;

  const roles: Role[] = [];
  for (let i = 0; i < agentCount; i++) {
    roles.push('agent');
  }
  for (let i = 0; i < spyCount; i++) {
    roles.push('spy');
  }

  const shuffledRoles = shuffleArray(roles);

  const actualSpyCount = shuffledRoles.filter((r) => r === 'spy').length;
  if (actualSpyCount !== spyCount) {
    const spyIndices: number[] = [];
    const agentIndices: number[] = [];

    shuffledRoles.forEach((role, index) => {
      if (role === 'spy') {
        spyIndices.push(index);
      } else {
        agentIndices.push(index);
      }
    });

    while (spyIndices.length < spyCount && agentIndices.length > 0) {
      const randomAgentIndex = Math.floor(Math.random() * agentIndices.length);
      const indexToConvert = agentIndices.splice(randomAgentIndex, 1)[0];
      spyIndices.push(indexToConvert);
    }

    while (spyIndices.length > spyCount) {
      const randomSpyIndex = Math.floor(Math.random() * spyIndices.length);
      const indexToConvert = spyIndices.splice(randomSpyIndex, 1)[0];
      agentIndices.push(indexToConvert);
    }

    shuffledRoles.forEach((_, index) => {
      if (spyIndices.includes(index)) {
        shuffledRoles[index] = 'spy';
      } else {
        shuffledRoles[index] = 'agent';
      }
    });
  }

  const players: Player[] = playerNames.map((name, index) => {
    const role = shuffledRoles[index];
    return {
      id: `player-${index}`,
      name,
      role,
      word: role === 'agent' ? agentWord : spyWord,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
    };
  });

  return {
    players,
    selectedCategory,
    agentWord,
    spyWord,
  };
};

export const validateGameRules = (agentCount: number, spyCount: number): { valid: boolean; error?: string } => {
  if (agentCount + spyCount < 4) {
    return {
      valid: false,
      error: 'Minimum 4 oyuncu gereklidir.',
    };
  }

  if (spyCount > agentCount - 2) {
    return {
      valid: false,
      error: `Spy sayısı (${spyCount}) en fazla Agent sayısı - 2 (${agentCount - 2}) olabilir.`,
    };
  }

  if (agentCount < 3) {
    return {
      valid: false,
      error: 'Minimum 3 Agent gereklidir.',
    };
  }

  return { valid: true };
};

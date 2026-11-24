import { LevelConfig } from '@/src/types';

/**
 * Grid Legend:
 * W = Wall
 * . = Floor
 * C = Counter (prep / place item)
 * B = Cutting board (thớt)
 * S = Stove (bếp ga, holds pan/pot)
 * O = Oven (lò nướng)
 * R = Rice cooker (nồi cơm điện)
 * F = Deep fryer (nồi chiên)
 * P = Plate dispenser (giá đĩa sạch)
 * K = Sink (bồn rửa đĩa)
 * D = Delivery / Serving station (quầy giao món)
 * T = Trash bin (thùng rác)
 * X = Fire extinguisher stand (giá bình chữa cháy)
 * 1-9, a-z = Ingredient boxes:
 *   1 = Lettuce (xà lách)
 *   2 = Tomato (cà chua)
 *   3 = Cucumber (dưa leo)
 *   4 = Bun (bánh mì burger)
 *   5 = Beef (thịt bò)
 *   6 = Cheese (phô mai)
 *   7 = Dough (bột pizza)
 *   8 = Mushroom (nấm)
 *   9 = Rice (gạo)
 *   a = Seaweed (rong biển)
 *   b = Fish (cá)
 *   c = Egg (trứng)
 *   d = Vegetables (rau củ)
 *   e = Pasta (mì Ý)
 *   f = Onion (hành tây)
 *   g = Potato (khoai tây)
 */

export const INGREDIENT_CHAR_MAP: Record<string, string> = {
  '1': 'lettuce',
  '2': 'tomato',
  '3': 'cucumber',
  '4': 'bun',
  '5': 'beef',
  '6': 'cheese',
  '7': 'dough',
  '8': 'mushroom',
  '9': 'rice',
  'a': 'seaweed',
  'b': 'fish',
  'c': 'egg',
  'd': 'vegetables',
  'e': 'pasta',
  'f': 'onion',
  'g': 'potato',
};

export const LEVELS: LevelConfig[] = [
  // ===================== WORLD 1: NHÀ BẾP CƠ BẢN =====================
  {
    id: 'level_1_1',
    worldId: 1,
    levelNumber: 1,
    nameVi: '1-1: Làm quen với bếp',
    worldNameVi: 'Nhà bếp cơ bản',
    difficulty: 'easy',
    timeLimit: 180,
    orderInterval: 22,
    maxSimultaneousOrders: 3,
    availableRecipes: ['salad'],
    starThresholds: [60, 140, 220],
    gridWidth: 12,
    gridHeight: 8,
    layout: [
      'WWWWWWWWWWWW',
      'W1.2.3.P.T.W',
      'W..........W',
      'W.B.C..C.B.W',
      'W..........W',
      'W.C..C..C..W',
      'W..D...K..XW',
      'WWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_1_2',
    worldId: 1,
    levelNumber: 2,
    nameVi: '1-2: Cắt gọt điêu luyện',
    worldNameVi: 'Nhà bếp cơ bản',
    difficulty: 'easy',
    timeLimit: 180,
    orderInterval: 20,
    maxSimultaneousOrders: 3,
    availableRecipes: ['salad', 'onion_soup'],
    starThresholds: [80, 180, 280],
    gridWidth: 12,
    gridHeight: 8,
    layout: [
      'WWWWWWWWWWWW',
      'W1.2.3.f.T.W',
      'W..........W',
      'W.B.S..B.S.W',
      'W..........W',
      'W.P..C..K..W',
      'W..D...C..XW',
      'WWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_1_3',
    worldId: 1,
    levelNumber: 3,
    nameVi: '1-3: Luộc súp ấm nóng',
    worldNameVi: 'Nhà bếp cơ bản',
    difficulty: 'easy',
    timeLimit: 200,
    orderInterval: 18,
    maxSimultaneousOrders: 4,
    availableRecipes: ['onion_soup', 'tomato_soup', 'salad'],
    starThresholds: [100, 220, 340],
    gridWidth: 14,
    gridHeight: 8,
    layout: [
      'WWWWWWWWWWWWWW',
      'W1.2.3.f...T.W',
      'W............W',
      'W.B.B..S.S.C.W',
      'W............W',
      'W.P.C..K.K...W',
      'W...D...C..X.W',
      'WWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_1_4',
    worldId: 1,
    levelNumber: 4,
    nameVi: '1-4: Bếp trưởng cơ bản',
    worldNameVi: 'Nhà bếp cơ bản',
    difficulty: 'normal',
    timeLimit: 210,
    orderInterval: 16,
    maxSimultaneousOrders: 4,
    availableRecipes: ['salad', 'onion_soup', 'tomato_soup'],
    starThresholds: [140, 280, 420],
    gridWidth: 14,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWW',
      'W1.2.3.f.C.T.W',
      'W............W',
      'W.B.C..C.B.C.W',
      'W............W',
      'W.S.S..C.P...W',
      'W............W',
      'W.D..K.K...X.W',
      'WWWWWWWWWWWWWW',
    ],
  },

  // ===================== WORLD 2: NHÀ HÀNG THỨC ĂN NHANH =====================
  {
    id: 'level_2_1',
    worldId: 2,
    levelNumber: 1,
    nameVi: '2-1: Burger đầu tiên',
    worldNameVi: 'Nhà hàng thức ăn nhanh',
    difficulty: 'normal',
    timeLimit: 200,
    orderInterval: 18,
    maxSimultaneousOrders: 3,
    availableRecipes: ['hamburger'],
    starThresholds: [120, 260, 400],
    gridWidth: 14,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWW',
      'W4.5.1.2...T.W',
      'W............W',
      'W.B.B..S.S...W',
      'W............W',
      'W.C.C..C.C.P.W',
      'W............W',
      'W.D....K...X.W',
      'WWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_2_2',
    worldId: 2,
    levelNumber: 2,
    nameVi: '2-2: Khoai tây vàng giòn',
    worldNameVi: 'Nhà hàng thức ăn nhanh',
    difficulty: 'normal',
    timeLimit: 210,
    orderInterval: 16,
    maxSimultaneousOrders: 4,
    availableRecipes: ['hamburger', 'french_fries'],
    starThresholds: [160, 320, 480],
    gridWidth: 14,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWW',
      'W4.5.1.2.g.T.W',
      'W............W',
      'W.B.B..S.F...W',
      'W............W',
      'W.C.C..C.P.C.W',
      'W............W',
      'W.D....K...X.W',
      'WWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_2_3',
    worldId: 2,
    levelNumber: 3,
    nameVi: '2-3: Thêm phô mai ngậy',
    worldNameVi: 'Nhà hàng thức ăn nhanh',
    difficulty: 'normal',
    timeLimit: 220,
    orderInterval: 15,
    maxSimultaneousOrders: 4,
    availableRecipes: ['hamburger', 'cheeseburger', 'french_fries'],
    starThresholds: [180, 360, 540],
    gridWidth: 16,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'W4.5.6.1.2.g.T.W',
      'W..............W',
      'W.B.B.B..S.S.F.W',
      'W..............W',
      'W.C.C.C..P.C.C.W',
      'W..............W',
      'W.D....K.K...X.W',
      'WWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_2_4',
    worldId: 2,
    levelNumber: 4,
    nameVi: '2-4: Giờ cao điểm đồ ăn nhanh',
    worldNameVi: 'Nhà hàng thức ăn nhanh',
    difficulty: 'hard',
    timeLimit: 240,
    orderInterval: 14,
    maxSimultaneousOrders: 5,
    availableRecipes: ['hamburger', 'cheeseburger', 'french_fries'],
    starThresholds: [220, 460, 680],
    gridWidth: 16,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'W4.5.6.1.2.g.T.W',
      'W..............W',
      'W.B.B.B..S.S...W',
      'W..............W',
      'W.F.F.C..C.P.C.W',
      'W..............W',
      'W.C.C.C..K.K.C.W',
      'W.D..........X.W',
      'WWWWWWWWWWWWWWWW',
    ],
  },

  // ===================== WORLD 3: NHÀ HÀNG Ý =====================
  {
    id: 'level_3_1',
    worldId: 3,
    levelNumber: 1,
    nameVi: '3-1: Bánh Pizza cổ điển',
    worldNameVi: 'Nhà hàng Ý',
    difficulty: 'normal',
    timeLimit: 210,
    orderInterval: 18,
    maxSimultaneousOrders: 3,
    availableRecipes: ['pizza'],
    starThresholds: [140, 300, 450],
    gridWidth: 14,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWW',
      'W7.2.6...O.O.T.W',
      'W............W',
      'W.B.B..C.C.C.W',
      'W............W',
      'W.C.P..C.C...W',
      'W............W',
      'W.D....K...X.W',
      'WWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_3_2',
    worldId: 3,
    levelNumber: 2,
    nameVi: '3-2: Mì Ý thơm lừng',
    worldNameVi: 'Nhà hàng Ý',
    difficulty: 'normal',
    timeLimit: 220,
    orderInterval: 16,
    maxSimultaneousOrders: 4,
    availableRecipes: ['pizza', 'pasta'],
    starThresholds: [160, 340, 520],
    gridWidth: 16,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'W7.2.6.e...O.O.T.W',
      'W..............W',
      'W.B.B.B..S.S...W',
      'W..............W',
      'W.C.C.P..C.C.C.W',
      'W..............W',
      'W.D....K.K...X.W',
      'WWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_3_3',
    worldId: 3,
    levelNumber: 3,
    nameVi: '3-3: Pizza nấm thượng hạng',
    worldNameVi: 'Nhà hàng Ý',
    difficulty: 'hard',
    timeLimit: 230,
    orderInterval: 15,
    maxSimultaneousOrders: 4,
    availableRecipes: ['pizza', 'mushroom_pizza', 'pasta'],
    starThresholds: [200, 420, 640],
    gridWidth: 16,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'W7.2.6.8.e.O.O.T.W',
      'W..............W',
      'W.B.B.B..S.S...W',
      'W..............W',
      'W.C.C.C..C.P.C.W',
      'W..............W',
      'W.C.D....K.K.X.W',
      'W..............W',
      'WWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_3_4',
    worldId: 3,
    levelNumber: 4,
    nameVi: '3-4: Đêm tiệc ẩm thực Ý',
    worldNameVi: 'Nhà hàng Ý',
    difficulty: 'hard',
    timeLimit: 240,
    orderInterval: 14,
    maxSimultaneousOrders: 5,
    availableRecipes: ['pizza', 'mushroom_pizza', 'pasta', 'tomato_soup'],
    starThresholds: [240, 500, 750],
    gridWidth: 18,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWWWW',
      'W7.2.6.8.e...O.O.T.W',
      'W................W',
      'W.B.B.B.B..S.S.S.W',
      'W................W',
      'W.C.C.C.C..P.C.C.W',
      'W................W',
      'W.C.C.C....K.K.X.W',
      'W.D..............W',
      'WWWWWWWWWWWWWWWWWW',
    ],
  },

  // ===================== WORLD 4: NHÀ HÀNG CHÂU Á =====================
  {
    id: 'level_4_1',
    worldId: 4,
    levelNumber: 1,
    nameVi: '4-1: Cơm chiên trứng vàng',
    worldNameVi: 'Nhà hàng châu Á',
    difficulty: 'normal',
    timeLimit: 210,
    orderInterval: 17,
    maxSimultaneousOrders: 3,
    availableRecipes: ['fried_rice'],
    starThresholds: [150, 320, 480],
    gridWidth: 14,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWW',
      'W9.c.d...R.S.T.W',
      'W............W',
      'W.B.B..C.C.C.W',
      'W............W',
      'W.C.P..C.C...W',
      'W............W',
      'W.D....K...X.W',
      'WWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_4_2',
    worldId: 4,
    levelNumber: 2,
    nameVi: '4-2: Cuộn Sushi tươi ngon',
    worldNameVi: 'Nhà hàng châu Á',
    difficulty: 'normal',
    timeLimit: 220,
    orderInterval: 16,
    maxSimultaneousOrders: 4,
    availableRecipes: ['sushi', 'fried_rice'],
    starThresholds: [180, 360, 550],
    gridWidth: 16,
    gridHeight: 9,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'W9.a.b.c.d.R.S.T.W',
      'W..............W',
      'W.B.B.B..C.C.C.W',
      'W..............W',
      'W.C.C.P..C.K...W',
      'W..............W',
      'W.D....C...K.X.W',
      'WWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_4_3',
    worldId: 4,
    levelNumber: 3,
    nameVi: '4-3: Cá nướng thơm lừng',
    worldNameVi: 'Nhà hàng châu Á',
    difficulty: 'hard',
    timeLimit: 230,
    orderInterval: 15,
    maxSimultaneousOrders: 4,
    availableRecipes: ['grilled_fish', 'sushi', 'fried_rice'],
    starThresholds: [200, 420, 650],
    gridWidth: 16,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'W9.a.b.c.d.R.S.T.W',
      'W..............W',
      'W.B.B.B..S.S...W',
      'W..............W',
      'W.C.C.C..P.C.C.W',
      'W..............W',
      'W.C.C....K.K.X.W',
      'W.D............W',
      'WWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_4_4',
    worldId: 4,
    levelNumber: 4,
    nameVi: '4-4: Bữa tiệc châu Á thịnh soạn',
    worldNameVi: 'Nhà hàng châu Á',
    difficulty: 'hard',
    timeLimit: 240,
    orderInterval: 13,
    maxSimultaneousOrders: 5,
    availableRecipes: ['sushi', 'fried_rice', 'grilled_fish'],
    starThresholds: [240, 500, 780],
    gridWidth: 18,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWWWW',
      'W9.a.b.c.d...R.R.T.W',
      'W................W',
      'W.B.B.B.B..S.S.S.W',
      'W................W',
      'W.C.C.C.C..P.P...W',
      'W................W',
      'W.C.C.C....K.K.X.W',
      'W.D..............W',
      'WWWWWWWWWWWWWWWWWW',
    ],
  },

  // ===================== WORLD 5: NHÀ BẾP HỖN LOẠN =====================
  {
    id: 'level_5_1',
    worldId: 5,
    levelNumber: 1,
    nameVi: '5-1: Băng chuyền tách đôi',
    worldNameVi: 'Nhà bếp hỗn loạn',
    difficulty: 'hard',
    timeLimit: 220,
    orderInterval: 14,
    maxSimultaneousOrders: 4,
    availableRecipes: ['hamburger', 'pizza', 'salad'],
    starThresholds: [180, 380, 580],
    gridWidth: 16,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'W4.5.1.2.7.6.O.T.W',
      'W..............W',
      'W.B.B.B..S.S...W',
      'W......WW......W',
      'W.C.C..WW..C.P.W',
      'W..............W',
      'W.C.C....K.K.X.W',
      'W.D............W',
      'WWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_5_2',
    worldId: 5,
    levelNumber: 2,
    nameVi: '5-2: Nguy cơ hỏa hoạn',
    worldNameVi: 'Nhà bếp hỗn loạn',
    difficulty: 'hard',
    timeLimit: 230,
    orderInterval: 13,
    maxSimultaneousOrders: 4,
    availableRecipes: ['french_fries', 'grilled_fish', 'mushroom_pizza'],
    starThresholds: [200, 440, 680],
    gridWidth: 16,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWW',
      'Wg.b.7.8.6.2.O.T.W',
      'W..............W',
      'W.B.B.B..S.F...W',
      'W..............W',
      'W.C.C.C..P.C.C.W',
      'W..X...........W',
      'W.D....K.K...X.W',
      'W..............W',
      'WWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_5_3',
    worldId: 5,
    levelNumber: 3,
    nameVi: '5-3: Lối đi hẹp',
    worldNameVi: 'Nhà bếp hỗn loạn',
    difficulty: 'chaotic',
    timeLimit: 240,
    orderInterval: 12,
    maxSimultaneousOrders: 5,
    availableRecipes: ['sushi', 'pasta', 'fried_rice'],
    starThresholds: [220, 480, 720],
    gridWidth: 18,
    gridHeight: 10,
    layout: [
      'WWWWWWWWWWWWWWWWWW',
      'W9.a.b.e.2.c.d.R.T.W',
      'W................W',
      'W.B.B.B..S.S.S...W',
      'W...WWWW...WWWW..W',
      'W.C.C.C..P.P.C...W',
      'W................W',
      'W.D....K.K.....X.W',
      'W................W',
      'WWWWWWWWWWWWWWWWWW',
    ],
  },
  {
    id: 'level_5_4',
    worldId: 5,
    levelNumber: 4,
    nameVi: '5-4: Trận chiến hỗn loạn tối thượng',
    worldNameVi: 'Nhà bếp hỗn loạn',
    difficulty: 'chaotic',
    timeLimit: 270,
    orderInterval: 11,
    maxSimultaneousOrders: 6,
    availableRecipes: [
      'hamburger',
      'cheeseburger',
      'pizza',
      'mushroom_pizza',
      'sushi',
      'fried_rice',
      'french_fries',
      'pasta',
    ],
    starThresholds: [300, 650, 1000],
    gridWidth: 20,
    gridHeight: 11,
    layout: [
      'WWWWWWWWWWWWWWWWWWWW',
      'W4.5.6.7.2.8.9.a.b.TW',
      'W..................W',
      'W.B.B.B.B..S.S.S.O.W',
      'W..................W',
      'W.F.F.R.C..P.P.C.C.W',
      'W..................W',
      'W.C.C.C.C..K.K.K.X.W',
      'W..................W',
      'W.D..D...........X.W',
      'WWWWWWWWWWWWWWWWWWWW',
    ],
  },
];

/**
 * Returns level config by ID.
 */
export function getLevelById(id: string): LevelConfig | undefined {
  return LEVELS.find((lvl) => lvl.id === id);
}

/**
 * Dynamically scales a kitchen layout for multiplayer room size (2, 3-4, 5-6, 7-8 players).
 */
export function getScaledLevelForPlayers(
  baseLevel: LevelConfig,
  playerCount: number,
): LevelConfig {
  if (playerCount <= 2) {
    return baseLevel;
  }

  // Clone base level
  const scaled = JSON.parse(JSON.stringify(baseLevel)) as LevelConfig;

  // For 3-4 players: increase simultaneous orders and order frequency
  if (playerCount <= 4) {
    scaled.maxSimultaneousOrders = Math.min(6, baseLevel.maxSimultaneousOrders + 1);
    scaled.orderInterval = Math.max(9, baseLevel.orderInterval - 3);
    scaled.starThresholds = [
      Math.floor(baseLevel.starThresholds[0] * 1.4),
      Math.floor(baseLevel.starThresholds[1] * 1.4),
      Math.floor(baseLevel.starThresholds[2] * 1.4),
    ];
    return scaled;
  }

  // For 5-6 players: expand order capacity, add duplicate stations
  if (playerCount <= 6) {
    scaled.maxSimultaneousOrders = Math.min(8, baseLevel.maxSimultaneousOrders + 2);
    scaled.orderInterval = Math.max(7, baseLevel.orderInterval - 5);
    scaled.starThresholds = [
      Math.floor(baseLevel.starThresholds[0] * 1.9),
      Math.floor(baseLevel.starThresholds[1] * 1.9),
      Math.floor(baseLevel.starThresholds[2] * 1.9),
    ];
    return scaled;
  }

  // For 7-8 players: Extra large capacity & high throughput
  scaled.maxSimultaneousOrders = Math.min(10, baseLevel.maxSimultaneousOrders + 3);
  scaled.orderInterval = Math.max(5, baseLevel.orderInterval - 7);
  scaled.starThresholds = [
    Math.floor(baseLevel.starThresholds[0] * 2.5),
    Math.floor(baseLevel.starThresholds[1] * 2.5),
    Math.floor(baseLevel.starThresholds[2] * 2.5),
  ];

  return scaled;
}

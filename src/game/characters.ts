import { ChefCharacter } from '@/src/types';

export const CHEF_CHARACTERS: ChefCharacter[] = [
  {
    id: 'chef_1',
    nameVi: 'Bếp Trưởng Đỏ (Hào)',
    color: '#EF4444',
    accentColor: '#B91C1C',
    hatColor: '#FFFFFF',
    apronColor: '#F87171',
    skinTone: '#FCD34D',
  },
  {
    id: 'chef_2',
    nameVi: 'Bếp Trưởng Lam (Bảo)',
    color: '#3B82F6',
    accentColor: '#1D4ED8',
    hatColor: '#FFFFFF',
    apronColor: '#60A5FA',
    skinTone: '#FBBF24',
  },
  {
    id: 'chef_3',
    nameVi: 'Bếp Trưởng Lục (Minh)',
    color: '#10B981',
    accentColor: '#047857',
    hatColor: '#FFFFFF',
    apronColor: '#34D399',
    skinTone: '#F59E0B',
  },
  {
    id: 'chef_4',
    nameVi: 'Bếp Trưởng Vàng (Ánh)',
    color: '#F59E0B',
    accentColor: '#B45309',
    hatColor: '#FFFFFF',
    apronColor: '#FBBF24',
    skinTone: '#FCD34D',
  },
  {
    id: 'chef_5',
    nameVi: 'Bếp Trưởng Tím (Trúc)',
    color: '#8B5CF6',
    accentColor: '#6D28D9',
    hatColor: '#FFFFFF',
    apronColor: '#A78BFA',
    skinTone: '#FDE68A',
  },
  {
    id: 'chef_6',
    nameVi: 'Bếp Trưởng Hồng (Mai)',
    color: '#EC4899',
    accentColor: '#BE185D',
    hatColor: '#FFFFFF',
    apronColor: '#F472B6',
    skinTone: '#FCD34D',
  },
  {
    id: 'chef_7',
    nameVi: 'Bếp Trưởng Cam (Phong)',
    color: '#F97316',
    accentColor: '#C2410C',
    hatColor: '#FFFFFF',
    apronColor: '#FB923C',
    skinTone: '#F59E0B',
  },
  {
    id: 'chef_8',
    nameVi: 'Bếp Trưởng Ngọc (Linh)',
    color: '#06B6D4',
    accentColor: '#0E7490',
    hatColor: '#FFFFFF',
    apronColor: '#22D3EE',
    skinTone: '#FBBF24',
  },
];

export function getChefById(id: string): ChefCharacter {
  return CHEF_CHARACTERS.find((c) => c.id === id) || CHEF_CHARACTERS[0];
}

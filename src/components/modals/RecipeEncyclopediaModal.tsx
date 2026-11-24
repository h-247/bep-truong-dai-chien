'use client';

import React from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { RECIPE_LIST } from '@/src/game/recipes';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface RecipeEncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeEncyclopediaModal: React.FC<RecipeEncyclopediaModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sách công thức ẩm thực" maxWidth="lg">
      <div className="flex flex-col gap-3">
        {RECIPE_LIST.map((recipe) => (
          <div
            key={recipe.id}
            className="p-3.5 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-[#ECECEC]">{recipe.nameVi}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#303030] border border-[#3A3A3A] text-[#EAB308]">
                {recipe.baseScore} điểm
              </span>
            </div>

            <p className="text-xs text-[#A3A3A3]">{recipe.descriptionVi}</p>

            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-xs text-[#A3A3A3] self-center mr-1">Nguyên liệu:</span>
              {recipe.ingredients.map((ing, idx) => {
                const name = VIETNAMESE_TEXT.ingredients[ing.ingredientId] || ing.ingredientId;
                const state = VIETNAMESE_TEXT.ingredientStates[ing.state] || ing.state;
                return (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-[#262626] border border-[#3A3A3A] text-[#ECECEC]"
                  >
                    {name} ({state})
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

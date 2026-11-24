'use client';

import React from 'react';
import { CustomerOrder } from '@/src/types';
import { RECIPES } from '@/src/game/recipes';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface OrderQueueProps {
  orders: CustomerOrder[];
}

export const OrderQueue: React.FC<OrderQueueProps> = ({ orders }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 no-scrollbar pointer-events-auto">
      {orders.map((order) => {
        const recipe = RECIPES[order.recipeId];
        if (!recipe) return null;

        const ratio = Math.max(0, Math.min(1, order.remainingTime / order.totalTime));
        const isCritical = order.urgency === 'critical';
        const isUrgent = order.urgency === 'urgent';

        const barColor = isCritical
          ? 'bg-[#EF4444]'
          : isUrgent
          ? 'bg-[#EAB308]'
          : 'bg-[#22C55E]';

        return (
          <div
            key={order.id}
            className={`flex-shrink-0 w-32 sm:w-36 bg-[#262626]/90 border ${
              isCritical
                ? 'border-[#EF4444] animate-pulse'
                : 'border-[#3A3A3A]'
            } rounded-xl p-2 shadow-md flex flex-col justify-between`}
          >
            {/* Dish Name */}
            <div className="text-xs font-bold text-[#ECECEC] truncate mb-1">
              {recipe.nameVi}
            </div>

            {/* Ingredients icons preview */}
            <div className="flex items-center gap-1 my-1 overflow-x-hidden">
              {recipe.ingredients.map((ing, idx) => {
                const name = VIETNAMESE_TEXT.ingredients[ing.ingredientId] || ing.ingredientId;
                return (
                  <span
                    key={idx}
                    className="inline-block px-1.5 py-0.5 text-[9px] font-medium bg-[#1A1A1A] text-[#A3A3A3] rounded border border-[#3A3A3A] truncate max-w-[50px]"
                    title={name}
                  >
                    {name}
                  </span>
                );
              })}
            </div>

            {/* Remaining time bar */}
            <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${barColor} transition-all duration-300`}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

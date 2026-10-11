import type { Drink, DrinkId } from './types';

export const DRINKS: readonly Drink[] = [
  {
    id: 'home-coffee',
    name: '自宅のコーヒー',
    detail: '豆 15g、湯 250mL',
    defaultCaffeineMg: 135,
    isEstimate: true,
  },
  {
    id: 'seven-cafe-hot',
    // 375px の幅で「R」だけが次の行に送られないよう、R の前はノーブレークスペースにする
    name: 'セブンカフェ ホット\u00a0R',
    detail: null,
    defaultCaffeineMg: 98,
    isEstimate: false,
  },
  {
    id: 'seven-cafe-iced',
    name: 'セブンカフェ アイス\u00a0R',
    detail: null,
    defaultCaffeineMg: 92,
    isEstimate: false,
  },
  { id: 'green-tea', name: '緑茶 500mL', detail: null, defaultCaffeineMg: 65, isEstimate: false },
  { id: 'hojicha', name: 'ほうじ茶 500mL', detail: null, defaultCaffeineMg: 65, isEstimate: false },
  {
    id: 'jasmine-tea',
    name: 'ジャスミン茶 500mL',
    detail: null,
    defaultCaffeineMg: 50,
    isEstimate: false,
  },
  {
    id: 'black-tea',
    name: '無糖ストレート紅茶 500mL',
    detail: null,
    defaultCaffeineMg: 50,
    isEstimate: false,
  },
];

export function findDrink(id: DrinkId): Drink {
  const drink = DRINKS.find((d) => d.id === id);
  if (drink === undefined) {
    throw new Error(`unknown drink: ${id}`);
  }
  return drink;
}

import type { Drink, DrinkId, Source } from './types';

const SEVEN_CAFE_SOURCE: Source = {
  label: 'セブン-イレブン よくあるご質問',
  url: 'https://faq.sej.co.jp/article/?knowledge_id=cidqbqkvr0h8m5o3utb0',
};

export const DRINKS: readonly Drink[] = [
  {
    id: 'home-coffee',
    name: '自宅のコーヒー',
    detail: '豆 15g、湯 250mL',
    defaultCaffeineMg: 135,
    isEstimate: true,
    source: {
      label: '日本食品標準成分表（八訂）から換算',
      url: 'https://www.mext.go.jp/a_menu/syokuhinseibun/mext_01110.html',
    },
  },
  {
    id: 'seven-cafe-hot',
    // 375px の幅で「R」だけが次の行に送られないよう、R の前はノーブレークスペースにする
    name: 'セブンカフェ ホット R',
    detail: null,
    defaultCaffeineMg: 98,
    isEstimate: false,
    source: SEVEN_CAFE_SOURCE,
  },
  {
    id: 'seven-cafe-iced',
    name: 'セブンカフェ アイス R',
    detail: null,
    defaultCaffeineMg: 92,
    isEstimate: false,
    source: SEVEN_CAFE_SOURCE,
  },
  {
    id: 'green-tea',
    name: '緑茶 500mL',
    detail: null,
    defaultCaffeineMg: 65,
    isEstimate: false,
    source: { label: '伊藤園 お〜いお茶 緑茶', url: 'https://www.itoen.jp/products/45534/' },
  },
  {
    id: 'hojicha',
    name: 'ほうじ茶 500mL',
    detail: null,
    defaultCaffeineMg: 65,
    isEstimate: false,
    source: { label: '伊藤園 お〜いお茶 ほうじ茶', url: 'https://www.itoen.jp/products/41604/' },
  },
  {
    id: 'jasmine-tea',
    name: 'ジャスミン茶 500mL',
    detail: null,
    defaultCaffeineMg: 50,
    isEstimate: false,
    source: {
      label: 'サントリー 伊右衛門 ジャスミン茶',
      url: 'https://products.suntory.co.jp/d/4901777392281/',
    },
  },
  {
    id: 'black-tea',
    name: '無糖ストレート紅茶 500mL',
    detail: null,
    defaultCaffeineMg: 50,
    isEstimate: false,
    source: {
      label: 'キリン 午後の紅茶 おいしい無糖',
      url: 'https://products.kirin.co.jp/softdrink/nutrition/softdrink/',
    },
  },
  {
    id: 'monster-energy',
    name: 'モンスターエナジー 355mL',
    detail: null,
    defaultCaffeineMg: 142,
    isEstimate: false,
    source: {
      label: 'モンスターエナジー',
      url: 'https://www.monsterenergy.com/ja-jp/energy-drinks/monster-energy/%E3%83%A2%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%A8%E3%83%8A%E3%82%B8%E3%83%BC/',
    },
  },
  {
    id: 'red-bull',
    name: 'レッドブル 250mL',
    detail: null,
    defaultCaffeineMg: 80,
    isEstimate: false,
    source: {
      label: 'レッドブル エナジードリンク',
      url: 'https://www.redbull.com/jp-ja/energydrink/products/red-bull-energy-drink',
    },
  },
];

export function findDrink(id: DrinkId): Drink {
  const drink = DRINKS.find((d) => d.id === id);
  if (drink === undefined) {
    throw new Error(`unknown drink: ${id}`);
  }
  return drink;
}

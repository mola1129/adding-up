"use strict";
// moduleの呼び出し
// filesystem
const fs = require("fs");
// ファイルを一行ずつ読み込むためのモジュール
const readline = require("readline");
// ファイル読み込みを行うStreamを生成
const rs = fs.createReadStream("./popu-pref.csv");
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); // key: 都道府県, value: 集計データのオブジェクト
// イベント駆動型
// https://nodejs.org/docs/v10.14.2/api/readline.html
rl.on("line", (lineString) => {
  const columns = lineString.split(",");
  // 文字列を整数値に変換
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) {
      // 初期化
      value = {
        popu10: 0,
        popu15: 0,
        change: null, // 人口の変化率
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
rl.on("close", () => {
  // for-of構文 + 分割代入
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  // 連想配列 => 配列に変換 [[key, value], [key, value], ...]
  // sortで比較関数を渡す
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  // 読みやすく整形
  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      key +
      ": " +
      value.popu10 +
      "=>" +
      value.popu15 +
      " 変化率:" +
      value.change
    );
  });
  console.log(rankingStrings);
});

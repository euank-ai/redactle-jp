// Fetch Japanese Wikipedia articles for Redactle-JP puzzles
// Picks "interesting" articles (featured/good articles) and extracts plain text

const WIKI_API = 'https://ja.wikipedia.org/w/api.php';

// Curated list of interesting Japanese Wikipedia articles (well-known topics)
const ARTICLE_TITLES = [
  '富士山', '東京都', '源氏物語', '織田信長', '桜', '寿司',
  '新幹線', '広島市への原子爆弾投下', '日本語', '太陽系',
  '第二次世界大戦', '夏目漱石', '北海道', '京都市', '相撲',
  '日本国憲法', '宮崎駿', '地震', '忍者', '茶道',
  '平安時代', '東京タワー', '任天堂', 'トヨタ自動車', '柔道',
  '原子力発電', '万葉集', '鎌倉時代', '大阪市', '北極',
  '月', '火星', 'ダイヤモンド', 'ピアノ', 'チェス',
  '恐竜', '南極', '太平洋', 'DNA', '量子力学',
  '人工知能', 'インターネット', '民主主義', '仏教', '哲学',
  'ローマ帝国', 'エジプト', 'モーツァルト', 'アインシュタイン', 'ゴッホ',
  '光合成', '進化', '銀河', '火山', '台風',
  '漫画', 'アニメ', '俳句', '歌舞伎', '武士',
  '明治維新', '江戸時代', '縄文時代', '古事記', '日本書紀',
  '坂本龍馬', '徳川家康', '豊臣秀吉', '聖徳太子', '紫式部',
  '琵琶湖', '瀬戸内海', '沖縄県', '奈良時代', '室町時代',
  '金閣寺', '東大寺', '厳島神社', '姫路城', '原爆ドーム',
  '清水寺', '日光東照宮', '出雲大社', '伊勢神宮', '高野山',
  '味噌', '醤油', '日本酒', '抹茶', '和食',
  'カレーライス', 'ラーメン', '天ぷら', 'うどん', 'そば',
  '空手', '剣道', '弓道', '合気道', '水泳',
];

async function fetchArticleText(title) {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'extracts',
    explaintext: '1',
    exsectionformat: 'plain',
    format: 'json',
  });
  const res = await fetch(`${WIKI_API}?${params}`);
  const data = await res.json();
  const pages = data.query.pages;
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined) return null;
  return { title: page.title, text: page.extract };
}

async function main() {
  const articles = [];
  for (const title of ARTICLE_TITLES) {
    console.error(`Fetching: ${title}`);
    const article = await fetchArticleText(title);
    if (article && article.text && article.text.length > 500) {
      // Trim to first ~3000 chars for reasonable puzzle size
      let text = article.text;
      // Cut at a paragraph boundary near 3000 chars
      if (text.length > 4000) {
        const cutPoint = text.indexOf('\n', 3000);
        if (cutPoint > 0 && cutPoint < 5000) {
          text = text.substring(0, cutPoint);
        } else {
          text = text.substring(0, 3000);
        }
      }
      articles.push({ title: article.title, text });
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.error(`Fetched ${articles.length} articles`);
  console.log(JSON.stringify(articles, null, 2));
}

main();

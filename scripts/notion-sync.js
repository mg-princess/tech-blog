const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs').promises;
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 📝 Blog DB ID
const BLOG_DB_ID = '020fe33b17b84e199e3954bd037f70d1';
const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getProperty(page, name, type) {
  const prop = page.properties[name];
  if (!prop) return null;
  switch (type) {
    case 'title':
      return prop.title?.map(t => t.plain_text).join('') || '';
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map(s => s.name) || [];
    case 'date':
      return prop.date?.start || null;
    case 'checkbox':
      return prop.checkbox || false;
    default:
      return null;
  }
}

async function sync() {
  console.log('🔄 Notion → Hugo 동기화 시작...\n');

  // Published 페이지만 가져오기
  const response = await notion.databases.query({
    database_id: BLOG_DB_ID,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [{ property: '날짜', direction: 'descending' }],
  });

  const pages = response.results;
  console.log(`📄 Published 글: ${pages.length}개\n`);

  // 기존 synced 글 삭제 후 재생성
  await fs.rm(path.join(CONTENT_DIR, '_notion'), { recursive: true, force: true });

  let synced = 0;
  const syncedSlugs = new Set();

  for (const page of pages) {
    const title = getProperty(page, '제목', 'title');
    if (!title) continue;

    const category = getProperty(page, '카테고리', 'select') || 'posts';
    const tags = getProperty(page, '태그', 'multi_select');
    const date = getProperty(page, '날짜', 'date') || page.created_time.split('T')[0];

    let slug = slugify(title);
    // 중복 슬러그 방지
    if (syncedSlugs.has(slug)) slug = `${slug}-${page.id.slice(0, 4)}`;
    syncedSlugs.add(slug);

    // 페이지 내용 → 마크다운 변환
    let mdContent = '';
    try {
      const blocks = await n2m.pageToMarkdown(page.id);
      mdContent = n2m.toMarkdownString(blocks).parent || '';
    } catch (err) {
      console.warn(`  ⚠️  내용 변환 실패: ${title} — ${err.message}`);
    }

    // 내용 없으면 스킵
    if (!mdContent.trim()) {
      console.log(`  ⏭️  건너뜀 (내용 없음): ${title}`);
      continue;
    }

    // category별 폴더 구조
    const categoryDir = category.toLowerCase();
    const dir = path.join(CONTENT_DIR, categoryDir, slug);
    await fs.mkdir(dir, { recursive: true });

    const tagsYaml = tags.length
      ? `tags: [${tags.map(t => `"${t}"`).join(', ')}]\n`
      : '';

    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
lastmod: ${page.last_edited_time.split('T')[0]}
categories: ["${category}"]
${tagsYaml}draft: false
---

`;

    await fs.writeFile(path.join(dir, 'index.md'), frontmatter + mdContent);
    console.log(`  ✅ ${category} / ${title}`);
    synced++;
  }

  console.log(`\n✨ 완료: ${synced}개 동기화`);
}

sync().catch(err => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});

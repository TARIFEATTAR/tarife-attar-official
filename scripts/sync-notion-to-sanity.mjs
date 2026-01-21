#!/usr/bin/env node
/**
 * Sync Notion database entries into Sanity as `journalEntry` and/or `fieldJournal`.
 *
 * Why this exists:
 * - Website renders editorial content from Sanity already.
 * - Notion is the writing surface; this script imports/updates content in Sanity.
 *
 * Required env vars:
 * - NOTION_TOKEN: Notion internal integration token
 * - NOTION_JOURNAL_DB_ID: Notion database id for Journal posts (optional if using only field journal)
 * - NOTION_FIELD_JOURNAL_DB_ID: Notion database id for Field Journal posts (optional)
 * - SANITY_WRITE_TOKEN: Sanity write token
 * - NEXT_PUBLIC_SANITY_PROJECT_ID (optional; defaults to 8h5l91ut)
 * - NEXT_PUBLIC_SANITY_DATASET (optional; defaults to production)
 *
 * Recommended Notion properties per page:
 * - Title (title)
 * - Slug (rich_text or text)
 * - Status (status): Draft | Ready | Published | Archived
 * - Publish to Site (checkbox)
 * - Published At (date)
 * - Excerpt (rich_text)
 * - Category (select)
 * - Territory (select) [journalEntry] or Expedition Territory (select) [fieldJournal]
 * - Cover Image (files)
 */
import { Client as NotionClient } from '@notionhq/client';
import { createClient as createSanityClient } from '@sanity/client';
import crypto from 'crypto';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8h5l91ut';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const notionToken = process.env.NOTION_TOKEN;
const notionJournalDbId = process.env.NOTION_JOURNAL_DB_ID;
const notionFieldJournalDbId = process.env.NOTION_FIELD_JOURNAL_DB_ID;
const sanityToken = process.env.SANITY_WRITE_TOKEN;

if (!notionToken) {
  console.error('❌ NOTION_TOKEN is required');
  process.exit(1);
}
if (!sanityToken) {
  console.error('❌ SANITY_WRITE_TOKEN is required');
  process.exit(1);
}
if (!notionJournalDbId && !notionFieldJournalDbId) {
  console.error('❌ Provide NOTION_JOURNAL_DB_ID and/or NOTION_FIELD_JOURNAL_DB_ID');
  process.exit(1);
}

const notion = new NotionClient({ auth: notionToken });
const sanity = createSanityClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-12-31',
  token: sanityToken,
  useCdn: false,
});

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function getPlainText(richTextArr) {
  if (!Array.isArray(richTextArr)) return '';
  return richTextArr.map((t) => t?.plain_text || '').join('').trim();
}

function pickProp(properties, name) {
  return properties?.[name];
}

function readNotionTitle(properties) {
  const titleProp = Object.values(properties || {}).find((p) => p?.type === 'title');
  if (!titleProp) return '';
  return getPlainText(titleProp.title);
}

function readNotionText(properties, propName) {
  const prop = pickProp(properties, propName);
  if (!prop) return '';
  if (prop.type === 'rich_text') return getPlainText(prop.rich_text);
  if (prop.type === 'title') return getPlainText(prop.title);
  if (prop.type === 'select') return prop.select?.value || prop.select?.name || '';
  if (prop.type === 'status') return prop.status?.name || '';
  if (prop.type === 'checkbox') return prop.checkbox ? 'true' : 'false';
  return '';
}

function readNotionSelect(properties, propName) {
  const prop = pickProp(properties, propName);
  if (!prop) return undefined;
  if (prop.type === 'select') return prop.select?.name;
  if (prop.type === 'status') return prop.status?.name;
  return undefined;
}

function readNotionCheckbox(properties, propName) {
  const prop = pickProp(properties, propName);
  if (!prop) return false;
  if (prop.type === 'checkbox') return !!prop.checkbox;
  return false;
}

function readNotionDate(properties, propName) {
  const prop = pickProp(properties, propName);
  if (!prop) return undefined;
  if (prop.type !== 'date') return undefined;
  return prop.date?.start || undefined;
}

function readNotionFiles(properties, propName) {
  const prop = pickProp(properties, propName);
  if (!prop) return [];
  if (prop.type !== 'files') return [];
  return prop.files || [];
}

function sha1(input) {
  return crypto.createHash('sha1').update(String(input)).digest('hex');
}

function buildStableDocId(type, notionPageId) {
  // Sanity document ids must be <= 128 chars; keep it deterministic.
  return `${type}-notion-${sha1(notionPageId).slice(0, 24)}`;
}

async function fetchAllDatabasePages(databaseId) {
  let cursor = undefined;
  const pages = [];
  while (true) {
    const resp = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...(resp.results || []));
    if (!resp.has_more) break;
    cursor = resp.next_cursor;
  }
  return pages;
}

async function fetchBlockChildren(blockId) {
  let cursor = undefined;
  const blocks = [];
  while (true) {
    const resp = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(resp.results || []));
    if (!resp.has_more) break;
    cursor = resp.next_cursor;
  }
  return blocks;
}

function toPortableTextSpanFromRichText(richTextArr) {
  // Minimal conversion: text + strong/em.
  const spans = [];
  for (const rt of richTextArr || []) {
    const text = rt?.plain_text ?? '';
    const annotations = rt?.annotations || {};
    const marks = [];
    if (annotations.bold) marks.push('strong');
    if (annotations.italic) marks.push('em');
    spans.push({
      _type: 'span',
      _key: crypto.randomUUID(),
      text,
      marks,
    });
  }
  if (spans.length === 0) {
    spans.push({
      _type: 'span',
      _key: crypto.randomUUID(),
      text: '',
      marks: [],
    });
  }
  return spans;
}

function portableTextBlock({ style = 'normal', children, listItem, level }) {
  const block = {
    _type: 'block',
    _key: crypto.randomUUID(),
    style,
    children,
    markDefs: [],
  };
  if (listItem) block.listItem = listItem;
  if (typeof level === 'number') block.level = level;
  return block;
}

async function uploadImageFromUrlToSanity(url, filenameHint = 'notion-image') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get('content-type') || 'application/octet-stream';

  const ext =
    contentType.includes('png') ? 'png' :
    contentType.includes('jpeg') ? 'jpg' :
    contentType.includes('webp') ? 'webp' :
    contentType.includes('gif') ? 'gif' :
    'img';

  const filename = `${slugify(filenameHint) || 'image'}.${ext}`;
  return await sanity.assets.upload('image', buffer, { filename, contentType });
}

async function notionBlocksToPortableText(blocks) {
  const out = [];
  for (const block of blocks || []) {
    if (!block || block.archived) continue;
    const type = block.type;
    const data = block[type];

    if (type === 'paragraph') {
      out.push(portableTextBlock({ style: 'normal', children: toPortableTextSpanFromRichText(data?.rich_text) }));
      continue;
    }

    if (type === 'heading_1') {
      out.push(portableTextBlock({ style: 'h2', children: toPortableTextSpanFromRichText(data?.rich_text) }));
      continue;
    }
    if (type === 'heading_2') {
      out.push(portableTextBlock({ style: 'h2', children: toPortableTextSpanFromRichText(data?.rich_text) }));
      continue;
    }
    if (type === 'heading_3') {
      out.push(portableTextBlock({ style: 'h3', children: toPortableTextSpanFromRichText(data?.rich_text) }));
      continue;
    }

    if (type === 'quote') {
      out.push(portableTextBlock({ style: 'blockquote', children: toPortableTextSpanFromRichText(data?.rich_text) }));
      continue;
    }

    if (type === 'bulleted_list_item') {
      out.push(portableTextBlock({ style: 'normal', listItem: 'bullet', level: 1, children: toPortableTextSpanFromRichText(data?.rich_text) }));
      continue;
    }
    if (type === 'numbered_list_item') {
      out.push(portableTextBlock({ style: 'normal', listItem: 'number', level: 1, children: toPortableTextSpanFromRichText(data?.rich_text) }));
      continue;
    }

    if (type === 'image') {
      const file = data?.file || data?.external;
      const imageUrl = file?.url;
      if (!imageUrl) continue;
      try {
        const asset = await uploadImageFromUrlToSanity(imageUrl, 'notion');
        out.push({
          _type: 'image',
          _key: crypto.randomUUID(),
          asset: { _type: 'reference', _ref: asset._id },
          alt: '',
          caption: '',
        });
      } catch (e) {
        console.warn(`⚠️  Could not import image block ${block.id}: ${e.message}`);
      }
      continue;
    }

    // Unsupported blocks: skip for now to avoid breaking rendering.
  }
  return out;
}

async function buildSanityDocFromNotionPage({ page, targetType }) {
  const props = page.properties || {};

  const title = readNotionTitle(props);
  const explicitSlug = readNotionText(props, 'Slug');
  const excerpt = readNotionText(props, 'Excerpt');
  const status = readNotionSelect(props, 'Status') || 'Draft';
  const publishToSite = readNotionCheckbox(props, 'Publish to Site');
  const publishedAt = readNotionDate(props, 'Published At') || page.created_time;

  const category = readNotionSelect(props, 'Category');
  const territory = readNotionSelect(props, 'Territory') || readNotionSelect(props, 'Expedition Territory');
  const author = readNotionText(props, 'Author') || 'Tarife Attär';

  const coverFiles = readNotionFiles(props, 'Cover Image');
  let coverImage = undefined;
  if (coverFiles.length > 0) {
    const f = coverFiles[0];
    const url = f?.file?.url || f?.external?.url;
    if (url) {
      try {
        const asset = await uploadImageFromUrlToSanity(url, `${title || 'cover'}-cover`);
        coverImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: title || '',
        };
      } catch (e) {
        console.warn(`⚠️  Could not import cover image for "${title}": ${e.message}`);
      }
    }
  }

  const blocks = await fetchBlockChildren(page.id);
  const portable = await notionBlocksToPortableText(blocks);

  const slugVal = slugify(explicitSlug || title);
  const baseDoc = {
    _id: buildStableDocId(targetType, page.id),
    _type: targetType,
    title,
    slug: { _type: 'slug', current: slugVal },
    excerpt: excerpt || undefined,
    author,
    publishedAt,
    generationSource: 'notion',
    notionPageId: page.id,
    notionUrl: page.url,
    notionLastEditedAt: page.last_edited_time,
  };

  const isPublished = publishToSite && (status === 'Ready' || status === 'Published');
  const isArchived = status === 'Archived';

  if (targetType === 'journalEntry') {
    return {
      doc: {
        ...baseDoc,
        category: category || undefined,
        territory: territory || undefined,
        seoDescription: readNotionText(props, 'SEO Description') || undefined,
        featured: readNotionCheckbox(props, 'Featured'),
        coverImage,
        content: portable,
      },
      isPublished,
      isArchived,
    };
  }

  // fieldJournal
  return {
    doc: {
      ...baseDoc,
      subtitle: readNotionText(props, 'Subtitle') || undefined,
      category: category || undefined,
      coverImage,
      body: portable,
      expeditionData: territory
        ? { _type: 'object', territory }
        : undefined,
      seo: {
        _type: 'object',
        metaTitle: readNotionText(props, 'Meta Title') || undefined,
        metaDescription: readNotionText(props, 'SEO Description') || undefined,
        canonicalUrl: readNotionText(props, 'Canonical URL') || undefined,
      },
    },
    isPublished,
    isArchived,
  };
}

async function upsertDoc({ doc, isPublished, isArchived }) {
  if (!doc.title || !doc.slug?.current) {
    console.warn(`⚠️  Skipping: missing title/slug for doc ${doc._id}`);
    return;
  }

  await sanity.createOrReplace(doc);

  if (isArchived) {
    console.log(`🗄️  Archived (kept as doc): ${doc._type} "${doc.title}" (${doc.slug.current})`);
    return;
  }

  if (isPublished) {
    // publish by creating/updating the published doc id (strip drafts. prefix)
    // createOrReplace already wrote the published id. Nothing else required.
    console.log(`✅ Published: ${doc._type} "${doc.title}" -> /${doc._type === 'fieldJournal' ? 'field-journal' : 'journal'}/${doc.slug.current}`);
  } else {
    console.log(`📝 Draft/Not published: ${doc._type} "${doc.title}" (${doc.slug.current})`);
  }
}

async function syncDatabase({ databaseId, targetType }) {
  console.log(`\n=== Sync Notion DB -> Sanity (${targetType}) ===`);
  const pages = await fetchAllDatabasePages(databaseId);
  console.log(`Found ${pages.length} pages`);

  for (const page of pages) {
    try {
      const { doc, isPublished, isArchived } = await buildSanityDocFromNotionPage({ page, targetType });
      await upsertDoc({ doc, isPublished, isArchived });
    } catch (e) {
      console.warn(`❌ Failed syncing page ${page?.id}: ${e.message}`);
    }
  }
}

async function main() {
  if (notionJournalDbId) {
    await syncDatabase({ databaseId: notionJournalDbId, targetType: 'journalEntry' });
  }
  if (notionFieldJournalDbId) {
    await syncDatabase({ databaseId: notionFieldJournalDbId, targetType: 'fieldJournal' });
  }
  console.log('\nDone.');
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});


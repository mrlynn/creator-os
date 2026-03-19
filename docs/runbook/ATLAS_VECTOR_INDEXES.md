# Atlas Vector Search Indexes

This runbook documents how to create MongoDB Atlas Vector Search indexes for semantic search in Creator OS.

## Prerequisites

- **MongoDB Atlas** M10+ cluster (Vector Search requires dedicated cluster tier)
- **MongoDB** v6.0.11+ or v7.0.2+
- **Voyage (cloud):** `VOYAGE_API_KEY` in `.env`
- **Ollama (local):** Ollama running with `ollama pull nomic-embed-text`

## Embedding Models & Dimensions

| Provider | Model | Dimensions | Notes |
|----------|-------|------------|-------|
| Voyage AI | voyage-4-large, voyage-4, voyage-4-lite, voyage-4-nano | 1024 (default) | [Voyage 4 series](https://blog.voyageai.com/2026/01/15/new-models-and-expanded-availability/) - shared embedding space |
| Ollama | nomic-embed-text | 768 | Local embeddings; requires separate 768-dim indexes |

## Index Creation Steps

1. In Atlas: **Database** → **Browse Collections**
2. Select your database and collection
3. Go to **Search Indexes** tab → **Create Index**
4. Choose **JSON Editor**
5. Paste the index definition below for that collection
6. Click **Create Search Index**
7. Wait for index to build (can take several minutes)

## Index Definitions

### contentideas — index name: `content_vector_index`

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "status" },
    { "type": "filter", "path": "platform" },
    { "type": "filter", "path": "audience" }
  ]
}
```

### episodes — index name: `episode_vector_index`

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "publishingStatus" },
    { "type": "filter", "path": "editingStatus" }
  ]
}
```

### scripts — index name: `script_vector_index`

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "status" }
  ]
}
```

## Notes

- **Index build time:** Indexes can take several minutes to build. Check status in Atlas Search Indexes tab.
- **Embedding population:** Documents need embeddings populated via the embed API (`POST /api/ideas/[id]/embed`, `POST /api/scripts/[id]/embed`, `POST /api/episodes/[id]/embed`) before they appear in semantic search results.
- **Voyage:** Set `VOYAGE_API_KEY` in `.env` for cloud embeddings.
- **Ollama:** Run `ollama pull nomic-embed-text` and use 768-dim indexes (see below).

### Ollama (768 dimensions)

If using Ollama with `nomic-embed-text`, create indexes with `numDimensions: 768` and these **index names** (required for the app to find them):

- `content_vector_index_768` (contentideas collection)
- `episode_vector_index_768` (episodes collection)
- `script_vector_index_768` (scripts collection)

Example for contentideas:

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" },
    { "type": "filter", "path": "status" },
    { "type": "filter", "path": "platform" },
    { "type": "filter", "path": "audience" }
  ]
}
```

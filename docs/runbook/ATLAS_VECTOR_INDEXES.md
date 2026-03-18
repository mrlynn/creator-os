# Atlas Vector Search Indexes

This runbook documents how to create MongoDB Atlas Vector Search indexes for semantic search in Creator OS.

## Prerequisites

- **MongoDB Atlas** M10+ cluster (Vector Search requires dedicated cluster tier)
- **MongoDB** v6.0.11+ or v7.0.2+
- **VOYAGE_API_KEY** in `.env` (already in `.env.example`)

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
- **VOYAGE_API_KEY:** Required for embedding generation. Ensure it is set in your environment.

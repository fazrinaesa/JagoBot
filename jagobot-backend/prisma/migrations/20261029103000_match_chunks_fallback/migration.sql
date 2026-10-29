-- Fallback pencarian chunk tanpa pgvector.
-- Signature sama dengan versi vektor, sehingga query aplikasi tidak berubah.
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding TEXT,
    match_threshold FLOAT8,
    match_count INT,
    target_kb_id BIGINT
)
RETURNS TABLE (content TEXT, similarity FLOAT8)
LANGUAGE SQL
STABLE
AS $$
    SELECT dc."content",
           CASE
               WHEN dc."embedding" IS NULL THEN 0::FLOAT8
               ELSE 1::FLOAT8
           END AS similarity
    FROM "DocumentChunk" dc
    WHERE dc."knowledgeBaseId" = target_kb_id::INT
    ORDER BY dc."id"
    LIMIT GREATEST(match_count, 0);
$$;

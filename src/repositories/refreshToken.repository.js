const createSession = async (
    client,
    userId,
    tokenHash,
    expiresAt
) => {
    const result = await client.query(
        `
        INSERT INTO refresh_tokens (
            user_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        RETURNING id, user_id, expires_at, created_at
        `,
        [userId, tokenHash, expiresAt]
    );

    return result.rows[0];
};

const findSessionByTokenHash = async (tokenHash) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            token_hash,
            expires_at,
            revoked_at
        FROM refresh_tokens
        WHERE token_hash = $1
        `,
        [tokenHash]
    );

    return result.rows[0];
};

const findSessionForUpdate = async (
    client,
    tokenHash
) => {
    const result = await client.query(
        `
        SELECT
            id,
            user_id,
            token_hash,
            expires_at,
            revoked_at
        FROM refresh_tokens
        WHERE token_hash = $1
        FOR UPDATE
        `,
        [tokenHash]
    );

    return result.rows[0];
};

const revokeSession = async (client, sessionId) => {
    const result = await client.query(
        `
        UPDATE refresh_tokens
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, revoked_at
        `,
        [sessionId]
    );

    return result.rows[0];
};

module.exports = {
    createSession,
    findSessionByTokenHash,
    revokeSession,
    findSessionForUpdate
};
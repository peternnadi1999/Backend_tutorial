const createActivity = async (
    client,
    userId,
    postId,
    action
) => {
    const result = await client.query(
        `INSERT INTO activities (user_id, post_id, action)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, postId, action]
    );

    return result.rows[0];
};

module.exports = {
    createActivity,
};
const pool = require("../db/pool");


const getActivities = async (userId, isAdmin) => {
    let query;
    let values = [];

    if (isAdmin) {
        query = `
            SELECT
                activities.id,
                activities.action,
                activities.user_id,
                users.name AS user_name,

                activities.post_id,
                posts.title AS post_title,

                activities.order_id,
                orders.total_price AS order_total,

                activities.created_at

            FROM activities

            JOIN users
                ON activities.user_id = users.id

            LEFT JOIN posts
                ON activities.post_id = posts.id

            LEFT JOIN orders
                ON activities.order_id = orders.id

            ORDER BY activities.created_at DESC
        `;
    } else {
        query = `
            SELECT
                activities.id,
                activities.action,
                activities.user_id,
                users.name AS user_name,

                activities.post_id,
                posts.title AS post_title,

                activities.order_id,
                orders.total_price AS order_total,

                activities.created_at

            FROM activities

            JOIN users
                ON activities.user_id = users.id

            LEFT JOIN posts
                ON activities.post_id = posts.id

            LEFT JOIN orders
                ON activities.order_id = orders.id

            WHERE activities.user_id = $1

            ORDER BY activities.created_at DESC
        `;

        values = [userId];
    }

    const result = await pool.query(query, values);

    return result.rows;
};


const getUserActivities = async (userId, limit, cursor) => {
    const values = [userId];

    let query = `
        SELECT
            id,
            user_id,
            action,
            post_id,
            order_id,
            created_at
        FROM activities
        WHERE user_id = $1
    `;

    if (cursor) {
        query += `
            AND (created_at, id) < ($2, $3)
        `;

        values.push(cursor.createdAt);
        values.push(cursor.id);
    }

    const limitParameter = values.length + 1;

    query += `
        ORDER BY created_at DESC, id DESC
        LIMIT $${limitParameter}
    `;

    values.push(limit + 1);

    const result = await pool.query(query, values);

    return result.rows;
};


const createActivity = async (
    client,
    userId,
    action,
    postId = null,
    orderId = null
) => {
    const result = await client.query(
        `INSERT INTO activities
            (user_id, action, post_id, order_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, action, postId, orderId]
    );

    return result.rows[0];
};


module.exports = {
    getActivities,
    getUserActivities,
    createActivity,
};
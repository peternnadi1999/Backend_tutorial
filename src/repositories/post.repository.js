const pool = require("../db/pool");

const getPostById = async (postId) => {
	const result = await pool.query(
		`SELECT posts.id,
    posts.title,
    posts.content,
    posts.user_id,
     users.name AS author_name, users.email AS author_email FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1`,
		[postId],
	);
	return result.rows[0];
};

const getPostByIdForUpdate = async (client, postId) => {
	const result = await client.query(
		`SELECT
            id,
            title,
            content,
            user_id
         FROM posts
         WHERE id = $1
         FOR UPDATE`,
		[postId],
	);

	return result.rows[0];
};

const createPost = async (client, title, content, userId) => {
	const result = await client.query(
		`INSERT INTO posts (title, content, user_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
		[title, content, userId],
	);

	return result.rows[0];
};


const updatePost = async (client, postId, title, content) => {
    const fields = [];
    const values = [];

    if (title !== undefined) {
        fields.push(`title = $${values.length + 1}`);
        values.push(title.trim());
    }

    if (content !== undefined) {
        fields.push(`content = $${values.length + 1}`);
        values.push(content.trim());
    }

    const idParameter = values.length + 1;
    values.push(postId);

    const result = await client.query(
        `UPDATE posts
         SET ${fields.join(", ")}
         WHERE id = $${idParameter}
         RETURNING id, title, content, user_id`,
        values
    );

    return result.rows[0];
};


const deletePost = async (client, postId) => {
	const deleteResult = await client.query(
		`DELETE FROM posts
     WHERE id = $1
     RETURNING id, title, content, user_id`,
		[postId],
	);

	return deleteResult.rows[0];
};

module.exports = {
	getPostById,
    updatePost, 
	createPost,
    getPostByIdForUpdate,
	deletePost,
};

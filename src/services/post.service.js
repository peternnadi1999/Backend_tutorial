const pool = require("../db/pool");
const activityService = require("./activity.service");


const getPosts = async () => {
	const result = await pool.query(`
        SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.user_id,
            users.name AS author_name,
            users.email AS author_email
        FROM posts
        JOIN users
            ON posts.user_id = users.id
        ORDER BY posts.id DESC
    `);

	return result.rows;
};

const getPostById = async (postId) => {
	const result = await pool.query(
		`SELECT posts.id,
    posts.title,
    posts.content,
    posts.user_id,
     users.name AS author_name, users.email AS author_email FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1`,
		[postId],
	);

    if (!result.rows[0]) {
        throw new AppError("Post not found", 404);
    }

	return result.rows[0];
};

const createPost = async (title, content, userId) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		const postResult = await client.query(
			`INSERT INTO posts (title, content, user_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
			[title, content, userId],
		);

		const post = postResult.rows[0];

		await activityService.createActivity(
            client,
            userId,
            "created_post",
            post.id
        );

		await client.query("COMMIT");

		return post;
        
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
};

const updatePost = async (postId, title, content, userId) => {
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

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE posts
             SET ${fields.join(", ")}
             WHERE id = $${idParameter}
             RETURNING id, title, content, user_id`,
            values
        );

        const post = result.rows[0];

        if (!post) {
            await client.query("ROLLBACK");
            return null;
        }

        await activityService.createActivity(
            client,
            userId,
            "updated_post",
            post.id
        );

        await client.query("COMMIT");

        return post;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};

const deletePost = async (postId, userId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT id
             FROM posts
             WHERE id = $1
             FOR UPDATE`,
            [postId]
        );

        const post = result.rows[0];

        if (!post) {
            await client.query("ROLLBACK");
            return null;
        }

        await activityService.createActivity(
            client,
            userId,
            "deleted_post",
            post.id
        );

        const deleteResult = await client.query(
            `DELETE FROM posts
             WHERE id = $1
             RETURNING id, title, content, user_id`,
            [postId]
        );

        await client.query("COMMIT");

        return deleteResult.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};

module.exports = {
	createPost,
	getPosts,
	getPostById,
	updatePost,
	deletePost,
};

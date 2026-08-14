const pool = require("../db/pool");
const activityService = require("./activity.service");

const createOrder = async (userId, productId, quantity) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw new Error("Invalid quantity");
		}

		const result = await client.query(
			`SELECT *
         FROM products
         WHERE id = $1
         FOR UPDATE`,
			[productId],
		);

		const product = result.rows[0];

		if (!product) {
			throw new Error("Product not found");
		}

		if (product.stock < quantity) {
			throw new Error("Insufficient stock");
		}

		if (product.stock <= 0) {
			throw new Error("Product out of stock");
		}

		await client.query(
			`UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
			[quantity, productId],
		);

		const orderResult = await client.query(
			`INSERT INTO orders (user_id, total_price)
             VALUES ($1, $2)
             RETURNING *`,
			[userId, product.price * quantity],
		);

		const order = orderResult.rows[0];

         await activityService.createActivity(
            client,
            userId,
            "created_order",
            null,
            order.id
        );
    
		await client.query("COMMIT");

		return order;
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
};

module.exports = {
	createOrder,
};

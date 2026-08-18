const encodeCursor = (cursor) => {
    return Buffer
        .from(JSON.stringify(cursor))
        .toString("base64url");
};

const decodeCursor = (cursor) => {
    return JSON.parse(
        Buffer
            .from(cursor, "base64url")
            .toString("utf-8")
    );
};

module.exports = {
    encodeCursor,
    decodeCursor,
};
const pkg = require('pg');
require('dotenv').config();

const { env } = process;

const { Pool } = pkg;

const pool = new Pool({
	user: env.PG_USER,
	password: env.PG_PASSWORD,
	host: env.PG_HOST,
	port: env.PG_PORT,
	database: env.PG_DATABASE,
	ssl: true,
});

module.exports = { db: pool };

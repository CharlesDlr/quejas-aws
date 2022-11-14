const Pool = require ("pg").Pool
const pool = new Pool({
    user: "postgres",
    password: "admin",
    host: "database-1.cpbora9gtec8.us-east-1.rds.amazonaws.com",
    port: 5432,
    database: "quejasvl"
});

module.exports = pool;
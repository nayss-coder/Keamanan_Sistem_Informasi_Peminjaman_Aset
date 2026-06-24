import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'sialat',
  password: process.env.DB_PASSWORD || 'sialat123',
  database: process.env.DB_NAME     || 'si_alat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query<T = unknown>(sql: string, values?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, values)
  return rows as T
}

export default pool

import { ConflictError } from "../../shared/errors.js";

const SELECT = `
  SELECT g.id, g.name, g.subtitle, g.description, g.style, g.price, g.sort_order, g.active,
         COALESCE(
           json_agg(json_build_object('id', c.id, 'name', c.name, 'hex', c.hex, 'model_url', c.model_url)
                    ORDER BY c.sort_order) FILTER (WHERE c.id IS NOT NULL),
           '[]'::json) AS colors
    FROM glasses g
    LEFT JOIN glasses_colors c ON c.glasses_id = g.id`;

async function insertColors(client, glasses) {
  for (const [index, color] of glasses.colors.entries()) {
    await client.query(
      `INSERT INTO glasses_colors (glasses_id, id, name, hex, model_url, sort_order) VALUES ($1, $2, $3, $4, $5, $6)`,
      [glasses.id, color.id, color.name, color.hex, color.model_url, index]
    );
  }
}

async function inTransaction(pool, work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// PostgreSQL implementation of the same interface as the memory repository.
export function createPgGlassesRepository(pool) {
  return {
    async list({ includeInactive = false } = {}) {
      const { rows } = await pool.query(
        `${SELECT} ${includeInactive ? "" : "WHERE g.active"} GROUP BY g.id ORDER BY g.sort_order, g.name`
      );
      return rows;
    },

    async get(id) {
      const { rows } = await pool.query(`${SELECT} WHERE g.id = $1 GROUP BY g.id`, [id]);
      return rows[0] ?? null;
    },

    async insert(glasses) {
      try {
        await inTransaction(pool, async (client) => {
          await client.query(
            `INSERT INTO glasses (id, name, subtitle, description, style, price, sort_order, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [glasses.id, glasses.name, glasses.subtitle, glasses.description, glasses.style, glasses.price, glasses.sort_order, glasses.active]
          );
          await insertColors(client, glasses);
        });
      } catch (error) {
        if (error.code === "23505") throw new ConflictError(`Glasses "${glasses.id}" already exists`);
        throw error;
      }
    },

    async update(glasses) {
      return inTransaction(pool, async (client) => {
        const result = await client.query(
          `UPDATE glasses
              SET name = $2, subtitle = $3, description = $4, style = $5, price = $6,
                  sort_order = $7, active = $8, updated_at = NOW()
            WHERE id = $1`,
          [glasses.id, glasses.name, glasses.subtitle, glasses.description, glasses.style, glasses.price, glasses.sort_order, glasses.active]
        );
        if (result.rowCount === 0) return false;
        await client.query("DELETE FROM glasses_colors WHERE glasses_id = $1", [glasses.id]);
        await insertColors(client, glasses);
        return true;
      });
    },

    async remove(id) {
      const result = await pool.query("DELETE FROM glasses WHERE id = $1", [id]);
      return result.rowCount > 0;
    },
  };
}

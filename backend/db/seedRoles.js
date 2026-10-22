const pool = require('./connection');

async function seed() {
  try {
    await pool.execute(`
      INSERT INTO users (username, password, role, name, email, estado, created_at)
      VALUES 
      ('almacen', 'almacen123', 'almacen', 'Juan Almacén', 'almacen@sipgimed.com', 'Activo', '2024-03-01'),
      ('logistica', 'logistica123', 'logistica', 'Pedro Logística', 'logistica@sipgimed.com', 'Activo', '2024-03-01')
      ON DUPLICATE KEY UPDATE role = VALUES(role);
    `);
    console.log("Usuarios almacen y logistica insertados");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
seed();

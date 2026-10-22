require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

const csvFilePath = path.join(__dirname, '../../dataset_farmacia_limpio.csv');

const cfg = process.env.JAWSDB_URL || {
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sipgimed'
};

async function migrarDatos() {
  console.log("Iniciando migración de datos desde el Excel (CSV) a la Base de Datos...");
  const conn = await mysql.createConnection(cfg);
  
  // 1. Limpiar tabla de medicamentos
  await conn.execute('DELETE FROM medicamentos');
  console.log("✅ Tabla medicamentos purgada.");
  
  // 2. Extraer productos únicos del CSV
  const productosUnicos = new Map();
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // row contiene: id_producto, descripcion, fecha, stock_actual, origen, cantidad_vendida
        if (!productosUnicos.has(row.id_producto)) {
            // Guardamos el medicamento. Para los laboratorios, lotes y r_sanitario usaremos strings genéricos
            // ya que no vienen en el dataset limpio.
            productosUnicos.set(row.id_producto, {
                codigo: row.id_producto,
                nombre: row.descripcion,
                stock: parseInt(parseFloat(row.stock_actual)) || 0,
            });
        }
      })
      .on('end', () => {
        console.log(`✅ Procesamiento CSV completado. Encontrados ${productosUnicos.size} medicamentos únicos.`);
        resolve();
      })
      .on('error', reject);
  });
  
  // 3. Insertar a la base de datos
  const query = `
    INSERT INTO medicamentos 
    (codigo, nombre, laboratorio, lote, stock, stock_min, costo_unit, precio_venta, vencimiento, r_sanitario, estado, categoria) 
    VALUES (?, ?, 'Lab Genérico', 'LOTE-IA', ?, 50, 1.00, 2.50, '2026-12-31', 'RS-IA-2026', 'Normal', 'General')
  `;
  
  let insertados = 0;
  for (const [id, med] of productosUnicos.entries()) {
      try {
          await conn.execute(query, [med.codigo, med.nombre, med.stock]);
          insertados++;
      } catch (err) {
          console.error(`Error insertando ${med.codigo}:`, err.message);
      }
  }
  
  console.log(`✅ Migración Finalizada: ${insertados} medicamentos reales insertados en la BD.`);
  await conn.end();
}

migrarDatos().catch(err => {
    console.error("❌ Ocurrió un error en la migración:", err);
});

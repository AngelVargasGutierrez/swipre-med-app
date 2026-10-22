const pool = require('../db/connection');

function diasRestantes(dateObj) {
  if (!dateObj) return 9999;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateObj);
  target.setHours(0, 0, 0, 0);

  return Math.round((target - today) / 86400000);
}

function formatFecha(dateObj) {
  if (!dateObj) return 'N/A';
  const d = new Date(dateObj);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
}

async function generarAlertas() {
  try {
    const [medicamentos] = await pool.execute('SELECT * FROM medicamentos');
    
    const nuevasAlertas = [];
    const fechaActualStr = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' });

    for (const med of medicamentos) {
      if (med.estado === 'Crítico') {
        nuevasAlertas.push({
          tipo: 'stock-critico',
          titulo: 'Stock Crítico',
          descripcion: `${med.nombre} tiene stock crítico (${med.stock} unidades)`,
          fecha: fechaActualStr,
          color: 'red',
          prioridad: 'High'
        });
      } else if (med.estado === 'Bajo') {
        nuevasAlertas.push({
          tipo: 'stock-bajo',
          titulo: 'Stock Bajo',
          descripcion: `${med.nombre} tiene stock bajo (${med.stock} unidades). Mínimo requerido: ${med.stock_min}.`,
          fecha: fechaActualStr,
          color: 'yellow',
          prioridad: 'High'
        });
      }

      const dias = diasRestantes(med.vencimiento);
      const fVenc = formatFecha(med.vencimiento);
      if (dias < 0) {
        nuevasAlertas.push({
          tipo: 'vencimiento',
          titulo: 'Medicamento Vencido',
          descripcion: `${med.nombre} ha vencido el ${fVenc}. Lote: ${med.lote}`,
          fecha: fechaActualStr,
          color: 'red',
          prioridad: 'High'
        });
      } else if (dias <= 90) {
        nuevasAlertas.push({
          tipo: 'vencimiento',
          titulo: 'Medicamento por Vencer',
          descripcion: `${med.nombre} vence en ${dias} días (${fVenc}). Lote: ${med.lote}`,
          fecha: fechaActualStr,
          color: dias <= 30 ? 'red' : 'yellow',
          prioridad: 'High'
        });
      }
    }

    // 3. Limpiar alertas antiguas automáticas (solo las no leídas, para no acumular basura)
    // Se asume que las generadas por el sistema de los tipos abajo mencionados son efímeras si no se leen.
    await pool.execute(`
      DELETE FROM notificaciones 
      WHERE leida = 0 
      AND tipo IN ('stock-critico', 'stock-bajo', 'vencimiento')
    `);

    // 4. Insertar las nuevas alertas
    if (nuevasAlertas.length > 0) {
      for (const alerta of nuevasAlertas) {
        await pool.execute(`
          INSERT INTO notificaciones (tipo, titulo, descripcion, fecha, color, leida, prioridad)
          VALUES (?, ?, ?, ?, ?, 0, ?)
        `, [alerta.tipo, alerta.titulo, alerta.descripcion, alerta.fecha, alerta.color, alerta.prioridad]);
      }
    }

  } catch (error) {
    console.error('Error generando alertas automáticas:', error);
  }
}

module.exports = {
  generarAlertas
};

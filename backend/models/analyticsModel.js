const pool = require('../db/connection');
const axios = require('axios'); // Asegúrate de tener axios instalado

async function getPrediccionDemanda() {
  try {
    // Tomamos 5 medicamentos de la base de datos que tengan un stock moderado
    // (evitamos los de stock muy masivo como guantes, y evitamos nombres vacíos)
    const [medicamentos] = await pool.execute(`
      SELECT id, nombre, stock FROM medicamentos 
      WHERE stock > 2 AND stock < 80 AND nombre IS NOT NULL AND nombre != ''
      LIMIT 5
    `);
    
    const predicciones_ia = [];
    
    for (const med of medicamentos) {
      try {
        // Le enviamos a la IA el stock actual para que lo tome como punto de partida
        // Como no hay meses históricos, el "historial" es su estado de inventario actual
        const historial_ventas = [med.stock]; 
        
        const apiUrl = process.env.IA_API_URL || 'http://localhost:5000/predict';
        const response = await axios.post(apiUrl, {
          id_producto: med.id.toString(),
          historial_ventas: historial_ventas
        });
        
        // La IA predice la demanda futura basada en ese nivel de inventario
        const prediccion_futura = Math.round(response.data.prediccion_proxima_semana);
        
        predicciones_ia.push({
          mes: med.nombre.substring(0, 20) + '...', // El eje X mostrará el nombre del producto
          real: med.stock, // La línea roja será el STOCK ACTUAL REAL de tu BD
          prediccion: prediccion_futura // La línea morada será lo que la IA te sugiere tener
        });
      } catch (error) {
        console.error(`Error consultando a la IA para ${med.nombre}:`, error.message);
        predicciones_ia.push({ mes: med.nombre.substring(0,20), real: med.stock, prediccion: 0 }); 
      }
    }
    
    return predicciones_ia;
  } catch (err) {
    console.error("Fallo general en predicción:", err);
    // Fallback: devolvemos la data mock antigua si algo falla en la DB
    const [rows] = await pool.execute(
      'SELECT mes, real_val AS `real`, prediccion FROM prediccion_demanda ORDER BY id LIMIT 5'
    );
    return rows.map(r => ({ ...r, real: r.real ?? null, prediccion: r.prediccion ?? null }));
  }
}
async function getComparativaMensual() {
  try {
    const [rows] = await pool.execute(
      'SELECT mes, ventas, compras FROM comparativa_mensual ORDER BY id'
    );
    
    // Extraemos todo el historial de ventas para pasarlo a la IA
    const historial_ventas = rows.map(r => r.ventas);
    
    if (historial_ventas.length > 0) {
        // Pedimos predicción global a la IA
        const apiUrl = process.env.IA_API_URL || 'http://localhost:5000/predict';
        const response = await axios.post(apiUrl, {
          id_producto: 'GLOBAL', 
          historial_ventas: historial_ventas
        });
        
        const ia_data = response.data;
        const ventas_predichas = Math.round(ia_data.prediccion_proxima_semana);
        const compras_sugeridas = Math.round(ventas_predichas * 1.20); // 20% de stock de seguridad
        
        // Mes siguiente dinámico
        const meses_del_año = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const mesSiguiente = meses_del_año[(new Date().getMonth() + 1) % 12];
        
        // Inyectamos el nuevo mes pronosticado por la IA al final de la gráfica
        rows.push({
          mes: `${mesSiguiente} (IA)`,
          ventas: ventas_predichas,
          compras: compras_sugeridas
        });
    }
    
    return rows;
  } catch(error) {
      console.error("Error al predecir ventas globales con IA:", error.message);
      // Fallback si la IA falla, devolvemos solo la base de datos sin predicción
      const [rows] = await pool.execute(
        'SELECT mes, ventas, compras FROM comparativa_mensual ORDER BY id'
      );
      return rows;
  }
}

async function getTendencias() {
  const [rows] = await pool.execute(
    'SELECT categoria, cambio, positivo FROM tendencias ORDER BY id'
  );
  return rows.map(r => ({ ...r, positivo: !!r.positivo }));
}

async function getPrediccionesCriticas() {
  const [rows] = await pool.execute(`
    SELECT nombre, stock, stock_min 
    FROM medicamentos 
    WHERE stock > 0 
    ORDER BY (stock / NULLIF(stock_min, 1)) ASC 
    LIMIT 4
  `);

  return rows.map(m => {
    const stock = parseInt(m.stock) || 0;
    const min = parseInt(m.stock_min) || 0;
    
    let prioridad = 'Baja';
    if (stock <= min * 0.5) prioridad = 'Alta';
    else if (stock <= min) prioridad = 'Media';

    // Estimación: si se consumen ~1.2 unidades al día, calculamos cuántos días faltan
    const diasParaQuiebre = Math.max(1, Math.round(stock / 1.2));
    const fechaQuiebre = new Date();
    fechaQuiebre.setDate(fechaQuiebre.getDate() + diasParaQuiebre);
    
    const fmtFecha = `${String(fechaQuiebre.getDate()).padStart(2,'0')}/${String(fechaQuiebre.getMonth()+1).padStart(2,'0')}/${fechaQuiebre.getFullYear()}`;
    
    const ordenar = Math.max(min * 2, 50) - stock;

    return {
      nombre: m.nombre,
      stockActual: stock,
      fechaPredicha: fmtFecha,
      ordenar: ordenar > 0 ? ordenar : 50,
      prioridad: prioridad
    };
  });
}

async function getValorPorCategoria() {
  const [rows] = await pool.execute(`
    SELECT categoria,
      SUM(stock * costo_unit)   AS valor_costo,
      SUM(stock * precio_venta) AS valor_venta
    FROM medicamentos GROUP BY categoria ORDER BY valor_venta DESC
  `);
  return rows.map(r => ({
    categoria:  r.categoria,
    valorCosto: parseFloat(r.valor_costo),
    valorVenta: parseFloat(r.valor_venta),
  }));
}

module.exports = { getPrediccionDemanda, getComparativaMensual, getTendencias, getPrediccionesCriticas, getValorPorCategoria };

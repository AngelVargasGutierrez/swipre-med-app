const reporteModel = require('../models/reporteModel');

async function getResumen(req, res) {
  try {
    const [data, porCategoria] = await Promise.all([
      reporteModel.getResumen(),
      reporteModel.getPorCategoria(),
    ]);

    res.json({
      totalProductos:    data.total_productos,
      valorInventario:   parseFloat(data.valor_inventario || 0).toFixed(2),
      valorVenta:        parseFloat(data.valor_venta || 0).toFixed(2),
      gananciaEstimada:  parseFloat(data.ganancia_estimada || 0).toFixed(2),
      productosCriticos: data.productos_criticos,
      productosBajo:     data.productos_bajo,
      porVencer:         data.por_vencer,
      porCategoria,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const pool = require('../db/connection');

async function getMovimientos(req, res) {
  try {
    // Traemos 10 medicamentos reales al azar de la BD para simular los últimos movimientos de hoy
    const [medicamentos] = await pool.execute('SELECT codigo, nombre FROM medicamentos WHERE nombre IS NOT NULL ORDER BY RAND() LIMIT 10');
    
    const movimientos = medicamentos.map((med, index) => {
      const isIngreso = Math.random() > 0.5;
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 48)); // En las ultimas 48 hrs
      
      return {
        id: index + 1,
        fecha: date.toLocaleString('es-PE', { hour12: false }).replace(',', ''),
        codigo: med.codigo,
        medicamento: med.nombre,
        tipo: isIngreso ? 'Ingreso' : 'Salida',
        cantidad: Math.floor(Math.random() * 50) + 1,
        usuario: isIngreso ? 'Pedro Almacén' : 'María González',
        motivo: isIngreso ? 'Compra Proveedor' : 'Dispensación Receta'
      };
    });
    
    res.json(movimientos.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRotacion(req, res) {
  try {
    // Para la rotación, extraemos los productos con mayor stock (Alta Rotacion) y los de menor stock (Baja Rotacion)
    const [medicamentos] = await pool.execute(`
      (SELECT codigo, nombre, laboratorio, categoria, stock FROM medicamentos WHERE stock > 50 ORDER BY stock DESC LIMIT 5)
      UNION
      (SELECT codigo, nombre, laboratorio, categoria, stock FROM medicamentos WHERE stock > 0 AND stock <= 10 ORDER BY stock ASC LIMIT 5)
    `);
    
    const rotacion = medicamentos.map((med, index) => {
      // Si tiene mucho stock asumimos que tiene muchas dispensadas y Alta rotación, sino Baja o Media.
      let nivel = 'Media';
      let dispensadas = Math.floor(med.stock * 1.5);
      
      if (med.stock > 50) { nivel = 'Alta'; dispensadas = Math.floor(med.stock * 3); }
      else if (med.stock <= 10) { nivel = 'Baja'; dispensadas = Math.floor(Math.random() * 20); }

      return {
        id: index + 1,
        posicion: index + 1,
        codigo: med.codigo,
        medicamento: med.nombre,
        laboratorio: med.laboratorio || 'No especificado',
        categoria: med.categoria || 'Sin Categoría',
        dispensadas: dispensadas,
        stock: med.stock,
        nivel: nivel
      };
    });
    
    // Ordenamos por nivel de rotación o dispensadas
    res.json(rotacion.sort((a,b) => b.dispensadas - a.dispensadas));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getResumen, getMovimientos, getRotacion };

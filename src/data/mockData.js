export const USERS = {
  admin:    { username: 'admin',    password: 'admin123',    role: 'admin',    name: 'Juan Pérez',       roleLabel: 'Administrador' },
  farmacia: { username: 'farmacia', password: 'farmacia123', role: 'farmacia', name: 'María González',   roleLabel: 'Farmacia'      },
  jefatura: { username: 'jefatura', password: 'jefatura123', role: 'jefatura', name: 'Carlos Rodríguez', roleLabel: 'Jefatura'      },
};

export const ROLE_MENUS = {
  admin:    ['dashboard','medicamentos','inventario','notificaciones','reportes','analytics','usuarios'],
  farmacia: ['dashboard','medicamentos'],
  jefatura: ['dashboard','inventario','notificaciones','reportes','analytics'],
};

export const LABORATORIOS = [
  'AllergyPharma','AnalgésicosPro','BioFarma','CardioLab','Cardiopharma',
  'DiabetesCare','Farmacéutica XYZ','GastroLab','Laboratorios ABC',
  'MediLab','NeuroPharma','RespiraLab','TopicalMed',
];

export const CATEGORIAS = [
  'Analgésicos','Antiácidos','Antidiabéticos','Antibióticos','Broncodilatadores',
  'Cardiovascular','Dermatológicos','Antidepresivos','Antihistamínicos',
  'Gastrointestinal','Psicotrópicos',
];

export const MEDICAMENTOS = [
  { id:1,  codigo:'FARM-ANL001', nombre:'Paracetamol 500mg',          laboratorio:'Laboratorios ABC', lote:'PAR-2024-001', stock:1500, stockMin:500, costoUnit:0.50,  precioVenta:1.20,  vencimiento:'30/12/2025', estado:'Normal',  categoria:'Analgésicos',       rSanitario:'RSS-001-2024' },
  { id:2,  codigo:'FARM-ANL002', nombre:'Ibuprofeno 400mg',            laboratorio:'Farmacéutica XYZ', lote:'IBU-2024-005', stock:250,  stockMin:300, costoUnit:0.75,  precioVenta:1.80,  vencimiento:'29/06/2025', estado:'Bajo',    categoria:'Analgésicos',       rSanitario:'RSS-002-2024' },
  { id:3,  codigo:'FARM-ANT001', nombre:'Amoxicilina 500mg',           laboratorio:'BioFarma',         lote:'AMO-2023-012', stock:80,   stockMin:200, costoUnit:1.10,  precioVenta:2.80,  vencimiento:'14/08/2024', estado:'Crítico', categoria:'Antibióticos',      rSanitario:'RSS-003-2024' },
  { id:4,  codigo:'FARM-CAR001', nombre:'Atorvastatina 20mg',          laboratorio:'CardioLab',        lote:'ATO-2024-001', stock:800,  stockMin:100, costoUnit:1.20,  precioVenta:3.50,  vencimiento:'28/02/2027', estado:'Normal',  categoria:'Cardiovascular',    rSanitario:'RSS-004-2024' },
  { id:5,  codigo:'FARM-GAS001', nombre:'Omeprazol 20mg',              laboratorio:'GastroLab',        lote:'OME-2024-002', stock:600,  stockMin:150, costoUnit:0.90,  precioVenta:2.20,  vencimiento:'30/09/2026', estado:'Normal',  categoria:'Antiácidos',        rSanitario:'RSS-005-2024' },
  { id:6,  codigo:'FARM-CAR002', nombre:'Losartán 50mg',               laboratorio:'Cardiopharma',     lote:'LOS-2024-001', stock:450,  stockMin:100, costoUnit:1.50,  precioVenta:4.00,  vencimiento:'31/03/2027', estado:'Normal',  categoria:'Cardiovascular',    rSanitario:'RSS-006-2024' },
  { id:7,  codigo:'FARM-DIA001', nombre:'Metformina 500mg',            laboratorio:'DiabetesCare',     lote:'MET-2024-001', stock:700,  stockMin:200, costoUnit:0.60,  precioVenta:1.50,  vencimiento:'31/12/2026', estado:'Normal',  categoria:'Antidiabéticos',    rSanitario:'RSS-007-2024' },
  { id:8,  codigo:'FARM-RES001', nombre:'Salbutamol 100mcg',           laboratorio:'RespiraLab',       lote:'SAL-2024-002', stock:150,  stockMin:100, costoUnit:3.50,  precioVenta:8.00,  vencimiento:'30/06/2026', estado:'Bajo',    categoria:'Broncodilatadores', rSanitario:'RSS-008-2024' },
  { id:9,  codigo:'FARM-GAS002', nombre:'Ranitidina 150mg',            laboratorio:'GastroLab',        lote:'RAN-2024-001', stock:300,  stockMin:100, costoUnit:0.80,  precioVenta:2.00,  vencimiento:'04/05/2026', estado:'Normal',  categoria:'Antiácidos',        rSanitario:'RSS-009-2024' },
  { id:10, codigo:'FARM-ALL001', nombre:'Loratadina 10mg',             laboratorio:'AllergyPharma',    lote:'LOR-2024-003', stock:400,  stockMin:150, costoUnit:0.45,  precioVenta:1.10,  vencimiento:'28/02/2027', estado:'Normal',  categoria:'Antihistamínicos',  rSanitario:'RSS-010-2024' },
  { id:11, codigo:'FARM-DER001', nombre:'Betametasona Crema 0.1%',     laboratorio:'TopicalMed',       lote:'BET-2024-001', stock:200,  stockMin:50,  costoUnit:2.00,  precioVenta:5.00,  vencimiento:'30/11/2026', estado:'Normal',  categoria:'Dermatológicos',    rSanitario:'RSS-011-2024' },
  { id:12, codigo:'FARM-PSI001', nombre:'Alprazolam 0.5mg',            laboratorio:'NeuroPharma',      lote:'ALP-2024-002', stock:60,   stockMin:100, costoUnit:0.90,  precioVenta:2.50,  vencimiento:'31/07/2025', estado:'Crítico', categoria:'Psicotrópicos',     rSanitario:'RSS-012-2024' },
  { id:13, codigo:'FARM-CAR003', nombre:'Enalapril 10mg',              laboratorio:'CardioLab',        lote:'ENA-2024-001', stock:550,  stockMin:150, costoUnit:0.70,  precioVenta:1.80,  vencimiento:'31/01/2027', estado:'Normal',  categoria:'Cardiovascular',    rSanitario:'RSS-013-2024' },
  { id:14, codigo:'FARM-ANL003', nombre:'Acetaminofén 500mg Jarabe',   laboratorio:'Laboratorios ABC', lote:'ACE-2024-005', stock:320,  stockMin:100, costoUnit:1.80,  precioVenta:4.50,  vencimiento:'30/04/2027', estado:'Normal',  categoria:'Analgésicos',       rSanitario:'RSS-014-2024' },
  { id:15, codigo:'FARM-DIA002', nombre:'Insulina Glargina 100UI/mL',  laboratorio:'DiabetesCare',     lote:'INS-2024-001', stock:50,   stockMin:80,  costoUnit:25.00, precioVenta:60.00, vencimiento:'15/05/2025', estado:'Crítico', categoria:'Antidiabéticos',    rSanitario:'RSS-015-2024' },
  { id:16, codigo:'FARM-ANT002', nombre:'Azitromicina 500mg',          laboratorio:'BioFarma',         lote:'AZI-2024-003', stock:180,  stockMin:100, costoUnit:2.50,  precioVenta:6.00,  vencimiento:'28/02/2027', estado:'Normal',  categoria:'Antibióticos',      rSanitario:'RSS-016-2024' },
  { id:17, codigo:'FARM-GAS003', nombre:'Metoclopramida 10mg',         laboratorio:'GastroLab',        lote:'MTC-2024-002', stock:420,  stockMin:100, costoUnit:0.55,  precioVenta:1.40,  vencimiento:'31/08/2026', estado:'Normal',  categoria:'Gastrointestinal',  rSanitario:'RSS-017-2024' },
  { id:18, codigo:'FARM-NEU001', nombre:'Sertralina 50mg',             laboratorio:'NeuroPharma',      lote:'SER-2024-001', stock:280,  stockMin:100, costoUnit:1.30,  precioVenta:3.20,  vencimiento:'30/06/2027', estado:'Normal',  categoria:'Antidepresivos',    rSanitario:'RSS-018-2024' },
  { id:19, codigo:'FARM-DER002', nombre:'Clotrimazol Crema 1%',        laboratorio:'TopicalMed',       lote:'CLO-2024-002', stock:150,  stockMin:50,  costoUnit:1.50,  precioVenta:3.80,  vencimiento:'30/09/2027', estado:'Normal',  categoria:'Dermatológicos',    rSanitario:'RSS-019-2024' },
  { id:20, codigo:'FARM-ALL002', nombre:'Cetirizina 10mg',             laboratorio:'AllergyPharma',    lote:'CET-2024-001', stock:350,  stockMin:100, costoUnit:0.60,  precioVenta:1.50,  vencimiento:'31/03/2027', estado:'Normal',  categoria:'Antihistamínicos',  rSanitario:'RSS-020-2024' },
];

export const STOCK_POR_CATEGORIA = [
  { name:'Antinflamatorios', value:2370 },
  { name:'Antiácidos',       value:200  },
  { name:'Antidiabéticos',   value:120  },
  { name:'Broncodilatadores',value:800  },
  { name:'Antiinfl. tópicos',value:600  },
  { name:'Antidepresivos',   value:1150 },
  { name:'Cardiovascular',   value:280  },
  { name:'Antibióticos',     value:175  },
];

export const MOVIMIENTOS_SEMANA = [
  { dia:'Lun', entradas:0,  salidas:45 },
  { dia:'Mar', entradas:60, salidas:50 },
  { dia:'Mié', entradas:20, salidas:35 },
  { dia:'Jue', entradas:80, salidas:60 },
  { dia:'Vie', entradas:40, salidas:45 },
  { dia:'Sáb', entradas:10, salidas:25 },
  { dia:'Dom', entradas:0,  salidas:15 },
];

export const TOP5_VALOR = [
  { nombre:'Acetaminofén 500mg J…', valor:1200 },
  { nombre:'Atorvastatina 20mg',    valor:960  },
  { nombre:'Paracetamol 500mg',     valor:750  },
  { nombre:'Omeprazol 20mg',        valor:720  },
  { nombre:'Losartán 50mg',         valor:675  },
];

export const ALERTAS = [
  { id:1, titulo:'Stock Crítico',          desc:'Amoxicilina 500mg tiene stock crítico (80 unidades)',  fecha:'15/4/2026, 8:00:00', color:'red'    },
  { id:2, titulo:'Medicamento por Vencer', desc:'Ranitidina 150mg vence en 10 días',                   fecha:'15/4/2026, 8:00:00', color:'red'    },
  { id:3, titulo:'Stock Bajo',             desc:'Salbutamol 100mcg stock bajo (150 unidades)',          fecha:'15/4/2026, 9:00:00', color:'yellow' },
];

export const NOTIFICACIONES = [
  { id:1, tipo:'stock-critico', titulo:'Stock Crítico',         desc:'Amoxicilina 500mg tiene stock crítico (80 unidades)',                            fecha:'15/4/2026, 8:00:00',  color:'red',   leida:false, prioridad:'High' },
  { id:2, tipo:'vencimiento',   titulo:'Medicamento por Vencer',desc:'Ranitidina 150mg vence en 10 días',                                              fecha:'15/4/2026, 8:00:00',  color:'red',   leida:false, prioridad:'High' },
  { id:3, tipo:'stock-bajo',    titulo:'Stock Bajo',            desc:'Salbutamol 100mcg tiene stock bajo: 150 unidades. Mínimo requerido: 100.',        fecha:'15/4/2026, 9:00:00',  color:'yellow',leida:false, prioridad:'High' },
  { id:4, tipo:'nuevo-lote',    titulo:'Nuevo Lote Registrado', desc:'Se registró el nuevo lote PAR-2024-001 de Paracetamol 500mg con 1500 unidades.', fecha:'14/4/2026',           color:'blue',  leida:true,  prioridad:'Low'  },
  { id:5, tipo:'inventario',    titulo:'Inventario Q1 2026',    desc:'El inventario trimestral Q1 2026 fue completado. 20 medicamentos verificados.',  fecha:'01/4/2026',           color:'green', leida:true,  prioridad:'Low'  },
];

/* ── Analytics data ─────────────────────────────── */
export const PREDICCION_DEMANDA = [
  { mes:'Ene', real:310, prediccion:null },
  { mes:'Feb', real:350, prediccion:null },
  { mes:'Mar', real:440, prediccion:440  },
  { mes:'Abr', real:null, prediccion:455 },
  { mes:'May', real:null, prediccion:462 },
  { mes:'Jun', real:null, prediccion:478 },
];

export const COMPARATIVA_MENSUAL = [
  { mes:'Oct', ventas:1200, compras:1400 },
  { mes:'Nov', ventas:1350, compras:1300 },
  { mes:'Dic', ventas:1400, compras:1600 },
  { mes:'Ene', ventas:900,  compras:1100 },
  { mes:'Feb', ventas:1300, compras:1350 },
  { mes:'Mar', ventas:1450, compras:1500 },
  { mes:'Abr', ventas:1500, compras:1700 },
];

export const TENDENCIAS = [
  { categoria:'Analgésicos',       cambio:+15, positivo:true  },
  { categoria:'Antibióticos',      cambio:-8,  positivo:false },
  { categoria:'Antiinflamatorios', cambio:+22, positivo:true  },
  { categoria:'Antiácidos',        cambio:+5,  positivo:true  },
  { categoria:'Antihipertensivos', cambio:+12, positivo:true  },
];

export const PREDICCIONES_CRITICAS = [
  { id:1, nombre:'Amoxicilina 500mg',  stockActual:80,  fechaPredicha:'9/5/2026',  ordenar:300, prioridad:'Alta'  },
  { id:2, nombre:'Metformina 850mg',   stockActual:180, fechaPredicha:'19/5/2026', ordenar:250, prioridad:'Alta'  },
  { id:3, nombre:'Ibuprofeno 400mg',   stockActual:250, fechaPredicha:'4/6/2026',  ordenar:200, prioridad:'Media' },
];

/* ── Users management ───────────────────────────── */
export const SYSTEM_USERS = [
  { id:1, nombre:'Juan Pérez',       username:'@admin',      email:'juan.perez@sipgimed.com',       rol:'Administrador', estado:'Activo',   fecha:'14/1/2024'  },
  { id:2, nombre:'María González',   username:'@farmacia',   email:'maria.gonzalez@sipgimed.com',   rol:'Farmacia',      estado:'Activo',   fecha:'9/2/2024'   },
  { id:3, nombre:'Carlos Rodríguez', username:'@jefatura',   email:'carlos.rodriguez@sipgimed.com', rol:'Jefatura',      estado:'Activo',   fecha:'19/1/2024'  },
  { id:4, nombre:'Ana López',        username:'@ana.lopez',  email:'ana.lopez@sipgimed.com',        rol:'Farmacia',      estado:'Inactivo', fecha:'30/11/2023' },
];

export const HISTORIAL_ACCIONES = [
  { fecha:'15/4/2026, 10:30:00', usuario:'Juan Pérez',       accion:'Creó nuevo medicamento', modulo:'Medicamentos', detalle:'Paracetamol 500mg'  },
  { fecha:'15/4/2026, 9:15:00',  usuario:'María González',   accion:'Actualizó stock',        modulo:'Inventario',   detalle:'Amoxicilina 500mg'  },
  { fecha:'14/4/2026, 16:00:00', usuario:'Carlos Rodríguez', accion:'Generó reporte',         modulo:'Reportes',     detalle:'Reporte Q1 2026'    },
  { fecha:'14/4/2026, 11:00:00', usuario:'Juan Pérez',       accion:'Registró lote',          modulo:'Inventario',   detalle:'Losartán 50mg'      },
  { fecha:'13/4/2026, 14:20:00', usuario:'María González',   accion:'Marcó medicamento bajo', modulo:'Inventario',   detalle:'Salbutamol 100mcg'  },
];

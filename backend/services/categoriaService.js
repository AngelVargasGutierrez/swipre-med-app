const CATEGORIAS_KEYWORDS = {
  'Analgésicos y Antipiréticos': ['paracetamol', 'ibuprofeno', 'naproxeno', 'diclofenaco', 'ketorolaco', 'aspirina', 'acetaminof', 'meloxicam'],
  'Antibióticos': ['amoxicilina', 'azitromicina', 'cefalexina', 'ciprofloxacino', 'levofloxacino', 'clindamicina', 'penicilina', 'sulfametoxazol', 'trimetoprima', 'doxiciclina', 'cefuroxima'],
  'Antiácidos y Digestivos': ['omeprazol', 'pantoprazol', 'ranitidina', 'bismuto', 'magnesio', 'aluminio', 'simeticona', 'esomeprazol', 'lansoprazol', 'domperidona', 'metoclopramida'],
  'Antihistamínicos y Antialérgicos': ['loratadina', 'cetirizina', 'clorfenamina', 'desloratadina', 'fexofenadina', 'levocetirizina', 'clorfeniramina'],
  'Cardiovasculares': ['losartan', 'enalapril', 'captopril', 'amlodipino', 'atorvastatina', 'simvastatina', 'rosuvastatina', 'valsartan', 'bisoprolol'],
  'Antidiabéticos': ['metformina', 'insulina', 'glibenclamida', 'sitagliptina', 'empagliflozina'],
  'Broncodilatadores y Respiratorios': ['salbutamol', 'budesonida', 'bromuro', 'fluticasona', 'ambroxol', 'dextrometorfano', 'guaifenesina', 'broncol'],
  'Corticosteroides': ['dexametasona', 'prednisona', 'hidrocortisona', 'betametasona', 'metilprednisolona'],
  'Psicotrópicos y Neurológicos': ['alprazolam', 'clonazepam', 'diazepam', 'sertralina', 'fluoxetina', 'amitriptilina', 'gabapentina', 'pregabalina'],
  'Dermatológicos y Tópicos': ['clotrimazol', 'miconazol', 'ketoconazol', 'terbinafina', 'acido fusidico', 'mupirocina'],
  'Vitamínicos y Suplementos': ['vitamina', 'calcio', 'hierro', 'acido folico', 'complejo b', 'zinc', 'magnesio']
};

function autoCategorizar(nombre) {
  if (!nombre) return 'Otros / General';
  const n = nombre.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIAS_KEYWORDS)) {
    if (keywords.some(k => n.includes(k))) return cat;
  }
  return 'Otros / General';
}

function getTodasCategorias() {
  return [...Object.keys(CATEGORIAS_KEYWORDS), 'Otros / General'];
}

module.exports = { autoCategorizar, getTodasCategorias };

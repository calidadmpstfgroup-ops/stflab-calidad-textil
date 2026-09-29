export interface GuiaMaestraInsumoItem {
  id: string;
  insumo: string;
  parametroCritico: string;
  metodoVerificacion: string;
  criterioAceptacion: string;
  categoria?: 'Botones & Broches' | 'Correas & Cintas' | 'Herrajes & Metálicos' | 'Textiles & Confección' | 'Decoración & Pedrería';
}

export const GUIA_MAESTRA_INSUMOS: GuiaMaestraInsumoItem[] = [
  {
    id: 'gmi-1',
    insumo: 'Botones',
    categoria: 'Botones & Broches',
    parametroCritico: 'Resistencia al impacto y hoyos limpios.',
    metodoVerificacion: 'Golpear con firmeza y pasar un hilo de prueba.',
    criterioAceptacion: 'No deben astillarse; hoyos sin bordes filosos.'
  },
  {
    id: 'gmi-2',
    insumo: 'Correas (Reatas/Cintas)',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Ancho constante y bordes estables.',
    metodoVerificacion: 'Medir con calibrador en 3 puntos del rollo.',
    criterioAceptacion: 'Variación máxima de ±1 mm; bordes termosellados.'
  },
  {
    id: 'gmi-3',
    insumo: 'Correas en Forma de Cadenas',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Unión de eslabones, peso y torsión.',
    metodoVerificacion: 'Estirar con fuerza (tracción) y girar la cadena.',
    criterioAceptacion: 'Eslabones soldados o totalmente cerrados; no se deforman.'
  },
  {
    id: 'gmi-4',
    insumo: 'Correas de Imitación Cuero',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Flexibilidad, adherencia y olor.',
    metodoVerificacion: 'Doblar a 180° repetidamente y raspar el borde.',
    criterioAceptacion: 'No debe cuartearse, pelarse ni oler a plástico quemado.'
  },
  {
    id: 'gmi-5',
    insumo: 'Pañoletas (Seda, Satén, Poliéster)',
    categoria: 'Textiles & Confección',
    parametroCritico: 'Calidad del dobladillo (pañuelo) y estampado.',
    metodoVerificacion: 'Revisar simetría de esquinas y estirar costuras.',
    criterioAceptacion: 'Sin hilos sueltos; costura "pañolera" recta y sin arrugas.'
  },
  {
    id: 'gmi-6',
    insumo: 'Botones Chinos (Pasamanería)',
    categoria: 'Botones & Broches',
    parametroCritico: 'Consistencia del nudo y remate de puntas.',
    metodoVerificacion: 'Presionar el nudo y jalar las colas de hilo.',
    criterioAceptacion: 'Nudo firme (no se desarma); puntas selladas sin deshilacharse.'
  },
  {
    id: 'gmi-7',
    insumo: 'Corbatas',
    categoria: 'Textiles & Confección',
    parametroCritico: 'Corte al bies (sesgo) y simetría de puntas.',
    metodoVerificacion: 'Colgar la corbata desde el centro; medir puntas.',
    criterioAceptacion: 'No debe girarse sobre su eje al colgar; puntas simétricas.'
  },
  {
    id: 'gmi-8',
    insumo: 'Correas con Bolsos / Mini Bags Fijos (Cuero, Sintético o Gamuza)',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Soporte de carga, dirección del pelo (gamuza), costuras de anclaje y sangrado de color.',
    metodoVerificacion: 'Cargar con 300g, abrir/cerrar broches, cepillar el pelo en ambas direcciones y frotar paño húmedo.',
    criterioAceptacion: 'Estructura simétrica (no cuelga torcido); costuras reforzadas; cero transferencia de tinte hacia la prenda.'
  },
  {
    id: 'gmi-9',
    insumo: 'Dijes Decorativos',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Calidad de la argolla de unión y esmalte.',
    metodoVerificacion: 'Jalar el dije suavemente y revisar bajo luz directa.',
    criterioAceptacion: 'Argolla soldada o doble vuelta; esmalte sin burbujas ni rayones.'
  },
  {
    id: 'gmi-10',
    insumo: 'Broches a Presión (Snaps)',
    categoria: 'Botones & Broches',
    parametroCritico: 'Fuerza de agarre y fijación textil.',
    metodoVerificacion: 'Abrir y cerrar 10 veces consecutivas.',
    criterioAceptacion: 'No deben soltarse solos ni romper la tela al abrir.'
  },
  {
    id: 'gmi-11',
    insumo: 'Pines',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Firmeza del vástago y punta.',
    metodoVerificacion: 'Presionar la base del pin contra la muestra.',
    criterioAceptacion: 'El vástago no debe doblarse; punta sin rebabas.'
  },
  {
    id: 'gmi-12',
    insumo: 'Hebillas',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Deslizamiento, freno y acabado.',
    metodoVerificacion: 'Pasar la correa bajo tensión mecánica.',
    criterioAceptacion: 'Traba firme; superficie 100% lisa sin rebabas.'
  },
  {
    id: 'gmi-13',
    insumo: 'Cierres (Cremalleras)',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Traba del carro y simetría de dientes.',
    metodoVerificacion: 'Subir y bajar el carro; halar lateralmente.',
    criterioAceptacion: 'El carro se bloquea al bajar; dientes alineados.'
  },
  {
    id: 'gmi-14',
    insumo: 'Correas de Cuero (Lujo)',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Migración de color y flexibilidad.',
    metodoVerificacion: 'Frotar paño húmedo/seco; doblar a 180°.',
    criterioAceptacion: 'Paño limpio (cero tinte); cuero sin grietas.'
  },
  {
    id: 'gmi-15',
    insumo: 'Pedrería (En Cuero/Sintético)',
    categoria: 'Decoración & Pedrería',
    parametroCritico: 'Fijación de piedras bajo torsión.',
    metodoVerificacion: 'Pasar espátula plástica sobre las piedras.',
    criterioAceptacion: 'Ninguna piedra debe desprenderse ni aflojarse.'
  },
  {
    id: 'gmi-16',
    insumo: 'Broches Imperdibles (Lujo)',
    categoria: 'Botones & Broches',
    parametroCritico: 'Tensión del resorte y seguro de cierre.',
    metodoVerificacion: 'Abrir, cerrar y presionar el seguro.',
    criterioAceptacion: 'No se abre solo con el peso; punta oculta por completo.'
  },
  {
    id: 'gmi-17',
    insumo: 'Cristales (En Broches)',
    categoria: 'Decoración & Pedrería',
    parametroCritico: 'Engaste de garras y brillo uniforme.',
    metodoVerificacion: 'Golpear suave el broche en madera (Tap Test).',
    criterioAceptacion: 'Cristales inmóviles; garras planas (no enganchan).'
  },
  {
    id: 'gmi-18',
    insumo: 'Baño Metálico (Cadenas/Dijes/Herrajes)',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Resistencia a la oxidación y alergias.',
    metodoVerificacion: 'Prueba de frote y validación de ficha técnica.',
    criterioAceptacion: 'Color homogéneo; 100% Libre de Níquel y Plomo.'
  },
  {
    id: 'gmi-19',
    insumo: 'Borlas (Tassels / Flecos trenzados)',
    categoria: 'Decoración & Pedrería',
    parametroCritico: 'Desprendimiento de hilos, firmeza del cabezal y largo uniforme.',
    metodoVerificacion: 'Jalar suavemente los flecos inferiores y revisar el amarre superior.',
    criterioAceptacion: 'Cero desprendimiento de hilos al tirón; cabezal firme; flecos parejos sin deshilacharse.'
  }
];

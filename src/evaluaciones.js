/**
 * Catálogo de evaluaciones de Superación Juvenil A.B.P.
 *
 * Fuente: los 15 instrumentos oficiales (E1 a E5) en PDF. Cada nivel
 * (Secundaria / Preparatoria / Universitarios) tiene su propia versión, y a
 * cada usuario sólo le aparecen las de su programa y tipo de participante.
 *
 * La pregunta "Código de seguimiento" que traen los PDF NO está aquí: la
 * plataforma la asigna sola (ver src/lib/claveSeguimiento.js) y la guarda
 * junto con cada respuesta.
 *
 * Los renglones de las preguntas tipo `grid` usan ids estables (f1…f12) que
 * son los mismos en la evaluación de ingreso (E1) y en la de cierre (E2) del
 * mismo nivel, para poder comparar el antes y el después de cada habilidad.
 */

export const CATEGORIAS = {
  ingreso:    { label: 'Diagnóstico de ingreso', color: '#1A56A4', bg: '#E8F0FB', icon: '🧭' },
  cierre:     { label: 'Cierre de ciclo',        color: '#1a7a45', bg: '#edfaf3', icon: '📈' },
  evento:     { label: 'Evento',                 color: '#8a5c00', bg: '#fffbea', icon: '🎪' },
  servicio:   { label: 'Servicio',               color: '#6d28d9', bg: '#f5f1ff', icon: '🤝' },
  graduacion: { label: 'Graduados',              color: '#b91c1c', bg: '#fef2f2', icon: '🎓' },
};

/** Niveles y los programas que caen en cada uno. */
export const NIVELES = {
  secundaria:     { label: 'Secundaria',     programas: ['Essencia', 'Escudería Real'] },
  prepa:          { label: 'Preparatoria',   programas: ['MJ Prepa'] },
  universitarios: { label: 'Universitarios', programas: ['MCU', 'SU'] },
};

/** Escalas reutilizables. `labels[0]` corresponde al valor `min`. */
export const ESCALAS = {
  intensidad5: {
    min: 1, max: 5,
    labels: ['Nada', 'Poco', 'Regular', 'Bastante', 'Mucho'],
  },
  frecuencia6: {
    min: 1, max: 6,
    labels: ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Casi siempre', 'Siempre'],
  },
  avance4: {
    min: 1, max: 4,
    labels: ['Igual o peor', 'Un poco mejor', 'Mejor', 'Mucho mejor'],
  },
  desempeno4: {
    min: 1, max: 4,
    labels: ['Insuficiente', 'En desarrollo', 'Competente', 'Sobresaliente'],
  },
  nps11: {
    min: 0, max: 10,
    labels: null,
    minLabel: 'Nada probable',
    maxLabel: 'Totalmente probable',
  },
};

/**
 * Las 12 áreas del marco de habilidades de SJ.
 *
 * Los bloques "Así soy hoy" (E1/E2, renglones f1…f12) y "Mis habilidades de
 * servicio hoy" (E4A, renglones s1…s12) miden estas mismas áreas, en el mismo
 * orden, con la redacción adaptada a cada nivel. De ahí sale la comparación de
 * avance por área entre el ingreso y el cierre del ciclo.
 *
 * El orden importa: la posición del renglón determina el área. Si se agrega o
 * reordena un renglón hay que actualizar esta lista.
 */
export const AREAS_HABILIDADES = [
  'Comunicación',
  'Iniciativa',
  'Organización y responsabilidad',
  'Empatía',
  'Trabajo en equipo',
  'Apertura a la retroalimentación',
  'Manejo de emociones',
  'Resolución de conflictos',
  'Resiliencia',
  'Servicio',
  'Valores y fe',
  'Proyecto de vida',
];

/** Área que mide un renglón (`f3` → 'Organización y responsabilidad'). */
export function areaDeRenglon(rowId) {
  const m = /^[fs](\d{1,2})$/.exec(rowId || '');
  if (!m) return null;
  return AREAS_HABILIDADES[Number(m[1]) - 1] || null;
}

/* ── Bloques de habilidades compartidos entre E1 (ingreso) y E2 (cierre) ── */

const HABILIDADES_SECUNDARIA = [
  { id: 'f1',  text: 'Digo lo que pienso con respeto, aunque los demás no opinen igual.' },
  { id: 'f2',  text: 'Si veo algo que hay que hacer en casa o en la escuela, lo hago sin que me lo pidan.' },
  { id: 'f3',  text: 'Entrego mis tareas y cumplo mis compromisos a tiempo.' },
  { id: 'f4',  text: 'Me pongo en el lugar de mis compañeros cuando están tristes o tienen un problema.' },
  { id: 'f5',  text: 'En los trabajos en equipo hago mi parte y ayudo a que todos participen.' },
  { id: 'f6',  text: 'Cuando un adulto o compañero me corrige, lo escucho sin enojarme.' },
  { id: 'f7',  text: 'Cuando me enojo, me calmo antes de decir o hacer algo.' },
  { id: 'f8',  text: 'Cuando tengo un problema con alguien, lo arreglo hablando en vez de pelear o ignorarlo.' },
  { id: 'f9',  text: 'Si algo me sale mal, lo vuelvo a intentar.' },
  { id: 'f10', text: 'Ayudo en mi casa, escuela o colonia sin esperar algo a cambio.' },
  { id: 'f11', text: 'Mis valores y mi fe me ayudan a tomar buenas decisiones.' },
  { id: 'f12', text: 'Tengo claro qué quiero lograr en los próximos años.' },
];

const HABILIDADES_PREPA = [
  { id: 'f1',  text: 'Expreso mis ideas con claridad y respeto, aunque mi grupo opine diferente.' },
  { id: 'f2',  text: 'Si veo un problema en mi grupo o escuela, hago algo para resolverlo sin esperar a que me lo pidan.' },
  { id: 'f3',  text: 'Organizo mi tiempo entre escuela, familia, amigos y el programa para cumplir lo que me toca.' },
  { id: 'f4',  text: 'Intento entender cómo se sienten y piensan los demás antes de juzgarlos.' },
  { id: 'f5',  text: 'En equipo, pongo la meta del grupo por encima de lucirme yo.' },
  { id: 'f6',  text: 'Acepto críticas y correcciones como oportunidad para mejorar.' },
  { id: 'f7',  text: 'Antes de reaccionar impulsivamente (en persona o en redes), me tomo un momento para pensar.' },
  { id: 'f8',  text: 'En un conflicto, busco soluciones en lugar de culpar a otros.' },
  { id: 'f9',  text: 'Después de un error o fracaso, aprendo y lo vuelvo a intentar.' },
  { id: 'f10', text: 'Busco oportunidades para servir a mi comunidad o a quien lo necesita.' },
  { id: 'f11', text: 'Mis valores y mi fe me ayudan a decidir, aunque mis amigos piensen distinto.' },
  { id: 'f12', text: 'Tengo un plan para lo que haré al terminar la prepa.' },
];

const HABILIDADES_UNIVERSITARIOS = [
  { id: 'f1',  text: 'Defiendo mis ideas con argumentos y respeto en equipos de escuela, trabajo o comunidad.' },
  { id: 'f2',  text: 'Tomo la iniciativa para organizar o resolver situaciones sin esperar a que alguien más lo haga.' },
  { id: 'f3',  text: 'Planeo mi semana y pongo prioridades para cumplir compromisos académicos, laborales y personales.' },
  { id: 'f4',  text: 'Busco entender a personas con historias y opiniones distintas a las mías.' },
  { id: 'f5',  text: 'Colaboro con personas distintas a mí y aporto para que el equipo logre su objetivo.' },
  { id: 'f6',  text: 'Pido retroalimentación y la uso para mejorar mi desempeño.' },
  { id: 'f7',  text: 'Manejo la presión (exámenes, trabajo, pendientes) sin que afecte mi trato con los demás.' },
  { id: 'f8',  text: 'Ante un desacuerdo, escucho a la otra parte y busco un acuerdo que funcione para ambos.' },
  { id: 'f9',  text: 'Ante un fracaso o rechazo, me recupero y ajusto mi plan.' },
  { id: 'f10', text: 'Participo en acciones concretas que mejoran mi comunidad.' },
  { id: 'f11', text: 'Tomo decisiones académicas, laborales y personales congruentes con mis valores.' },
  { id: 'f12', text: 'Tengo un proyecto de vida y profesional con pasos concretos.' },
];

/** Bloque "Comparado con cuando entraste" — idéntico en los tres niveles (E2). */
const AVANCE_PERCIBIDO = {
  id: 'avance',
  type: 'grid',
  question: 'Comparado con cuando entraste al programa, ¿cómo eres hoy en…?',
  required: true,
  escala: 'avance4',
  rows: [
    { id: 'a1', text: '…tomar la iniciativa y cumplir mis compromisos' },
    { id: 'a2', text: '…relacionarme y trabajar con otros' },
    { id: 'a3', text: '…manejar mis emociones y resolver conflictos' },
    { id: 'a4', text: '…servir y vivir mis valores' },
  ],
};

const ASISTENCIA_CICLO = {
  id: 'asistencia',
  type: 'single',
  question: '¿A cuántas sesiones asististe este ciclo?',
  required: true,
  options: ['Casi todas', 'Más de la mitad', 'Menos de la mitad', 'Muy pocas'],
};

/* ── Bloques compartidos de la evaluación de graduados (E5) ── */

const PARTES_PROGRAMA = [
  'Temas de formación', 'Acompañamiento de líderes', 'Retiros y campamentos',
  'Servicio y misiones', 'Vida de fe', 'Comunidad y amistades',
];

function bloqueGraduados() {
  return [
    {
      id: 'anios',
      type: 'single',
      question: '¿Cuántos años participaste en SJ?',
      required: true,
      options: ['1', '2', '3', '4 o más'],
    },
    {
      id: 'valor-partes',
      type: 'grid',
      question: '¿Qué tanto valor tuvo para ti cada parte del programa?',
      required: true,
      escala: 'intensidad5',
      rows: PARTES_PROGRAMA.map((t, i) => ({ id: `v${i + 1}`, text: t })),
    },
    {
      id: 'aporta-mas',
      type: 'single',
      question: '¿Cuál de esas partes aporta más a tu vida HOY?',
      required: true,
      options: PARTES_PROGRAMA,
    },
    {
      id: 'aporta-menos',
      type: 'single',
      question: '¿Cuál aportó menos o podría cambiar?',
      required: true,
      options: [...PARTES_PROGRAMA, 'Ninguna'],
    },
    {
      id: 'utilidad-areas',
      type: 'grid',
      question: '¿Qué tan útil es lo que viviste en SJ para estas áreas de tu vida actual?',
      required: true,
      escala: 'intensidad5',
      rows: [
        { id: 'u1', text: 'Estudios o trabajo' },
        { id: 'u2', text: 'Familia' },
        { id: 'u3', text: 'Amistades' },
        { id: 'u4', text: 'Decisiones personales' },
        { id: 'u5', text: 'Fe' },
        { id: 'u6', text: 'Comunidad' },
      ],
    },
    {
      id: 'proximos-5',
      type: 'scale',
      question: '¿Qué tanto crees que lo aprendido te servirá en los próximos 5 años?',
      required: true,
      escala: 'intensidad5',
    },
    {
      id: 'habilidad-mas-usada',
      type: 'single',
      question: '¿Qué habilidad de las que trabajaste usas más hoy?',
      required: true,
      options: [
        'Comunicar mis ideas', 'Iniciativa', 'Organización', 'Empatía', 'Trabajo en equipo',
        'Manejo de emociones', 'Resolver conflictos', 'Levantarme tras un fracaso', 'Servir',
        'Vivir mis valores', 'Proyecto de vida',
      ],
    },
    {
      id: 'falto',
      type: 'multi',
      question: '¿Qué te hubiera gustado recibir y faltó?',
      required: false,
      maxSelect: 2,
      options: [
        'Orientación vocacional', 'Habilidades para el trabajo', 'Salud emocional',
        'Educación financiera', 'Más servicio práctico', 'Más acompañamiento personal', 'Nada',
      ],
    },
    {
      id: 'satisfaccion',
      type: 'scale',
      question: 'Satisfacción general con tu paso por SJ.',
      required: true,
      escala: 'intensidad5',
    },
    {
      id: 'nps',
      type: 'scale',
      question: 'Del 0 al 10, ¿qué tan probable es que recomiendes SJ a alguien de tu edad?',
      required: true,
      escala: 'nps11',
    },
    {
      id: 'vinculo',
      type: 'multi',
      question: '¿Cómo te gustaría seguir vinculado/a?',
      required: false,
      options: [
        'Continuar en el siguiente programa', 'Servir como voluntario/a',
        'Apoyar como donante (UNO+)', 'Recibir noticias', 'No por ahora',
      ],
    },
    {
      id: 'contacto',
      type: 'text',
      question: '(Opcional) Correo o WhatsApp para un breve seguimiento en 12 meses.',
      required: false,
    },
  ];
}

/* ── Catálogo ── */

export const EVALUACIONES = [
  /* ───────────────────────── E1 · Diagnóstico de ingreso ───────────────────────── */
  {
    id: 'e1-secundaria',
    codigo: 'E1A',
    title: 'Diagnóstico de ingreso · Secundaria',
    description: 'Punto de partida del ciclo: tu contexto, cómo te sientes hoy y qué esperas del programa.',
    category: 'ingreso',
    nivel: 'secundaria',
    applies: { nivel: 'secundaria', tipo: ['Beneficiario'] },
    estimatedMinutes: 10,
    intro: '¡Bienvenido/a! Queremos conocerte para acompañarte mejor. No hay respuestas buenas ni malas.',
    questions: [
      {
        id: 'grupo', type: 'single', required: true,
        question: '¿En qué grupo estás?',
        options: ['Essencia', 'Escudería Real', 'Otro'],
      },
      {
        id: 'grado', type: 'single', required: true,
        question: '¿En qué grado vas?',
        options: ['1° de secundaria', '2° de secundaria', '3° de secundaria'],
      },
      {
        id: 'gusto-escuela', type: 'scale', required: true, escala: 'intensidad5',
        question: '¿Qué tan a gusto te sientes en tu escuela?',
      },
      {
        id: 'preocupacion', type: 'multi', required: true, maxSelect: 2,
        question: '¿Qué es lo que más te preocupa hoy?',
        options: [
          'Mis calificaciones', 'Mis amistades', 'Mi familia',
          'Cómo me veo o lo que piensan de mí', 'Burlas o acoso', 'Redes sociales',
          'Mi futuro', 'Prefiero no responder',
        ],
      },
      {
        id: 'celular', type: 'single', required: true,
        question: 'Fuera de la escuela, ¿cuánto tiempo pasas en el celular al día?',
        options: ['Menos de 1 h', '1–3 h', '3–5 h', 'Más de 5 h'],
      },
      {
        id: 'confianza', type: 'single', required: true,
        question: 'Cuando tienes un problema, ¿a quién le cuentas primero?',
        options: [
          'Mamá o papá', 'Otro familiar', 'Un amigo o amiga', 'Un maestro o líder',
          'A nadie', 'Prefiero no responder',
        ],
      },
      {
        id: 'habilidades', type: 'grid', required: true, escala: 'frecuencia6',
        question: 'Así soy hoy',
        help: 'Lee cada frase y marca qué tan seguido la vives HOY, no cómo te gustaría ser.',
        rows: HABILIDADES_SECUNDARIA,
      },
      {
        id: 'expectativa', type: 'multi', required: true, maxSelect: 2,
        question: '¿Qué te gustaría vivir en el programa?',
        options: [
          'Hacer amigos', 'Divertirme', 'Aprender a ser líder', 'Conocer más de Dios',
          'Ayudar a otros', 'Sentirme escuchado/a',
        ],
      },
      {
        id: 'meta', type: 'longtext', required: true,
        question: 'Termina la frase: "Al final de este año me gustaría ser más…"',
      },
    ],
  },
  {
    id: 'e1-prepa',
    codigo: 'E1B',
    title: 'Diagnóstico de ingreso · Preparatoria',
    description: 'Punto de partida del ciclo: tu contexto, cómo te sientes hoy y qué esperas de MJ Prepa.',
    category: 'ingreso',
    nivel: 'prepa',
    applies: { nivel: 'prepa', tipo: ['Beneficiario'] },
    estimatedMinutes: 10,
    intro: 'Queremos conocer tu punto de partida para acompañarte mejor este ciclo. Tus respuestas son confidenciales.',
    questions: [
      {
        id: 'semestre', type: 'single', required: true,
        question: 'Semestre:',
        options: ['1°–2°', '3°–4°', '5°–6°'],
      },
      {
        id: 'tipo-prepa', type: 'single', required: true,
        question: 'Tipo de prepa:',
        options: ['Pública', 'Privada', 'Técnica o CONALEP', 'En línea o abierta'],
      },
      {
        id: 'trabaja', type: 'single', required: true,
        question: '¿Trabajas además de estudiar?',
        options: ['No', 'Ocasionalmente', 'Medio tiempo', 'Tiempo completo'],
      },
      {
        id: 'presion', type: 'multi', required: true, maxSelect: 2,
        question: '¿Qué temas te generan más presión hoy?',
        options: [
          'Calificaciones', 'Elegir carrera', 'Dinero o trabajo', 'Familia',
          'Relación de pareja', 'Estado de ánimo', 'Redes sociales',
          'Alcohol u otras sustancias en mi entorno', 'Prefiero no responder',
        ],
      },
      {
        id: 'plan-post-prepa', type: 'single', required: true,
        question: '¿Qué tan claro tienes qué harás al terminar la prepa?',
        options: [
          'Ya decidí y tengo un plan', 'Tengo opciones pero no decido', 'No lo sé',
          'No pienso seguir estudiando',
        ],
      },
      {
        id: 'confianza', type: 'single', required: true,
        question: 'Cuando tienes un problema serio, ¿a quién acudes primero?',
        options: [
          'Familia', 'Amigos', 'Pareja', 'Un maestro o líder', 'Lo resuelvo solo/a',
          'A nadie', 'Prefiero no responder',
        ],
      },
      {
        id: 'habilidades', type: 'grid', required: true, escala: 'frecuencia6',
        question: 'Así soy hoy',
        help: 'Lee cada frase y marca qué tan seguido la vives HOY, no cómo te gustaría ser.',
        rows: HABILIDADES_PREPA,
      },
      {
        id: 'expectativa', type: 'multi', required: true, maxSelect: 2,
        question: '¿Qué buscas en MJ Prepa?',
        options: [
          'Amigos que sumen', 'Orientación vocacional', 'Crecer en mi fe', 'Liderazgo',
          'Servir a otros', 'Apoyo emocional',
        ],
      },
      {
        id: 'meta', type: 'longtext', required: true,
        question: '¿Qué es lo que más quieres cambiar o mejorar de ti este ciclo, y por qué?',
      },
    ],
  },
  {
    id: 'e1-universitarios',
    codigo: 'E1C',
    title: 'Diagnóstico de ingreso · Universitarios',
    description: 'Punto de partida del ciclo: tu contexto académico y profesional, tus retos y lo que buscas en el programa.',
    category: 'ingreso',
    nivel: 'universitarios',
    applies: { nivel: 'universitarios', tipo: ['Beneficiario'] },
    estimatedMinutes: 10,
    intro: 'Queremos conocer tu punto de partida para que este ciclo responda a lo que buscas. Tus respuestas son confidenciales.',
    questions: [
      {
        id: 'grupo', type: 'single', required: true,
        question: 'Grupo:',
        options: ['MCU Tec', 'MCU Norte', 'MCU Poniente', 'Sector Universitario'],
      },
      {
        id: 'universidad-carrera', type: 'text', required: true,
        question: 'Universidad y carrera.',
      },
      {
        id: 'semestre', type: 'single', required: true,
        question: 'Semestre:',
        options: ['1°–2°', '3°–4°', '5°–6°', '7° o más', 'Egresado/a'],
      },
      {
        id: 'trabaja', type: 'single', required: true,
        question: '¿Trabajas de manera remunerada?',
        options: ['No', 'Ocasionalmente', 'Medio tiempo', 'Tiempo completo'],
      },
      {
        id: 'primera-generacion', type: 'single', required: true,
        question: '¿Eres la primera generación de tu familia en ir a la universidad?',
        options: ['Sí', 'No'],
      },
      {
        id: 'identificacion-carrera', type: 'scale', required: true, escala: 'intensidad5',
        question: '¿Qué tan identificado/a te sientes con tu carrera?',
      },
      {
        id: 'retos', type: 'multi', required: true, maxSelect: 2,
        question: 'Tus principales retos hoy:',
        options: [
          'Rendimiento académico', 'Economía', 'Confirmar mi vocación',
          'Estrés o estado de ánimo', 'Relaciones', 'Conseguir prácticas o empleo',
          'Administrar mi tiempo', 'Prefiero no responder',
        ],
      },
      {
        id: 'motivo', type: 'multi', required: true, maxSelect: 2,
        question: '¿Por qué te unes al programa?',
        options: [
          'Comunidad y amistades', 'Crecer en mi fe', 'Desarrollar liderazgo', 'Servir',
          'Red y desarrollo profesional', 'Me invitaron',
        ],
      },
      {
        id: 'habilidades', type: 'grid', required: true, escala: 'frecuencia6',
        question: 'Así soy hoy',
        help: 'Lee cada frase y marca qué tan seguido la vives HOY, no cómo te gustaría ser.',
        rows: HABILIDADES_UNIVERSITARIOS,
      },
    ],
  },

  /* ───────────────────────── E2 · Cierre de ciclo ───────────────────────── */
  {
    id: 'e2-secundaria',
    codigo: 'E2A',
    title: 'Cierre de ciclo · Secundaria',
    description: 'Avance de habilidades al terminar el ciclo y tu experiencia en el programa.',
    category: 'cierre',
    nivel: 'secundaria',
    applies: { nivel: 'secundaria', tipo: ['Beneficiario'] },
    estimatedMinutes: 10,
    intro: '¡Llegaste al final del ciclo! Responde con honestidad: nos ayuda a ver cuánto has crecido.',
    questions: [
      ASISTENCIA_CICLO,
      {
        id: 'habilidades', type: 'grid', required: true, escala: 'frecuencia6',
        question: 'Así soy hoy',
        help: 'Lee cada frase y marca qué tan seguido la vives HOY, no cómo te gustaría ser.',
        rows: HABILIDADES_SECUNDARIA,
      },
      AVANCE_PERCIBIDO,
      {
        id: 'mas-ayudo', type: 'multi', required: true, maxSelect: 2,
        question: '¿Qué fue lo que más te ayudó a crecer?',
        options: [
          'Los temas', 'Las dinámicas y juegos', 'Mis líderes', 'Mis amigos del grupo',
          'Los retiros o campamentos', 'Las actividades de servicio',
        ],
      },
      {
        id: 'familia', type: 'single', required: true,
        question: 'Desde que estás en el programa, ¿cómo es la relación con tu familia?',
        options: ['Mejor', 'Igual', 'Peor', 'Prefiero no responder'],
      },
      {
        id: 'ejemplo', type: 'longtext', required: false,
        question: 'Cuéntanos una vez este año en que hiciste algo diferente gracias a lo que aprendiste aquí (en casa, en la escuela o con amigos).',
      },
    ],
  },
  {
    id: 'e2-prepa',
    codigo: 'E2B',
    title: 'Cierre de ciclo · Preparatoria',
    description: 'Avance de habilidades al terminar el ciclo y tu experiencia en MJ Prepa.',
    category: 'cierre',
    nivel: 'prepa',
    applies: { nivel: 'prepa', tipo: ['Beneficiario'] },
    estimatedMinutes: 10,
    intro: 'Cerramos el ciclo. Responde con honestidad: tus respuestas muestran cuánto has avanzado y qué debemos mejorar.',
    questions: [
      ASISTENCIA_CICLO,
      {
        id: 'habilidades', type: 'grid', required: true, escala: 'frecuencia6',
        question: 'Así soy hoy',
        help: 'Lee cada frase y marca qué tan seguido la vives HOY, no cómo te gustaría ser.',
        rows: HABILIDADES_PREPA,
      },
      AVANCE_PERCIBIDO,
      {
        id: 'mas-impacto', type: 'multi', required: true, maxSelect: 2,
        question: '¿Qué tuvo más impacto en ti?',
        options: [
          'Temas de formación', 'Acompañamiento de mi líder', 'Amistades del grupo',
          'Retiros o campamentos', 'Servicio comunitario', 'Vida de fe',
        ],
      },
      {
        id: 'plan-post-prepa', type: 'single', required: true,
        question: '¿Qué tan claro tienes qué harás al terminar la prepa?',
        options: [
          'Ya decidí y tengo un plan', 'Tengo opciones pero no decido', 'No lo sé',
          'No pienso seguir estudiando',
        ],
      },
      {
        id: 'decision-dificil', type: 'longtext', required: false,
        question: 'Describe una decisión o situación difícil de este ciclo que manejaste mejor gracias al programa.',
      },
      {
        id: 'nps', type: 'scale', required: true, escala: 'nps11',
        question: 'Del 0 al 10, ¿qué tan probable es que invites a un amigo a MJ Prepa?',
      },
      {
        id: 'cambiarias', type: 'longtext', required: false,
        question: '¿Qué cambiarías para el próximo ciclo?',
      },
    ],
  },
  {
    id: 'e2-universitarios',
    codigo: 'E2C',
    title: 'Cierre de ciclo · Universitarios',
    description: 'Avance de habilidades al terminar el ciclo y tu experiencia universitaria en SJ.',
    category: 'cierre',
    nivel: 'universitarios',
    applies: { nivel: 'universitarios', tipo: ['Beneficiario'] },
    estimatedMinutes: 10,
    intro: 'Cerramos el ciclo. Tus respuestas nos permiten medir tu avance y mejorar la experiencia universitaria de SJ.',
    questions: [
      ASISTENCIA_CICLO,
      {
        id: 'habilidades', type: 'grid', required: true, escala: 'frecuencia6',
        question: 'Así soy hoy',
        help: 'Lee cada frase y marca qué tan seguido la vives HOY, no cómo te gustaría ser.',
        rows: HABILIDADES_UNIVERSITARIOS,
      },
      AVANCE_PERCIBIDO,
      {
        id: 'mas-aporto', type: 'multi', required: true, maxSelect: 2,
        question: '¿Qué elementos aportaron más a tu desarrollo?',
        options: [
          'Formación en valores', 'Liderazgo de proyectos', 'Servicio y misiones',
          'Comunidad y amistades', 'Vida de fe', 'Red de contactos y oportunidades',
        ],
      },
      {
        id: 'identificacion-carrera', type: 'scale', required: true, escala: 'intensidad5',
        question: '¿Qué tan identificado/a te sientes hoy con tu carrera y tu proyecto profesional?',
      },
      {
        id: 'valio-la-pena', type: 'single', required: true,
        question: 'Al reflexionar en este ciclo, ¿dirías que valió la pena participar del Programa?',
        options: ['Sí', 'En parte', 'No'],
      },
      {
        id: 'valio-la-pena-ejemplo', type: 'longtext', required: false,
        question: 'Explícalo con un ejemplo.',
      },
      {
        id: 'habilidad-aplicada', type: 'longtext', required: false,
        question: '¿Qué habilidad de las que trabajaste ya aplicas en tu escuela o trabajo, y cómo?',
      },
    ],
  },

  /* ───────────────────────── E3 · Evento de alto impacto ───────────────────────── */
  {
    id: 'e3-evento-secundaria',
    codigo: 'E3A',
    title: 'Evaluación de evento · Secundaria',
    description: 'Tu opinión sobre el último evento de alto impacto al que asististe.',
    category: 'evento',
    nivel: 'secundaria',
    applies: { nivel: 'secundaria', tipo: ['Beneficiario'] },
    estimatedMinutes: 7,
    intro: 'Tu opinión decide cómo será el próximo evento. Responde en 7 minutos.',
    questions: [
      { id: 'evento', type: 'text', required: true, question: '¿A qué evento asististe? (escribe el nombre)' },
      { id: 'primer-evento', type: 'single', required: true, question: '¿Es tu primer evento con SJ?', options: ['Sí', 'No'] },
      {
        id: 'como-enteraste', type: 'single', required: true,
        question: '¿Cómo te enteraste?',
        options: ['Mi líder o grupo', 'Un amigo', 'Redes sociales de SJ', 'Mi familia', 'Parroquia o escuela'],
      },
      { id: 'general', type: 'scale', required: true, escala: 'intensidad5', question: 'Calificación general del evento.' },
      {
        id: 'partes', type: 'grid', required: true, escala: 'intensidad5',
        question: 'Califica cada parte del evento:',
        rows: [
          { id: 'p1', text: 'Temas o conferencistas' },
          { id: 'p2', text: 'Dinámicas' },
          { id: 'p3', text: 'Momentos de oración o reflexión' },
          { id: 'p4', text: 'Convivencia' },
          { id: 'p5', text: 'Lugar e instalaciones' },
          { id: 'p6', text: 'Comida' },
          { id: 'p7', text: 'Horarios y ritmo' },
          { id: 'p8', text: 'Información antes del evento' },
        ],
      },
      { id: 'momento-mejor', type: 'longtext', required: false, question: '¿Qué momento fue el más significativo para ti?' },
      { id: 'momento-menos', type: 'longtext', required: false, question: '¿Qué momento aportó menos? (o escribe "ninguno")' },
      { id: 'duracion', type: 'single', required: true, question: 'La duración fue:', options: ['Muy corta', 'Adecuada', 'Muy larga'] },
      { id: 'seguridad', type: 'scale', required: true, escala: 'intensidad5', question: '¿Te sentiste seguro/a, respetado/a y cuidado/a durante todo el evento?' },
      { id: 'vida-real', type: 'scale', required: true, escala: 'intensidad5', question: '¿Los temas hablaron de tu vida real?' },
      { id: 'compromiso', type: 'single', required: true, question: '¿Te llevas una decisión o compromiso concreto?', options: ['Sí, muy claro', 'Más o menos', 'No'] },
      { id: 'compromiso-cual', type: 'longtext', required: false, question: 'Si respondiste sí, ¿cuál es?' },
      {
        id: 'valor-cuota', type: 'single', required: false,
        question: '(Solo eventos con cuota) Por lo que pagaste, el evento valió:',
        options: ['Más de lo que costó', 'Lo que costó', 'Menos de lo que costó'],
      },
      { id: 'nps', type: 'scale', required: true, escala: 'nps11', question: 'Del 0 al 10, ¿qué tan probable es que invites a un amigo al próximo evento?' },
      {
        id: 'impedimento', type: 'multi', required: false, maxSelect: 2,
        question: '¿Qué te podría impedir ir al siguiente?',
        options: ['Costo', 'Transporte', 'Permiso de mis papás', 'Escuela o trabajo', 'Fechas', 'Nada'],
      },
      { id: 'no-cambiar-si-cambiar', type: 'longtext', required: false, question: 'Una cosa que NO debemos cambiar y una que SÍ debemos cambiar.' },
      {
        id: 'info-papas', type: 'single', required: true,
        question: '¿Tus papás recibieron información clara antes del evento (horarios, lugar, contacto)?',
        options: ['Sí', 'Más o menos', 'No'],
      },
      { id: 'amigo-nuevo', type: 'single', required: true, question: '¿Hiciste un amigo nuevo en el evento?', options: ['Sí, varios', 'Uno', 'No'] },
    ],
  },
  {
    id: 'e3-evento-prepa',
    codigo: 'E3A',
    title: 'Evaluación de evento · Preparatoria',
    description: 'Tu opinión sobre el último evento de alto impacto al que asististe.',
    category: 'evento',
    nivel: 'prepa',
    applies: { nivel: 'prepa', tipo: ['Beneficiario'] },
    estimatedMinutes: 7,
    intro: 'Tu opinión decide cómo será el próximo evento. Responde en 7 minutos.',
    questions: [
      { id: 'evento', type: 'text', required: true, question: '¿A qué evento asististe? (escribe el nombre)' },
      { id: 'primer-evento', type: 'single', required: true, question: '¿Es tu primer evento con SJ?', options: ['Sí', 'No'] },
      {
        id: 'como-enteraste', type: 'single', required: true,
        question: '¿Cómo te enteraste?',
        options: ['Mi líder o grupo', 'Un amigo', 'Redes sociales de SJ', 'Mi familia', 'Parroquia o escuela'],
      },
      { id: 'general', type: 'scale', required: true, escala: 'intensidad5', question: 'Calificación general del evento.' },
      {
        id: 'partes', type: 'grid', required: true, escala: 'intensidad5',
        question: 'Califica cada parte del evento:',
        rows: [
          { id: 'p1', text: 'Temas o conferencistas' },
          { id: 'p2', text: 'Dinámicas' },
          { id: 'p3', text: 'Momentos de oración o reflexión' },
          { id: 'p4', text: 'Convivencia' },
          { id: 'p5', text: 'Lugar e instalaciones' },
          { id: 'p6', text: 'Comida' },
          { id: 'p7', text: 'Horarios y ritmo' },
          { id: 'p8', text: 'Información antes del evento' },
        ],
      },
      { id: 'momento-mejor', type: 'longtext', required: false, question: '¿Qué momento fue el más significativo para ti?' },
      { id: 'momento-menos', type: 'longtext', required: false, question: '¿Qué momento aportó menos? (o escribe "ninguno")' },
      { id: 'duracion', type: 'single', required: true, question: 'La duración fue:', options: ['Muy corta', 'Adecuada', 'Muy larga'] },
      { id: 'seguridad', type: 'scale', required: true, escala: 'intensidad5', question: '¿Te sentiste seguro/a, respetado/a y cuidado/a durante todo el evento?' },
      { id: 'vida-real', type: 'scale', required: true, escala: 'intensidad5', question: '¿Los temas hablaron de tu vida real?' },
      { id: 'compromiso', type: 'single', required: true, question: '¿Te llevas una decisión o compromiso concreto?', options: ['Sí, muy claro', 'Más o menos', 'No'] },
      { id: 'compromiso-cual', type: 'longtext', required: false, question: 'Si respondiste sí, ¿cuál es?' },
      {
        id: 'valor-cuota', type: 'single', required: false,
        question: '(Solo eventos con cuota) Por lo que pagaste, el evento valió:',
        options: ['Más de lo que costó', 'Lo que costó', 'Menos de lo que costó'],
      },
      { id: 'nps', type: 'scale', required: true, escala: 'nps11', question: 'Del 0 al 10, ¿qué tan probable es que invites a un amigo al próximo evento?' },
      {
        id: 'impedimento', type: 'multi', required: false, maxSelect: 2,
        question: '¿Qué te podría impedir ir al siguiente?',
        options: ['Costo', 'Transporte', 'Permiso de mis papás', 'Escuela o trabajo', 'Fechas', 'Nada'],
      },
      { id: 'no-cambiar-si-cambiar', type: 'longtext', required: false, question: 'Una cosa que NO debemos cambiar y una que SÍ debemos cambiar.' },
      {
        id: 'tema-proximo', type: 'multi', required: false, maxSelect: 2,
        question: '¿Qué tema quieres en el próximo evento?',
        options: ['Noviazgo y sexualidad', 'Vocación', 'Salud emocional', 'Fe', 'Redes y tecnología', 'Familia', 'Liderazgo'],
      },
      { id: 'servir-equipo', type: 'single', required: true, question: '¿Te gustaría servir en el equipo de un próximo evento?', options: ['Sí', 'Tal vez', 'No'] },
    ],
  },
  {
    id: 'e3-evento-universitarios',
    codigo: 'E3A',
    title: 'Evaluación de evento · Universitarios',
    description: 'Tu opinión sobre el último evento de alto impacto al que asististe.',
    category: 'evento',
    nivel: 'universitarios',
    // VEM no tiene instrumentos propios: de las de nivel sólo responde ésta.
    applies: { nivel: 'universitarios', programasExtra: ['VEM'], tipo: ['Beneficiario'] },
    estimatedMinutes: 7,
    intro: 'Tu opinión decide cómo será el próximo evento. Responde en 7 minutos.',
    questions: [
      { id: 'evento', type: 'text', required: true, question: '¿A qué evento asististe? (escribe el nombre)' },
      { id: 'primer-evento', type: 'single', required: true, question: '¿Es tu primer evento con SJ?', options: ['Sí', 'No'] },
      {
        id: 'como-enteraste', type: 'single', required: true,
        question: '¿Cómo te enteraste?',
        options: ['Mi líder o grupo', 'Un amigo', 'Redes sociales de SJ', 'Mi familia', 'Parroquia o escuela'],
      },
      { id: 'general', type: 'scale', required: true, escala: 'intensidad5', question: 'Calificación general del evento.' },
      {
        id: 'partes', type: 'grid', required: true, escala: 'intensidad5',
        question: 'Califica cada parte del evento:',
        rows: [
          { id: 'p1', text: 'Temas o conferencistas' },
          { id: 'p2', text: 'Dinámicas' },
          { id: 'p3', text: 'Momentos de oración o reflexión' },
          { id: 'p4', text: 'Convivencia' },
          { id: 'p5', text: 'Lugar e instalaciones' },
          { id: 'p6', text: 'Comida' },
          { id: 'p7', text: 'Horarios y ritmo' },
          { id: 'p8', text: 'Información antes del evento' },
        ],
      },
      { id: 'momento-mejor', type: 'longtext', required: false, question: '¿Qué momento fue el más significativo para ti?' },
      { id: 'momento-menos', type: 'longtext', required: false, question: '¿Qué momento aportó menos? (o escribe "ninguno")' },
      { id: 'duracion', type: 'single', required: true, question: 'La duración fue:', options: ['Muy corta', 'Adecuada', 'Muy larga'] },
      { id: 'seguridad', type: 'scale', required: true, escala: 'intensidad5', question: '¿Te sentiste seguro/a, respetado/a y cuidado/a durante todo el evento?' },
      { id: 'vida-real', type: 'scale', required: true, escala: 'intensidad5', question: '¿Los temas hablaron de tu vida real?' },
      { id: 'compromiso', type: 'single', required: true, question: '¿Te llevas una decisión o compromiso concreto?', options: ['Sí, muy claro', 'Más o menos', 'No'] },
      { id: 'compromiso-cual', type: 'longtext', required: false, question: 'Si respondiste sí, ¿cuál es?' },
      {
        id: 'valor-cuota', type: 'single', required: false,
        question: '(Solo eventos con cuota) Por lo que pagaste, el evento valió:',
        options: ['Más de lo que costó', 'Lo que costó', 'Menos de lo que costó'],
      },
      { id: 'nps', type: 'scale', required: true, escala: 'nps11', question: 'Del 0 al 10, ¿qué tan probable es que invites a un amigo al próximo evento?' },
      {
        id: 'impedimento', type: 'multi', required: false, maxSelect: 2,
        question: '¿Qué te podría impedir ir al siguiente?',
        options: ['Costo', 'Transporte', 'Permiso de mis papás', 'Escuela o trabajo', 'Fechas', 'Nada'],
      },
      { id: 'no-cambiar-si-cambiar', type: 'longtext', required: false, question: 'Una cosa que NO debemos cambiar y una que SÍ debemos cambiar.' },
      {
        id: 'formato', type: 'single', required: true,
        question: '¿Qué formato prefieres?',
        options: ['Retiro de fin de semana', 'Conferencia de un día', 'Misión o servicio', 'Taller profesional'],
      },
      {
        id: 'tema-proximo', type: 'multi', required: false, maxSelect: 2,
        question: '¿Qué tema o conferencista te gustaría?',
        options: ['Vocación y trabajo', 'Liderazgo social', 'Fe y razón', 'Salud emocional', 'Relaciones y familia', 'Otro'],
      },
    ],
  },
  {
    id: 'e3-evento-equipo',
    codigo: 'E3B',
    title: 'Evaluación de evento · Equipo de servicio',
    description: 'Para quienes sirvieron en el equipo del evento: qué funcionó, qué falló y qué recomiendas.',
    category: 'evento',
    applies: { tipo: ['Voluntario'] },
    estimatedMinutes: 8,
    intro: 'Gracias por servir. Tus respuestas definen qué repetimos, qué ajustamos y qué rediseñamos.',
    questions: [
      { id: 'evento', type: 'text', required: true, question: 'Evento (escribe el nombre)' },
      {
        id: 'rol', type: 'single', required: true,
        question: 'Tu rol en el evento:',
        options: ['Coordinación', 'Temas', 'Dinámicas', 'Logística', 'Cocina', 'Salud y seguridad', 'Música', 'Comunicación'],
      },
      { id: 'claridad-rol', type: 'scale', required: true, escala: 'intensidad5', question: '¿Qué tan claro estaba tu rol antes del evento?' },
      { id: 'preparacion', type: 'single', required: true, question: '¿La preparación previa fue suficiente?', options: ['Sí', 'En parte', 'No'] },
      {
        id: 'calificaciones', type: 'grid', required: true, escala: 'intensidad5',
        question: 'Califica:',
        rows: [
          { id: 'c1', text: 'Planeación' },
          { id: 'c2', text: 'Comunicación del equipo' },
          { id: 'c3', text: 'Cumplimiento de horarios' },
          { id: 'c4', text: 'Materiales y recursos' },
          { id: 'c5', text: 'Atención a participantes' },
          { id: 'c6', text: 'Protocolos de seguridad' },
          { id: 'c7', text: 'Cuidado del equipo (descanso y comida)' },
        ],
      },
      { id: 'carga', type: 'single', required: true, question: 'Tu carga de trabajo fue:', options: ['Ligera', 'Adecuada', 'Excesiva'] },
      {
        id: 'incidente', type: 'single', required: true,
        question: '¿Hubo algún incidente de seguridad, salud o conducta?',
        options: ['No', 'Sí, menor y resuelto', 'Sí, requiere seguimiento'],
      },
      {
        id: 'incidente-detalle', type: 'longtext', required: false,
        question: 'Si hubo incidente, descríbelo brevemente SIN nombres.',
        help: 'Los casos con menores se reportan además al coordinador por canal confidencial.',
      },
      { id: 'funciono', type: 'longtext', required: false, question: '¿Qué momento funcionó mejor y por qué?' },
      { id: 'fallo', type: 'longtext', required: false, question: '¿Qué falló y cómo lo resolverías la próxima vez?' },
      { id: 'recursos', type: 'longtext', required: false, question: '¿Faltó o sobró algún recurso (comida, material, transporte, presupuesto)?' },
      { id: 'objetivo', type: 'scale', required: true, escala: 'intensidad5', question: '¿Qué tan bien respondió el evento a su objetivo?' },
      {
        id: 'recomendacion', type: 'single', required: true,
        question: 'Recomendación:',
        options: ['Repetir igual', 'Repetir con ajustes', 'Rediseñar', 'No repetir'],
      },
      { id: 'serviria-de-nuevo', type: 'single', required: true, question: '¿Servirías de nuevo en este evento?', options: ['Sí', 'Tal vez', 'No'] },
      { id: 'satisfaccion', type: 'scale', required: true, escala: 'intensidad5', question: 'Satisfacción con tu experiencia de servicio.' },
      { id: 'reconocimiento', type: 'longtext', required: false, question: '¿Quién del equipo merece reconocimiento y por qué?' },
    ],
  },

  /* ───────────────────────── E4 · Servidores y voluntarios ───────────────────────── */
  {
    id: 'e4-autoevaluacion-servidores',
    codigo: 'E4A',
    title: 'Autoevaluación de cierre de ciclo · Servidores y voluntarios',
    description: 'Tu autoevaluación del ciclo de servicio. Se comenta en una conversación 1 a 1 con tu coordinador.',
    category: 'servicio',
    applies: { tipo: ['Voluntario'] },
    estimatedMinutes: 12,
    intro: 'Gracias por tu servicio este ciclo. Esta autoevaluación se comenta en una conversación 1 a 1 con tu coordinador.',
    questions: [
      {
        id: 'rol', type: 'single', required: true,
        question: 'Rol:',
        options: [
          'Servidor/a joven (egresado/a de SJ)', 'Voluntario/a adulto/a',
          'Facilitador/a o coordinador/a', 'Apoyo en eventos',
        ],
      },
      {
        id: 'programa-servicio', type: 'single', required: true,
        question: '¿En qué programa serviste?',
        options: ['MJ Secundaria', 'MJ Prepa', 'MCU o SU', 'Eventos', 'Dignidad en Acción', 'Varios'],
      },
      { id: 'horas', type: 'single', required: true, question: 'Horas promedio por semana:', options: ['Menos de 2', '2–4', '4–6', 'Más de 6'] },
      { id: 'ciclos', type: 'single', required: true, question: '¿Cuántos ciclos llevas sirviendo en SJ?', options: ['Este es el primero', '2–3', '4 o más'] },
      {
        id: 'habilidades', type: 'grid', required: true, escala: 'frecuencia6',
        question: 'Mis habilidades de servicio hoy',
        help: 'Lee cada frase y marca qué tan seguido la vives HOY, no cómo te gustaría ser.',
        rows: [
          { id: 's1',  text: 'Comunico indicaciones e ideas con claridad a los jóvenes que acompaño.' },
          { id: 's2',  text: 'Anticipo necesidades del grupo y actúo sin esperar a que el coordinador me lo pida.' },
          { id: 's3',  text: 'Cumplo puntualmente las tareas que asumo en el servicio.' },
          { id: 's4',  text: 'Me intereso por la historia y situación de cada joven que acompaño.' },
          { id: 's5',  text: 'Trabajo coordinado con el equipo de servidores y respeto los acuerdos.' },
          { id: 's6',  text: 'Recibo la retroalimentación de mis coordinadores y la aplico.' },
          { id: 's7',  text: 'Mantengo la calma y el buen trato ante situaciones difíciles con los jóvenes.' },
          { id: 's8',  text: 'Medio conflictos entre jóvenes de forma justa y respetuosa.' },
          { id: 's9',  text: 'Cuando una sesión no sale como esperaba, aprendo y ajusto la siguiente.' },
          { id: 's10', text: 'Mi servicio en SJ me motiva a servir también en otros espacios de mi vida.' },
          { id: 's11', text: 'Vivo con congruencia los valores que transmito a los jóvenes.' },
          { id: 's12', text: 'Sé por qué sirvo y cómo este servicio se conecta con mi proyecto de vida.' },
        ],
      },
      {
        id: 'apoyo', type: 'grid', required: true, escala: 'intensidad5',
        question: 'Califica el apoyo que recibiste:',
        rows: [
          { id: 'ap1', text: 'Claridad de funciones' },
          { id: 'ap2', text: 'Capacitación' },
          { id: 'ap3', text: 'Acompañamiento de mi coordinador' },
          { id: 'ap4', text: 'Comunicación del equipo' },
          { id: 'ap5', text: 'Materiales' },
          { id: 'ap6', text: 'Reconocimiento' },
          { id: 'ap7', text: 'Cuidado de mi bienestar (descanso, carga razonable)' },
        ],
      },
      { id: 'impacto', type: 'scale', required: true, escala: 'intensidad5', question: '¿En qué medida sientes que tu servicio impactó a los jóvenes que acompañaste?' },
      {
        id: 'cierre-animo', type: 'single', required: true,
        question: '¿Cómo llegas al cierre del ciclo?',
        options: ['Con más ganas que al inicio', 'Igual que al inicio', 'Cansado/a pero motivado/a', 'Agotado/a'],
      },
      {
        id: 'continuidad', type: 'single', required: true,
        question: '¿Continuarás el próximo ciclo?',
        options: ['Sí, en el mismo rol', 'Sí, en otro rol', 'Tal vez', 'No'],
      },
      {
        id: 'continuidad-porque', type: 'multi', required: false, maxSelect: 2,
        question: 'Si respondiste no o tal vez, ¿por qué?',
        options: [
          'Tiempo', 'Estudios o trabajo', 'Cambio de ciudad', 'No me sentí valorado/a',
          'No me sentí preparado/a', 'Otro',
        ],
      },
      {
        id: 'mayor-responsabilidad', type: 'single', required: true,
        question: '¿Te interesa asumir un rol de mayor responsabilidad (facilitador/a, coordinador/a)?',
        options: ['Sí', 'Quizá más adelante', 'No'],
      },
      { id: 'cambio-joven', type: 'longtext', required: false, question: 'Describe, SIN nombres, un cambio que viste en un joven este ciclo y qué papel tuvo tu servicio.' },
      { id: 'que-ayudaria', type: 'longtext', required: false, question: '¿Qué cambio o recurso te ayudaría a servir mejor el próximo ciclo?' },
    ],
  },
  {
    id: 'e4-coordinador-servidor',
    codigo: 'E4B',
    title: 'Evaluación del coordinador sobre el servidor',
    description: 'La llena el coordinador para cada servidor/a. Se compara con la autoevaluación (E4A): las diferencias grandes son el tema prioritario de la conversación 1 a 1.',
    category: 'servicio',
    applies: { tipo: ['Voluntario'], audiencia: 'coordinador' },
    estimatedMinutes: 5,
    intro: 'Escala de desempeño: 1 Insuficiente · 2 En desarrollo · 3 Competente · 4 Sobresaliente.',
    questions: [
      {
        id: 'rol', type: 'single', required: true,
        question: 'Rol durante el ciclo:',
        options: ['Servidor/a joven', 'Voluntario/a adulto/a', 'Facilitador/a o coordinador/a', 'Apoyo en eventos'],
      },
      {
        id: 'desempeno', type: 'grid', required: true, escala: 'desempeno4',
        question: 'Califica cada aspecto:',
        rows: [
          { id: 'd1', text: 'Puntualidad y asistencia' },
          { id: 'd2', text: 'Cumplimiento de tareas y compromisos' },
          { id: 'd3', text: 'Preparación de sesiones o actividades' },
          { id: 'd4', text: 'Trato y cuidado de los jóvenes (incluye protocolos de protección de menores)' },
          { id: 'd5', text: 'Trabajo en equipo con otros servidores' },
          { id: 'd6', text: 'Apertura a la retroalimentación' },
          { id: 'd7', text: 'Iniciativa y solución de problemas' },
          { id: 'd8', text: 'Congruencia con los valores de SJ' },
        ],
      },
      {
        id: 'recomendacion', type: 'single', required: true,
        question: 'Recomendación:',
        options: ['Renovar en el mismo rol', 'Promover a mayor responsabilidad', 'Renovar con plan de mejora', 'No renovar'],
      },
      { id: 'fortaleza-mejora', type: 'longtext', required: true, question: 'Principal fortaleza y un área concreta de mejora.' },
    ],
  },

  /* ───────────────────────── E5 · Graduados ───────────────────────── */
  {
    id: 'e5-graduados-secundaria',
    codigo: 'E5A',
    title: 'Evaluación de graduados · Egreso de Secundaria',
    description: 'Al concluir la etapa de secundaria: qué te llevas de SJ y qué podemos mejorar.',
    category: 'graduacion',
    nivel: 'secundaria',
    applies: { nivel: 'secundaria', tipo: ['Beneficiario'] },
    estimatedMinutes: 9,
    intro: '¡Felicidades por concluir esta etapa! Ayúdanos a saber qué te llevas y qué podemos mejorar.',
    questions: [
      ...bloqueGraduados(),
      { id: 'mensaje', type: 'longtext', required: false, question: 'Escribe un mensaje sobre lo que SJ significó para ti.' },
      {
        id: 'autorizacion', type: 'single', required: true,
        question: '¿Nos autorizas a compartirlo?',
        help: 'Por ser menor de edad, solo se usará de forma anónima salvo autorización de tu padre, madre o tutor.',
        options: ['Sí, con mi nombre', 'Sí, de forma anónima', 'No'],
      },
      { id: 'preparado-prepa', type: 'scale', required: true, escala: 'intensidad5', question: '¿Qué tan preparado/a te sientes para la prepa (nuevos amigos, presiones, más responsabilidad)?' },
      {
        id: 'cambios-familia', type: 'single', required: true,
        question: '¿Tu familia ha notado cambios en ti desde que entraste?',
        options: ['Sí, muchos', 'Algunos', 'No', 'No sé'],
      },
      { id: 'situacion-prepa', type: 'longtext', required: false, question: '¿Qué situación crees que vivirás en la prepa en la que usarás lo aprendido aquí?' },
      { id: 'consejo', type: 'longtext', required: false, question: '¿Qué consejo le darías a alguien que va a entrar a Escudería / Essencia?' },
    ],
  },
  {
    id: 'e5-graduados-prepa',
    codigo: 'E5B',
    title: 'Evaluación de graduados · Egreso de Preparatoria',
    description: 'Al concluir la prepa: qué te llevas de SJ, tu plan inmediato y qué podemos mejorar.',
    category: 'graduacion',
    nivel: 'prepa',
    applies: { nivel: 'prepa', tipo: ['Beneficiario'] },
    estimatedMinutes: 9,
    intro: '¡Felicidades por concluir la prepa! Ayúdanos a saber qué te llevas y qué podemos mejorar.',
    questions: [
      ...bloqueGraduados(),
      { id: 'mensaje', type: 'longtext', required: false, question: 'Escribe un mensaje sobre lo que SJ significó para ti.' },
      {
        id: 'autorizacion', type: 'single', required: true,
        question: '¿Nos autorizas a compartirlo?',
        help: 'Por ser menor de edad, solo se usará de forma anónima salvo autorización de tu padre, madre o tutor.',
        options: ['Sí, con mi nombre', 'Sí, de forma anónima', 'No'],
      },
      {
        id: 'plan-inmediato', type: 'single', required: true,
        question: '¿Cuál es tu plan inmediato?',
        options: ['Universidad', 'Carrera técnica', 'Trabajar', 'Estudiar y trabajar', 'Aún no decido'],
      },
      { id: 'influencia-vocacional', type: 'single', required: true, question: '¿Qué tanto influyó el programa en tu decisión vocacional?', options: ['Mucho', 'Algo', 'Nada'] },
      { id: 'preparado-universidad', type: 'scale', required: true, escala: 'intensidad5', question: '¿Qué tan preparado/a te sientes para la vida universitaria o laboral?' },
      { id: 'que-te-llevas', type: 'longtext', required: false, question: '¿Qué te llevas de MJ Prepa y cómo lo aplicarás en tu siguiente etapa?' },
    ],
  },
  {
    id: 'e5-graduados-universitarios',
    codigo: 'E5C',
    title: 'Evaluación de graduados · Egreso Universitario',
    description: 'Al cerrar la etapa universitaria: qué te llevas de SJ y cómo se refleja en tu vida profesional.',
    category: 'graduacion',
    nivel: 'universitarios',
    applies: { nivel: 'universitarios', tipo: ['Beneficiario'] },
    estimatedMinutes: 9,
    intro: '¡Felicidades por cerrar esta etapa! Tu experiencia nos ayuda a fortalecer la oferta para las siguientes generaciones.',
    questions: [
      ...bloqueGraduados(),
      { id: 'mensaje', type: 'longtext', required: false, question: 'Escribe un mensaje sobre lo que SJ significó para ti.' },
      {
        id: 'autorizacion', type: 'single', required: true,
        question: '¿Nos autorizas a compartirlo?',
        options: ['Sí, con mi nombre', 'Sí, de forma anónima', 'No'],
      },
      {
        id: 'situacion-actual', type: 'single', required: true,
        question: 'Situación actual:',
        options: [
          'Empleado/a en mi área', 'Empleado/a en otra área', 'Emprendiendo',
          'Posgrado', 'Buscando empleo', 'Otro',
        ],
      },
      {
        id: 'ayudo-empleo', type: 'single', required: true,
        question: '¿Lo vivido en SJ te ayudó a conseguir o desempeñar tu empleo o prácticas?',
        options: ['Mucho', 'Algo', 'Nada', 'Aún no aplica'],
      },
      {
        id: 'habilidades-valoradas', type: 'multi', required: false, maxSelect: 2,
        question: '¿Qué habilidades trabajadas en SJ te han valorado más en el trabajo o la escuela?',
        options: ['Comunicación', 'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas', 'Manejo de presión', 'Ética y valores'],
      },
      { id: 'reflejo', type: 'longtext', required: false, question: '¿Cómo se refleja hoy lo vivido en SJ en tus decisiones personales y profesionales? Da un ejemplo.' },
    ],
  },
];

/* ── Selección por usuario ── */

/** Nivel al que pertenece un programa, o '' si no cae en ninguno. */
export function nivelDePrograma(programa) {
  const p = (programa || '').trim();
  if (!p) return '';
  const entry = Object.entries(NIVELES).find(([, n]) => n.programas.includes(p));
  return entry ? entry[0] : '';
}

function aplica(ev, user, { incluirCoordinador = false } = {}) {
  const a = ev.applies || {};
  if (a.audiencia === 'coordinador' && !incluirCoordinador) return false;
  const tipo = user.tipoParticipante || user.tipo || 'Beneficiario';
  if (a.tipo?.length && !a.tipo.includes(tipo)) return false;
  const programa = (user.programa || '').trim();
  if (a.nivel
      && nivelDePrograma(programa) !== a.nivel
      && !(a.programasExtra || []).includes(programa)) return false;
  if (a.programa?.length && !a.programa.includes(programa)) return false;
  return true;
}

/** Evaluaciones que el propio participante responde. */
export function evaluacionesParaUsuario(user) {
  if (!user) return [];
  return EVALUACIONES.filter(ev => aplica(ev, user));
}

/** Evaluaciones que el coordinador/admin llena sobre un participante. */
export function evaluacionesDeCoordinador(user) {
  if (!user) return [];
  return EVALUACIONES.filter(
    ev => ev.applies?.audiencia === 'coordinador' && aplica(ev, user, { incluirCoordinador: true })
  );
}

/** Todas las que aplican a un usuario, las suyas y las del coordinador. */
export function todasLasEvaluaciones(user) {
  if (!user) return [];
  return EVALUACIONES.filter(ev => aplica(ev, user, { incluirCoordinador: true }));
}

export function getEvaluacion(evalId) {
  return EVALUACIONES.find(e => e.id === evalId) || null;
}

/** Número de respuestas que pide una evaluación (cada renglón de un grid cuenta). */
export function totalCampos(ev) {
  if (!ev) return 0;
  return ev.questions.reduce((n, q) => n + (q.type === 'grid' ? q.rows.length : 1), 0);
}

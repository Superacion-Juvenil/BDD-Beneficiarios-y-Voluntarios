export const CATEGORIAS = {
  diagnostico:  { label: 'Diagnóstico',  color: '#1A56A4', bg: '#E8F0FB', icon: '🧭' },
  seguimiento:  { label: 'Seguimiento',  color: '#1a7a45', bg: '#edfaf3', icon: '📈' },
  satisfaccion: { label: 'Satisfacción', color: '#8a5c00', bg: '#fffbea', icon: '💬' },
};

export const EVALUACIONES = [
  {
    id: 'diag-conociendome',
    title: 'Conociéndome',
    description: 'Cuestionario de diagnóstico inicial para conocer mejor quién eres, tus valores, intereses y metas personales.',
    category: 'diagnostico',
    applies: { tipo: ['Beneficiario'] },
    estimatedMinutes: 10,
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: '¿Cómo describirías tu carácter en tres palabras?',
        required: true,
      },
      {
        id: 'q2',
        type: 'multi',
        question: '¿Cuáles de los siguientes valores consideras más importantes en tu vida?',
        required: true,
        maxSelect: 4,
        options: ['Honestidad', 'Respeto', 'Responsabilidad', 'Empatía', 'Solidaridad', 'Disciplina', 'Creatividad', 'Lealtad'],
      },
      {
        id: 'q3',
        type: 'longtext',
        question: '¿Qué actividades o pasatiempos disfrutas más en tu tiempo libre?',
        required: false,
      },
      {
        id: 'q4',
        type: 'single',
        question: '¿Cómo describirías tu situación escolar actual?',
        required: true,
        options: ['Estudiando regularmente', 'Con algunas materias reprobadas', 'En riesgo de deserción', 'Fuera de la escuela'],
      },
      {
        id: 'q5',
        type: 'scale',
        question: 'Del 1 al 5, ¿qué tan motivado/a te sientes para lograr tus metas?',
        required: true,
      },
      {
        id: 'q6',
        type: 'longtext',
        question: '¿Cuál es tu mayor sueño o meta a largo plazo?',
        required: true,
      },
      {
        id: 'q7',
        type: 'single',
        question: '¿Cómo es tu relación con tu familia?',
        required: false,
        options: ['Muy buena', 'Buena', 'Regular', 'Difícil', 'Prefiero no responder'],
      },
      {
        id: 'q8',
        type: 'multi',
        question: '¿En qué áreas de tu vida sientes que necesitas más apoyo?',
        required: false,
        maxSelect: 3,
        options: ['Escolar', 'Emocional', 'Económica', 'Familiar', 'Salud', 'Orientación vocacional'],
      },
      {
        id: 'q9',
        type: 'longtext',
        question: '¿Hay algo más que quieras compartir sobre ti que nos ayude a apoyarte mejor?',
        required: false,
      },
    ],
  },

  {
    id: 'seg-trimestral',
    title: 'Seguimiento trimestral',
    description: 'Evaluación de seguimiento para revisar tu progreso, retos y avances durante el trimestre.',
    category: 'seguimiento',
    applies: { tipo: ['Beneficiario'] },
    estimatedMinutes: 8,
    questions: [
      {
        id: 'q1',
        type: 'scale',
        question: 'Del 1 al 5, ¿cómo evaluarías tu desempeño escolar en este trimestre?',
        required: true,
      },
      {
        id: 'q2',
        type: 'single',
        question: '¿Has cumplido con la asistencia requerida al programa este trimestre?',
        required: true,
        options: ['Sí, completamente', 'Mayormente sí', 'A veces', 'Poco', 'No he podido asistir'],
      },
      {
        id: 'q3',
        type: 'longtext',
        question: '¿Qué logros o avances personales destacarías de este trimestre?',
        required: true,
      },
      {
        id: 'q4',
        type: 'longtext',
        question: '¿Cuáles han sido los principales obstáculos o retos que enfrentaste?',
        required: false,
      },
      {
        id: 'q5',
        type: 'scale',
        question: 'Del 1 al 5, ¿qué tan apoyado/a te has sentido por el equipo del programa?',
        required: true,
      },
      {
        id: 'q6',
        type: 'multi',
        question: '¿En qué actividades del programa participaste este trimestre?',
        required: false,
        options: ['Talleres', 'Mentorías individuales', 'Actividades grupales', 'Eventos especiales', 'Formación en valores', 'Visitas domiciliarias'],
      },
      {
        id: 'q7',
        type: 'longtext',
        question: '¿Qué metas te propones para el siguiente trimestre?',
        required: true,
      },
    ],
  },

  {
    id: 'sat-semestral',
    title: 'Encuesta de satisfacción',
    description: 'Ayúdanos a mejorar compartiendo tu opinión sobre el programa y los servicios que recibes.',
    category: 'satisfaccion',
    applies: {},
    estimatedMinutes: 7,
    questions: [
      {
        id: 'q1',
        type: 'scale',
        question: 'Del 1 al 5, ¿qué tan satisfecho/a estás con el programa en general?',
        required: true,
      },
      {
        id: 'q2',
        type: 'scale',
        question: 'Del 1 al 5, ¿cómo calificarías la atención del equipo de Superación Juvenil?',
        required: true,
      },
      {
        id: 'q3',
        type: 'single',
        question: '¿Las actividades y talleres del programa han sido útiles para tu desarrollo personal?',
        required: true,
        options: ['Muy útiles', 'Útiles', 'Algo útiles', 'Poco útiles', 'No me han sido útiles'],
      },
      {
        id: 'q4',
        type: 'multi',
        question: '¿Qué aspectos del programa valoras más?',
        required: false,
        maxSelect: 3,
        options: ['El equipo de trabajo', 'Las actividades y talleres', 'El apoyo personalizado', 'El ambiente del grupo', 'Los valores que promueve', 'Las oportunidades que genera'],
      },
      {
        id: 'q5',
        type: 'longtext',
        question: '¿Qué mejorarías del programa?',
        required: false,
      },
      {
        id: 'q6',
        type: 'single',
        question: '¿Recomendarías el programa a otras personas?',
        required: true,
        options: ['Definitivamente sí', 'Probablemente sí', 'No estoy seguro/a', 'Probablemente no', 'Definitivamente no'],
      },
      {
        id: 'q7',
        type: 'scale',
        question: 'Del 1 al 5, ¿en qué medida sientes que el programa ha impactado positivamente tu vida?',
        required: true,
      },
      {
        id: 'q8',
        type: 'longtext',
        question: '¿Tienes algún comentario, sugerencia o mensaje para el equipo de Superación Juvenil?',
        required: false,
      },
    ],
  },

  {
    id: 'mj-vida-adolescente',
    title: 'Mi vida adolescente',
    description: 'Cuestionario de diagnóstico sobre tu experiencia como adolescente, tus relaciones y tu proyecto de vida.',
    category: 'diagnostico',
    applies: { programa: ['MJ Sec/Prepa'] },
    estimatedMinutes: 10,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '¿En qué nivel escolar te encuentras actualmente?',
        required: true,
        options: ['Secundaria (1°)', 'Secundaria (2°)', 'Secundaria (3°)', 'Preparatoria (1°)', 'Preparatoria (2°)', 'Preparatoria (3°)', 'Otro'],
      },
      {
        id: 'q2',
        type: 'scale',
        question: 'Del 1 al 5, ¿qué tan a gusto te sientes en tu escuela?',
        required: true,
      },
      {
        id: 'q3',
        type: 'multi',
        question: '¿Cuáles de los siguientes temas te generan más preocupación o interés actualmente?',
        required: false,
        maxSelect: 3,
        options: ['Mi desempeño escolar', 'Mis relaciones de amistad', 'Mi familia', 'Mi imagen y autoestima', 'Mi futuro y carrera', 'Las redes sociales', 'Mi salud mental'],
      },
      {
        id: 'q4',
        type: 'single',
        question: '¿Cómo describes principalmente tu círculo de amistades?',
        required: false,
        options: ['Tengo muchos amigos y me siento incluido/a', 'Tengo pocos amigos pero son de confianza', 'Me cuesta trabajo hacer amigos', 'Prefiero estar solo/a la mayor parte del tiempo'],
      },
      {
        id: 'q5',
        type: 'longtext',
        question: '¿Qué carrera, oficio o actividad te gustaría desarrollar en el futuro?',
        required: true,
      },
      {
        id: 'q6',
        type: 'scale',
        question: 'Del 1 al 5, ¿qué tan seguro/a te sientes de poder lograr tus metas?',
        required: true,
      },
      {
        id: 'q7',
        type: 'longtext',
        question: '¿Qué esperas aprender o ganar siendo parte del programa MJ?',
        required: true,
      },
    ],
  },

  {
    id: 'univ-vocacion',
    title: 'Vida universitaria y vocación',
    description: 'Diagnóstico sobre tu experiencia universitaria, tu vocación y tus planes de desarrollo profesional.',
    category: 'diagnostico',
    applies: { programa: ['MCU', 'SU'] },
    estimatedMinutes: 10,
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: '¿Qué carrera o área de estudio cursas o planeas cursar?',
        required: true,
      },
      {
        id: 'q2',
        type: 'single',
        question: '¿En qué semestre o año de tu carrera te encuentras?',
        required: false,
        options: ['Aún no ingreso a la universidad', '1° o 2° semestre', '3° o 4° semestre', '5° o 6° semestre', '7° semestre o más', 'Ya egresé'],
      },
      {
        id: 'q3',
        type: 'scale',
        question: 'Del 1 al 5, ¿qué tan identificado/a te sientes con la carrera que elegiste?',
        required: true,
      },
      {
        id: 'q4',
        type: 'multi',
        question: '¿Cuáles son tus principales motivaciones para estudiar?',
        required: true,
        maxSelect: 3,
        options: ['Superación personal', 'Apoyar a mi familia', 'Conseguir un buen empleo', 'Desarrollar mis talentos', 'Hacer una diferencia en mi comunidad', 'Por obligación o presión familiar'],
      },
      {
        id: 'q5',
        type: 'longtext',
        question: '¿Cuál es tu proyecto de vida a 5 años?',
        required: true,
      },
      {
        id: 'q6',
        type: 'single',
        question: '¿Trabajas actualmente de manera remunerada además de estudiar?',
        required: false,
        options: ['Sí, tiempo completo', 'Sí, medio tiempo', 'Sí, ocasionalmente', 'No trabajo'],
      },
      {
        id: 'q7',
        type: 'longtext',
        question: '¿Qué habilidades o conocimientos esperas desarrollar dentro del programa?',
        required: true,
      },
    ],
  },

  {
    id: 'vol-servicio',
    title: 'Evaluación del servicio voluntario',
    description: 'Evaluación de seguimiento para reflexionar sobre tu experiencia como voluntario/a y el impacto de tu servicio.',
    category: 'seguimiento',
    applies: { tipo: ['Voluntario'] },
    estimatedMinutes: 10,
    questions: [
      {
        id: 'q1',
        type: 'scale',
        question: 'Del 1 al 5, ¿qué tan satisfecho/a estás con tu experiencia como voluntario/a?',
        required: true,
      },
      {
        id: 'q2',
        type: 'multi',
        question: '¿En qué actividades de voluntariado has participado?',
        required: true,
        options: ['Talleres y formación', 'Acompañamiento a beneficiarios', 'Eventos y actividades especiales', 'Apoyo administrativo', 'Mentorías', 'Comunicación y difusión'],
      },
      {
        id: 'q3',
        type: 'scale',
        question: 'Del 1 al 5, ¿en qué medida sientes que tu servicio ha impactado positivamente a los beneficiarios?',
        required: true,
      },
      {
        id: 'q4',
        type: 'longtext',
        question: '¿Cuál ha sido tu mayor aprendizaje o crecimiento personal como voluntario/a?',
        required: true,
      },
      {
        id: 'q5',
        type: 'single',
        question: '¿Cómo calificarías la coordinación y comunicación del equipo de Superación Juvenil?',
        required: true,
        options: ['Excelente', 'Buena', 'Regular', 'Necesita mejorar', 'Deficiente'],
      },
      {
        id: 'q6',
        type: 'longtext',
        question: '¿Qué desafíos has encontrado en tu labor como voluntario/a?',
        required: false,
      },
      {
        id: 'q7',
        type: 'multi',
        question: '¿Qué recursos o apoyos te serían útiles para mejorar tu servicio?',
        required: false,
        maxSelect: 3,
        options: ['Más capacitación', 'Mayor claridad en mis funciones', 'Mejor comunicación con el equipo', 'Materiales y herramientas', 'Reconocimiento y motivación', 'Más tiempo o flexibilidad'],
      },
      {
        id: 'q8',
        type: 'longtext',
        question: '¿Tienes sugerencias para mejorar el programa de voluntariado?',
        required: false,
      },
    ],
  },
];

export function evaluacionesParaUsuario(user) {
  const tipo = user.tipoParticipante || user.tipo || 'Beneficiario';
  const programa = user.programa || '';
  return EVALUACIONES.filter(e => {
    const a = e.applies || {};
    if (a.tipo?.length && !a.tipo.includes(tipo)) return false;
    if (a.programa?.length && !a.programa.includes(programa)) return false;
    return true;
  });
}

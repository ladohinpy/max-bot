// All people, identifiers, results and offers in this file are fictional.
export const DEMO_PARENT = {
  name: 'Анна Соколова', firstName: 'Анна', initials: 'АС',
  demoId: 'DEMO-FX-2048', description: 'Родитель двух любознательных учеников',
};

export const WEEKS = [
  { label: '26 окт — 1 ноя', long: '26 октября — 1 ноября 2026', caption: 'Учебная неделя' },
  { label: '19 — 25 окт', long: '19 — 25 октября 2026', caption: 'Предыдущая неделя' },
  { label: '12 — 18 окт', long: '12 — 18 октября 2026', caption: 'Предыдущая неделя' },
];

export const CHILDREN = [
  {
    id: 'leo', name: 'Лев', fullName: 'Лев Соколов', initials: 'ЛС', grade: 3,
    color: 'orange', description: 'Любит математику и задаёт большие вопросы',
    focus: 'Уверенно разбирается с долями и учится замечать закономерности.',
    subjects: [
      { id: 'math', name: 'Математика', icon: 'math', color: 'orange' },
      { id: 'russian', name: 'Русский язык', icon: 'book', color: 'purple' },
      { id: 'english', name: 'Английский язык', icon: 'globe', color: 'blue' },
      { id: 'logic', name: 'Логика', icon: 'sparkles', color: 'green' },
    ],
    weeks: [
      { completed: 28, accuracy: 88, activeDays: 5, minutes: 146, days: [5, 7, 0, 8, 4, 4, 0], subjectResults: [12, 8, 5, 3], subjectAccuracy: [92, 85, 80, 100] },
      { completed: 23, accuracy: 83, activeDays: 4, minutes: 125, days: [4, 3, 0, 7, 0, 9, 0], subjectResults: [10, 6, 4, 3], subjectAccuracy: [90, 78, 75, 100] },
      { completed: 19, accuracy: 81, activeDays: 3, minutes: 108, days: [0, 5, 0, 8, 0, 6, 0], subjectResults: [8, 5, 4, 2], subjectAccuracy: [88, 80, 70, 100] },
    ],
    tasks: [
      { id: 'fractions', subject: 'math', title: 'Доли целого', description: 'Представляем дроби на знакомых примерах', minutes: 12, completed: false,
        question: 'Пиццу разделили на 4 равные части. Лев съел 3 части. Какую долю пиццы он съел?', options: ['Одну четверть · 1/4', 'Одну вторую · 1/2', 'Три четверти · 3/4', 'Четыре четверти · 4/4'], answer: 2, explanation: 'Знаменатель показывает все 4 равные части, а числитель — 3 съеденные части. Получается 3/4.' },
      { id: 'vowels', subject: 'russian', title: 'Проверяем гласные', description: 'Находим слово, которое помогает не ошибиться', minutes: 8, completed: false,
        question: 'Какое слово поможет проверить безударную гласную в слове «леса»?', options: ['Лесной', 'Лес', 'Лесник', 'Лесовик'], answer: 1, explanation: 'В слове «лес» гласная е стоит под ударением. Теперь в слове «леса» её можно написать уверенно.' },
      { id: 'english-world', subject: 'english', title: 'Слова вокруг нас', description: 'Собираем маленький словарь большого мира', minutes: 10, completed: true,
        question: 'Что означает английское слово «apple»?', options: ['Книга', 'Яблоко', 'Окно', 'Дерево'], answer: 1, explanation: 'Apple — яблоко. Например: I have an apple — у меня есть яблоко.' },
      { id: 'patterns', subject: 'logic', title: 'Продолжи закономерность', description: 'Ищем правило и делаем следующий шаг', minutes: 7, completed: false,
        question: 'Каждое следующее число вдвое больше предыдущего: 2, 4, 8, 16, … Какое число дальше?', options: ['18', '24', '30', '32'], answer: 3, explanation: 'Умножаем 16 на 2 и получаем 32. Правило работает для каждого шага последовательности.' },
      { id: 'creative-lab', subject: 'logic', title: 'Лаборатория вопросов', description: 'Тренируем любопытство и внимательность', minutes: 6, completed: false, expanded: true,
        question: 'Какой вопрос поможет проверить, действительно ли растение растёт быстрее на свету?', options: ['Какой цвет горшка красивее?', 'Как меняется рост двух одинаковых растений при разном освещении?', 'Как назвать растение?', 'Нравится ли ему музыка?'], answer: 1, explanation: 'Хороший исследовательский вопрос можно проверить наблюдением. Сравним одинаковые растения, изменив только освещение.' },
    ],
    achievements: [
      { id: 'first-steps', title: 'Пять уверенных шагов', category: 'study', label: 'Учёба', date: '28 октября 2026', description: 'Пять тренировочных заданий решены без спешки', icon: 'star', color: 'orange' },
      { id: 'math-explorer', title: 'Математический исследователь', category: 'olympiad', label: 'Олимпиады', date: '24 октября 2026', description: 'Участие в учебной олимпиаде по математике', icon: 'trophy', color: 'purple' },
      { id: 'steady-week', title: 'Неделя любопытства', category: 'habit', label: 'Привычки', date: '18 октября 2026', description: 'Четыре дня с занятиями в удобном ритме', icon: 'flame', color: 'green' },
    ],
  },
  {
    id: 'sofia', name: 'Софья', fullName: 'Софья Соколова', initials: 'СС', grade: 7,
    color: 'purple', description: 'Интересуется физикой и уверенно учит английский',
    focus: 'Осваивает линейные уравнения и учится объяснять решение своими словами.',
    subjects: [
      { id: 'math', name: 'Математика', icon: 'math', color: 'orange' },
      { id: 'russian', name: 'Русский язык', icon: 'book', color: 'purple' },
      { id: 'physics', name: 'Физика', icon: 'atom', color: 'blue' },
      { id: 'english', name: 'Английский язык', icon: 'globe', color: 'green' },
    ],
    weeks: [
      { completed: 36, accuracy: 93, activeDays: 5, minutes: 218, days: [6, 8, 5, 0, 10, 7, 0], subjectResults: [14, 7, 9, 6], subjectAccuracy: [93, 86, 100, 92] },
      { completed: 31, accuracy: 89, activeDays: 5, minutes: 192, days: [5, 7, 4, 0, 8, 7, 0], subjectResults: [12, 6, 8, 5], subjectAccuracy: [92, 83, 90, 90] },
      { completed: 27, accuracy: 87, activeDays: 4, minutes: 171, days: [6, 0, 8, 0, 7, 6, 0], subjectResults: [10, 6, 7, 4], subjectAccuracy: [90, 83, 86, 88] },
    ],
    tasks: [
      { id: 'linear-equations', subject: 'math', title: 'Линейные уравнения', description: 'Находим неизвестное и проверяем ответ', minutes: 15, completed: false,
        question: 'Реши уравнение: 3x + 5 = 20. Чему равен x?', options: ['3', '5', '8', '15'], answer: 1, explanation: 'Вычитаем 5 из обеих частей: 3x = 15. Делим обе части на 3: x = 5. Проверка: 3 · 5 + 5 = 20.' },
      { id: 'participle', subject: 'russian', title: 'Причастный оборот', description: 'Замечаем детали и расставляем запятые', minutes: 12, completed: false,
        question: 'В каком предложении запятые расставлены верно?', options: ['Книга, прочитанная летом, лежала на столе.', 'Книга прочитанная, летом лежала на столе.', 'Книга прочитанная летом, лежала, на столе.', 'Книга, прочитанная летом лежала на столе.'], answer: 0, explanation: 'Причастный оборот «прочитанная летом» стоит после определяемого слова «книга» и выделяется запятыми с двух сторон.' },
      { id: 'motion', subject: 'physics', title: 'Скорость движения', description: 'Связываем путь, время и скорость', minutes: 10, completed: true,
        question: 'Поезд прошёл 120 км за 2 часа. Какова его средняя скорость?', options: ['30 км/ч', '60 км/ч', '120 км/ч', '240 км/ч'], answer: 1, explanation: 'Средняя скорость равна пути, делённому на время: 120 км / 2 ч = 60 км/ч.' },
      { id: 'present-perfect', subject: 'english', title: 'Present Perfect', description: 'Говорим об опыте и результате', minutes: 9, completed: false,
        question: 'Выбери верный вариант: She … visited London twice.', options: ['have', 'is', 'has', 'was'], answer: 2, explanation: 'С местоимением she используем has: She has visited London twice. Она дважды была в Лондоне.' },
      { id: 'algorithms', subject: 'math', title: 'Логика алгоритмов', description: 'Разбираемся, когда условие истинно', minutes: 8, completed: false, expanded: true,
        question: 'Пусть x = 7. Какое условие истинно?', options: ['x < 5', 'x > 5 и x < 10', 'x = 10', 'x > 10'], answer: 1, explanation: 'Число 7 одновременно больше 5 и меньше 10. Значит, оба условия с «и» выполняются.' },
    ],
    achievements: [
      { id: 'physics-step', title: 'Физика стала ближе', category: 'study', label: 'Учёба', date: '30 октября 2026', description: 'Разобралась в новой теме и проверила знания', icon: 'atom', color: 'blue' },
      { id: 'english-olymp', title: 'Мир без границ', category: 'olympiad', label: 'Олимпиады', date: '25 октября 2026', description: 'Участие в учебной олимпиаде по английскому', icon: 'trophy', color: 'purple' },
      { id: 'five-days', title: 'Свой ритм', category: 'habit', label: 'Привычки', date: '23 октября 2026', description: 'Пять дней с занятиями в течение недели', icon: 'flame', color: 'green' },
      { id: 'algebra-path', title: 'Алгебра по плечу', category: 'study', label: 'Учёба', date: '16 октября 2026', description: 'Первый уверенный шаг в решении уравнений', icon: 'star', color: 'orange' },
    ],
  },
];

export const COURSES = [
  { id: 'math-curiosity', child: 'leo', category: 'Открываем новое', title: 'Математика с любопытством', subtitle: 'Задачи, в которых хочется разобраться', icon: 'math', color: 'orange', details: 'В этой демо-подборке собраны игровые задачи на закономерности, счёт и пространственное мышление. Можно заниматься небольшими шагами — по 15 минут.', format: '3–4 класс · практика и разборы' },
  { id: 'world-lab', child: 'leo', category: 'Пробуем и исследуем', title: 'Маленькая лаборатория', subtitle: 'Большие открытия начинаются с «почему?»', icon: 'atom', color: 'green', details: 'Демонстрационная программа о наблюдениях и простых экспериментах. Учимся задавать вопросы, строить предположения и проверять их.', format: '2–4 класс · исследовательские задания' },
  { id: 'physics-curiosity', child: 'sofia', category: 'Понимаем мир', title: 'Физика без зубрёжки', subtitle: 'От знакомого явления к понятной формуле', icon: 'atom', color: 'blue', details: 'Демо-программа помогает увидеть физику в обычной жизни: движение, давление, энергия. Каждый небольшой блок заканчивается задачей с объяснением.', format: '7–8 класс · теория и практика' },
  { id: 'english-speaking', child: 'sofia', category: 'Говорим увереннее', title: 'Английский для открытий', subtitle: 'Истории, новые слова и живые ситуации', icon: 'globe', color: 'purple', details: 'Демонстрационная подборка для работы со словарём и грамматикой. Темы связаны с путешествиями, наукой и повседневным общением.', format: '6–8 класс · чтение и грамматика' },
];

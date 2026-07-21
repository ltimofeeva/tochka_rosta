/* ============ Точка роста АйТи — логика демо-приложения (ИИ-куратор) ============ */

/* ---------- Справочник инсайтов ---------- */
const INSIGHTS = {
  promo: {
    chip: 'chip-promo', icon: '🏷️', label: 'Реагирует на акции',
    detail: 'Дважды записывался после рассылок со скидкой (март, октябрь). Средний чек растёт при спецпредложении.',
    reco: 'Вести разговор через выгоду: акция −15% на завершение плана до конца месяца.',
    objections: [
      ['«Дорого»', 'Сейчас действует −15% на завершение плана — это заметно меньше, чем лечение осложнения потом.'],
      ['«Я подумаю»', 'Акция до конца месяца. Могу забронировать время без предоплаты — не подойдёт, просто отменим.']
    ]
  },
  credit: {
    chip: 'chip-credit', icon: '💳', label: 'Важна рассрочка',
    detail: 'Оба крупных лечения оплачивал в рассрочку на 6 месяцев. Отложил протезирование после озвучивания полной цены.',
    reco: 'Не называть полную сумму сразу — сначала рассрочка 0% и платёж в месяц.',
    objections: [
      ['«Дорого сразу»', 'Можно в рассрочку 0% на 6 месяцев без первого взноса — получается от 5 300 ₽ в месяц.'],
      ['«Не уверена»', 'Запишу на бесплатную консультацию — врач покажет варианты по стоимости, решение потом.']
    ]
  },
  care: {
    chip: 'chip-care', icon: '💚', label: 'Ценит заботу и врача',
    detail: 'Ходит только к «своему» врачу, оставил благодарный отзыв. Реагирует на личное внимание, а не на скидки.',
    reco: 'Звонить от имени лечащего врача, без продающих формулировок.',
    objections: [
      ['«Я подумаю»', 'Доктор сам просил связаться — он следит за вашим результатом. Приём без навязывания: осмотр и ответы на вопросы.'],
      ['«Переживаю»', 'Доктор всё делает аккуратно, вы же его знаете. В этот визит — только посмотреть и обсудить план.']
    ]
  },
  evening: {
    chip: 'chip-evening', icon: '🌙', label: 'Записывается на вечер',
    detail: 'Все визиты — после 18:00, дважды переносил дневные записи. Работает в графике 5/2.',
    reco: 'Сразу предлагать конкретные вечерние окна, дневные не озвучивать.',
    objections: [
      ['«Нет времени»', 'Есть окна после 19:00 — четверг 19:30 или пятница 20:00, приём займёт полчаса.'],
      ['«Позвоните позже»', 'Могу поставить бронь на вечер и напомнить накануне — если не получится, перенесём.']
    ]
  },
  family: {
    chip: 'chip-family', icon: '👨‍👩‍👧', label: 'Семейный пациент',
    detail: 'Приводит двоих детей, муж лечится в этой же клинике. Реагирует на семейные предложения.',
    reco: 'Предлагать совместный визит с детьми и семейную программу.',
    objections: [
      ['«Некогда, дети»', 'Можно совместить: вам приём, дочке в это же время плановый осмотр — по семейной программе бесплатно.'],
      ['«Дорого на всех»', 'По семейной программе скидка 10% каждому члену семьи, и визиты можно ставить в один день.']
    ]
  }
};

/* ---------- Статусы контакта ---------- */
const STATUSES = {
  booked:   { cls: 'st-booked',   icon: '✅', label: 'Записался' },
  callback: { cls: 'st-callback', icon: '📅', label: 'Перезвонить' },
  noanswer: { cls: 'st-noanswer', icon: '📵', label: 'Не дозвонились' },
  refused:  { cls: 'st-refused',  icon: '❌', label: 'Отказ' },
  wrong:    { cls: 'st-wrong',    icon: '⚠️', label: 'Неверный номер' }
};

/* ---------- Пациенты (демо-данные) ---------- */
const PATIENTS = [
  {
    id: 1, name: 'Анна Смирнова', initials: 'АС', phone: '+7 912 345-67-89',
    lastVisit: '14.03.2026', daysAgo: 128, planSum: '32 000 ₽', prio: 'high',
    treat: 'Пломба на 3.6 поставлена, <b>рекомендована коронка — не записалась</b>',
    treatFull: 'Лечение кариеса 3.6 завершено 14.03.2026. Врач рекомендовал коронку — без неё высок риск скола стенки. Запись на протезирование не создана.',
    insight: 'credit',
    visits: [
      ['14.03.2026', 'Лечение кариеса 3.6, пломба', 'оплата в рассрочку 6 мес.'],
      ['02.02.2026', 'Консультация + план протезирования', 'от коронки отказалась: «дорого сразу»'],
      ['11.09.2025', 'Лечение пульпита 4.5', 'оплата в рассрочку 6 мес.'],
      ['15.04.2025', 'Профгигиена', 'оплата картой']
    ],
    reason: 'Напомнить о коронке на 3.6 — через рассрочку 0%',
    argument: 'Коронку можно оформить в рассрочку 0% на 6 месяцев — без первого взноса, получается от 5 300 ₽ в месяц.',
    status: { type: 'booked', detail: 'Записана на 24.07, 10:30 · протезирование', comment: 'Согласилась сразу, как услышала про рассрочку' }
  },
  {
    id: 2, name: 'Дмитрий Волков', initials: 'ДВ', phone: '+7 926 118-22-40',
    lastVisit: '27.04.2026', daysAgo: 84, planSum: '46 000 ₽', prio: 'high',
    treat: 'Пролечено 2 кариеса из 4, <b>визиты по плану прерваны</b>',
    treatFull: 'По плану лечения — 4 кариеса. Пролечены зубы 1.5 и 1.6, на 2.4 и 2.5 пациент не записался. Последний визит 27.04.2026.',
    insight: 'promo',
    visits: [
      ['27.04.2026', 'Лечение кариеса 1.6', 'запись по акции из рассылки'],
      ['12.04.2026', 'Лечение кариеса 1.5', 'оплата наличными'],
      ['29.03.2026', 'Диагностика: план на 4 зуба', 'пришёл по акции «бесплатная диагностика»'],
      ['10.10.2025', 'Профгигиена по акции −20%', 'запись после SMS-рассылки']
    ],
    reason: 'Завершить план лечения: осталось 2 кариеса из 4',
    argument: 'До конца месяца действует скидка 15% на завершение плана лечения — два зуба можно закрыть за один визит.',
    status: null
  },
  {
    id: 3, name: 'Мария Ковальчук', initials: 'МК', phone: '+7 903 777-51-12',
    lastVisit: '05.02.2026', daysAgo: 165, planSum: '95 000 ₽', prio: 'high',
    treat: 'Удаление 4.6 выполнено, <b>имплантация отложена</b>',
    treatFull: 'Зуб 4.6 удалён 05.02.2026. Врач рекомендовал имплантацию в течение 3–6 месяцев, пока не началась убыль кости. Пациентка взяла паузу «подумать».',
    insight: 'care',
    visits: [
      ['05.02.2026', 'Удаление 4.6 (д-р Гусев)', 'оставила отзыв 5★ о враче'],
      ['20.01.2026', 'Острая боль, консультация д-ра Гусева', 'пришла по рекомендации подруги'],
      ['03.06.2025', 'Профгигиена (просила к д-ру Гусеву)', 'оплата картой']
    ],
    reason: 'Имплантация 4.6 — окно 3–6 мес. закрывается',
    argument: 'Звонок от имени доктора Гусева: он следит за результатом и хотел бы сам посмотреть, пока кость не начала убывать. Без спешки и навязывания.',
    status: null
  },
  {
    id: 4, name: 'Игорь Романов', initials: 'ИР', phone: '+7 917 604-93-25',
    lastVisit: '19.05.2026', daysAgo: 62, planSum: '18 000 ₽', prio: 'mid',
    treat: 'Каналы 2.6 пролечены, <b>не пришёл на постоянную пломбу</b>',
    treatFull: 'Эндодонтическое лечение 2.6 завершено 19.05.2026, стоит временная пломба. Постоянная реставрация требовалась через 2–3 недели — записи нет.',
    insight: 'evening',
    visits: [
      ['19.05.2026', 'Лечение каналов 2.6, визит 19:30', 'оплата картой'],
      ['12.05.2026', 'Лечение каналов 2.6, визит 20:00', 'перенёс дневную запись на вечер'],
      ['05.05.2026', 'Острая боль, приём 19:00', 'оплата картой']
    ],
    reason: 'Заменить временную пломбу на постоянную',
    argument: 'Сразу предложить вечерние окна: четверг 19:30 или пятница 20:00 — приём займёт полчаса.',
    status: { type: 'noanswer', detail: 'Попытка 1 из 3 · автоповтор 22.07', comment: '' }
  },
  {
    id: 5, name: 'Ольга Белова', initials: 'ОБ', phone: '+7 921 458-30-77',
    lastVisit: '30.01.2026', daysAgo: 171, planSum: '28 000 ₽', prio: 'mid',
    treat: 'Брекеты: <b>пропущены 2 плановые коррекции</b>',
    treatFull: 'Ортодонтическое лечение с 09.2025. Коррекции нужны каждые 4–6 недель, последний визит 30.01.2026 — пропущены две активации. Лечение фактически остановлено.',
    insight: 'family',
    visits: [
      ['30.01.2026', 'Активация брекет-системы', 'приходила с дочкой (осмотр)'],
      ['15.12.2025', 'Активация брекет-системы', 'записала мужа на гигиену'],
      ['28.09.2025', 'Установка брекет-системы', 'семейная скидка 10%']
    ],
    reason: 'Возобновить коррекции брекетов — пауза 5 месяцев',
    argument: 'Предложить совместить: ей коррекция, дочке в это же время плановый осмотр по семейной программе — бесплатно.',
    status: null
  },
  {
    id: 6, name: 'Сергей Мельник', initials: 'СМ', phone: '+7 909 233-18-64',
    lastVisit: '22.04.2026', daysAgo: 89, planSum: '14 000 ₽', prio: 'mid',
    treat: 'Профгигиена сделана, <b>лечение 2 кариесов не начато</b>',
    treatFull: 'На профгигиене 22.04.2026 выявлены кариесы 3.4 и 3.5. Пациент сказал «запишусь позже» — записи нет.',
    insight: 'promo',
    visits: [
      ['22.04.2026', 'Профгигиена, найдено 2 кариеса', 'пришёл по акции −20%'],
      ['18.11.2025', 'Профгигиена по акции', 'запись после рассылки']
    ],
    reason: 'Начать лечение 2 кариесов, найденных на гигиене',
    argument: 'Спецпредложение −15% на лечение обоих зубов при записи до конца месяца — один визит.',
    status: { type: 'callback', detail: 'Просил перезвонить сегодня в 15:00', comment: 'Был на совещании, сам предложил время' }
  },
  {
    id: 7, name: 'Наталья Крылова', initials: 'НК', phone: '+7 915 872-46-01',
    lastVisit: '11.03.2026', daysAgo: 131, planSum: '6 000 ₽', prio: 'mid',
    treat: 'Съёмный протез: <b>не пришла на коррекцию и осмотр</b>',
    treatFull: 'Протез установлен 11.03.2026. Плановая коррекция через 2 недели и контрольный осмотр через 3 месяца не состоялись.',
    insight: 'care',
    visits: [
      ['11.03.2026', 'Установка съёмного протеза (д-р Орлова)', 'оплата в 2 этапа'],
      ['20.02.2026', 'Примерка, подгонка', 'просила «только к Орловой»'],
      ['28.12.2025', 'Снятие слепков', 'оплата картой']
    ],
    reason: 'Пригласить на бесплатную коррекцию протеза',
    argument: 'Звонок от имени доктора Орловой: осмотр и подгонка бесплатны — это часть её лечения.',
    status: null
  },
  {
    id: 8, name: 'Лидия Фомина', initials: 'ЛФ', phone: '+7 906 552-89-33',
    lastVisit: '02.03.2026', daysAgo: 140, planSum: '22 000 ₽', prio: 'mid',
    treat: 'Лечение кариеса начато, <b>1 визит из 3 — дальше не пришла</b>',
    treatFull: 'План на 3 зуба, пролечен один (02.03.2026). Дальнейшие записи отменены без переноса.',
    insight: 'care',
    visits: [
      ['02.03.2026', 'Лечение кариеса 1.4', 'оплата картой'],
      ['14.02.2026', 'Диагностика, план на 3 зуба', 'оплата картой']
    ],
    reason: 'Продолжить план лечения — 2 зуба из 3',
    argument: 'Мягко узнать причину паузы, предложить продолжить у того же врача.',
    status: { type: 'refused', detail: 'Лечится в другой клинике · исключена из обзвона до 01.2027', comment: 'Переехала в другой район, вернуться не готова' }
  },
  {
    id: 9, name: 'Пётр Соколов', initials: 'ПС', phone: '+7 925 410-77-19',
    lastVisit: '28.05.2026', daysAgo: 53, planSum: '120 000 ₽', prio: 'high',
    treat: 'Консультация по имплантации пройдена, <b>план не начат</b>',
    treatFull: 'Консультация 28.05.2026, составлен план имплантации на 120 000 ₽. Пациент взял паузу после озвучивания стоимости.',
    insight: 'credit',
    visits: [
      ['28.05.2026', 'Консультация по имплантации', 'план 120 000 ₽ — взял паузу'],
      ['10.03.2026', 'Лечение кариеса 4.4', 'оплата в рассрочку 4 мес.']
    ],
    reason: 'Запустить план имплантации через рассрочку',
    argument: 'Имплантацию можно разбить на этапы и оформить рассрочку 0% — первый этап от 9 800 ₽ в месяц.',
    status: { type: 'booked', detail: 'Записан на 23.07, 18:00 · 1-й этап', comment: 'Выбрал рассрочку на 12 месяцев' }
  }
];


/* ---------- Персональные сообщения (генерирует ИИ) ---------- */
const MESSAGES = {
  1: 'Анна, здравствуйте! Это стоматология «Дента+». Доктор Орлова напоминает: после лечения зуба 3.6 важно поставить коронку — без неё зуб может не выдержать нагрузку. {Сейчас коронку можно оформить в рассрочку 0% на 6 месяцев — без первого взноса и переплат.} Подобрать удобное время на этой неделе?',
  2: 'Дмитрий, добрый день! Стоматология «Дента+». У вас пролечены 2 зуба из 4 по плану — осталось два небольших кариеса, лучше закрыть их, пока они не выросли в пульпит. {До конца месяца для вас действует скидка 15% на завершение плана лечения.} Записать вас на удобный день?',
  3: 'Мария, здравствуйте! Это «Дента+», пишем от доктора Гусева. Прошло почти полгода после удаления зуба — сейчас самое подходящее время для имплантации, {дальше кость в этом месте начнёт убывать, и лечение станет сложнее. Доктор хотел бы сам посмотреть вас и спокойно обсудить варианты — без спешки и навязывания.} Подберём удобное время?',
  4: 'Игорь, добрый вечер! Стоматология «Дента+». После лечения каналов у вас стоит временная пломба — её пора заменить на постоянную, иначе зуб может треснуть. {Есть вечерние окна: четверг 19:30 или пятница 20:00 — как вам удобно.} Забронировать одно из них?',
  5: 'Ольга, здравствуйте! «Дента+». Ваши брекеты ждут коррекции — прошло уже 5 месяцев, без активации лечение затягивается и результат «откатывается». {Можем совместить: вы на коррекцию, а дочке в это же время сделаем плановый осмотр — по семейной программе он бесплатный.} Подобрать время, удобное для вас двоих?',
  6: 'Сергей, добрый день! Стоматология «Дента+». Весной на гигиене мы нашли два небольших кариеса — сейчас их лечение займёт один визит и минимум затрат, дальше будет дороже. {Для вас действует спецпредложение: −15% на лечение обоих зубов при записи до конца месяца.} Подобрать удобный день?',
  7: 'Наталья Петровна, здравствуйте! Это «Дента+», от доктора Орловой. Доктор интересуется, как вы привыкли к протезу — обычно через пару месяцев нужна небольшая коррекция, чтобы ничего не натирало. {Осмотр и подгонка для вас бесплатны — это часть вашего лечения.} Когда вам было бы удобно заглянуть?',
  8: 'Лидия, здравствуйте! Это «Дента+». У вас начат план лечения — пролечен один зуб из трёх. {Доктор готов продолжить в удобном для вас темпе — без спешки, каждый визит около часа.} Подобрать время?',
  9: 'Пётр, добрый день! Стоматология «Дента+». По вашему плану имплантации есть хорошая новость: {первый этап можно оформить в рассрочку 0% — от 9 800 ₽ в месяц, без первого взноса.} Записать вас на старт лечения?'
};
PATIENTS.forEach(p => { p.message = MESSAGES[p.id]; });

/* возражения, общие для всех сценариев */
const COMMON_OBJECTIONS = [
  ['«Мне ничего не мешает»', 'Пока не болит — лечение проще и в разы дешевле. Именно поэтому врач просил связаться заранее, а не когда заболит.'],
  ['«Перезвоните позже»', 'Конечно. Когда удобно? Зафиксирую время — система напомнит позвонить именно в этот момент.']
];

/* ---------- Утилиты ---------- */
const $ = (sel) => document.querySelector(sel);
const byId = (id) => PATIENTS.find(p => p.id === id);
const nb = (s) => s.replace(/ /g, '\u00A0');

const PRIO_LABEL = { high: 'Высокий', mid: 'Средний' };

function fmtToday() {
  return new Date().toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

function statusChip(st) {
  const s = STATUSES[st.type];
  return `<span class="status-chip ${s.cls}">${s.icon} ${s.label}<br><small>${st.detail}</small></span>`;
}

function actionCell(p) {
  return p.status
    ? statusChip(p.status)
    : `<button class="p-action" data-id="${p.id}"><img src="assets/icons/doc.png" alt="">Открыть карточку</button>`;
}

/* ---------- Переключение экранов ---------- */
document.querySelectorAll('.side-link[data-screen]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $('#screen-' + link.dataset.screen).classList.remove('hidden');
    document.querySelector('.main').classList.toggle('main-wide', link.dataset.screen === 'channels');
    window.scrollTo(0, 0);
  });
});

/* ---------- Экран «Мой день» ---------- */
function renderTasks() {
  const pending = PATIENTS.filter(p => !p.status);
  const callback = PATIENTS.filter(p => p.status && p.status.type === 'callback');
  const done = PATIENTS.filter(p => p.status && p.status.type !== 'callback');

  $('#navTaskCount').textContent = pending.length + callback.length;

  $('#taskListPending').innerHTML = pending
    .sort((a, b) => (a.prio === 'high' ? -1 : 1) - (b.prio === 'high' ? -1 : 1))
    .map(p => taskRow(p, `<span class="prio prio-${p.prio}">${PRIO_LABEL[p.prio]}<br>${nb(p.planSum)}</span>`)).join('');

  $('#taskListCallback').innerHTML = callback
    .map(p => taskRow(p, `<span class="prio prio-time">15:00</span>`)).join('');

  $('#taskListDone').innerHTML = done
    .map(p => taskRow(p, `<span class="prio prio-${p.prio}">${PRIO_LABEL[p.prio]}<br>${nb(p.planSum)}</span>`, true)).join('');

  document.querySelectorAll('.task-list .p-action').forEach(btn =>
    btn.addEventListener('click', () => openCard(byId(+btn.dataset.id))));
}

function taskRow(p, firstCell, isDone = false) {
  const ins = INSIGHTS[p.insight];
  return `
    <div class="task-row ${isDone ? 'task-done-row' : ''}">
      ${firstCell}
      <div class="task-person">
        <div class="p-avatar">${p.initials}</div>
        <div>
          <div class="p-name">${p.name}</div>
          <div class="p-meta">${p.phone}</div>
        </div>
      </div>
      <div class="task-reason">${p.reason}</div>
      <div><span class="insight-chip ${ins.chip}">${ins.icon} ${ins.label}</span></div>
      <div>${actionCell(p)}</div>
    </div>`;
}

/* ---------- Экран «Анализ картотеки» ---------- */
function renderPatients() {
  const list = $('#patientList');
  list.innerHTML = '';
  PATIENTS.forEach((p, i) => {
    const ins = INSIGHTS[p.insight];
    const row = document.createElement('div');
    row.className = 'patient-row';
    row.style.animationDelay = (i * 0.08) + 's';
    row.innerHTML = `
      <div class="p-avatar">${p.initials}</div>
      <div>
        <div class="p-name">${p.name}</div>
        <div class="p-meta">был(а) ${p.lastVisit} · ${p.daysAgo} дн. назад · план ${nb(p.planSum)}</div>
      </div>
      <div class="p-treat">${p.treat}</div>
      <div><span class="insight-chip ${ins.chip}">${ins.icon} ${ins.label}</span></div>
      <div class="p-cell-action">${actionCell(p)}</div>
    `;
    const btn = row.querySelector('.p-action');
    if (btn) btn.addEventListener('click', () => openCard(p));
    list.appendChild(row);
  });
}

document.querySelectorAll('.preset').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const months = +btn.dataset.months;
    const to = new Date('2026-06-30');
    const from = new Date(to);
    from.setMonth(from.getMonth() - months);
    $('#dateFrom').value = from.toISOString().slice(0, 10);
    $('#dateTo').value = to.toISOString().slice(0, 10);
  });
});

const LOG_LINES = [
  'Данные из МИС получены по API: 248 пациентов за период',
  'Сверены планы лечения и фактические визиты',
  'Исключены пациенты, обработанные ранее: 4',
  'Найдено незаконченное лечение: 31 пациент',
  'Проанализированы визиты, оплаты и отклики — готовы инсайты и сценарии звонков'
];

$('#btnAnalyze').addEventListener('click', () => {
  $('#periodPanel').classList.add('hidden');
  $('#resultsPanel').classList.add('hidden');
  $('#analyzePanel').classList.remove('hidden');

  const fill = $('#progressFill');
  const log = $('#analyzeLog');
  log.innerHTML = '';
  fill.style.width = '0%';

  LOG_LINES.forEach((line, i) => {
    setTimeout(() => {
      fill.style.width = ((i + 1) / LOG_LINES.length * 100) + '%';
      const div = document.createElement('div');
      div.textContent = line;
      log.appendChild(div);
    }, 650 * i + 400);
  });

  setTimeout(() => {
    $('#analyzePanel').classList.add('hidden');
    $('#periodPanel').classList.remove('hidden');
    $('#resultsPanel').classList.remove('hidden');
    renderPatients();
  }, 650 * LOG_LINES.length + 1100);
});

/* ---------- Карточка пациента ---------- */
let typingTimer = null;
let currentPatient = null;
let selectedOutcome = null;

const renderMsg = (raw) => raw.replace('{', '<mark>').replace('}', '</mark>');

function openCard(p) {
  currentPatient = p;
  selectedOutcome = null;
  const ins = INSIGHTS[p.insight];

  $('#dAvatar').textContent = p.initials;
  $('#dName').textContent = p.name;
  $('#dPhone').textContent = p.phone + ' · последний визит ' + p.lastVisit + ' · план лечения ' + nb(p.planSum);
  $('#dHeadChip').innerHTML = `<span class="insight-chip ${ins.chip}">${ins.icon} ${ins.label}</span>`;
  $('#dTreat').textContent = p.treatFull;
  $('#dVisits').innerHTML = p.visits.map(v =>
    `<li><span>${v[0]}</span> — ${v[1]} <em>· ${v[2]}</em></li>`).join('');
  $('#dInsight').innerHTML = `
    <span class="insight-chip ${ins.chip}">${ins.icon} ${ins.label}</span>
    <p>${ins.detail}</p>
    <p><b>Рекомендация ИИ:</b> ${ins.reco}</p>`;

  document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('selected'));
  $('#outcomeComment').value = '';
  $('#sentNote').classList.add('hidden');
  $('#btnSaveOutcome').disabled = false;

  $('#pmodal').classList.remove('hidden');
  $('#pmodal').scrollTop = 0;

  typeMessage(renderMsg(p.message));
}

/* эффект «ИИ печатает сообщение» — по словам, не ломая <mark> */
function typeMessage(html) {
  const box = $('#dMessage');
  clearInterval(typingTimer);
  box.innerHTML = '';
  box.classList.add('typing-caret');
  const tokens = html.split(/(<mark>|<\/mark>| )/).filter(t => t !== '');
  let i = 0, acc = '';
  typingTimer = setInterval(() => {
    acc += tokens[i];
    box.innerHTML = acc;
    i++;
    if (i >= tokens.length) {
      clearInterval(typingTimer);
      box.classList.remove('typing-caret');
    }
  }, 38);
}

function closeCard() {
  clearInterval(typingTimer);
  closeScript();
  $('#pmodal').classList.add('hidden');
}

/* ---------- Сценарий звонка: боковая панель с воронкой ---------- */
function openScript() {
  if (!currentPatient) return;
  const p = currentPatient;
  const ins = INSIGHTS[p.insight];
  $('#scriptPatient').textContent = p.name + ' · инсайт: ' + ins.label.toLowerCase();

  const objections = [...ins.objections, ...COMMON_OBJECTIONS].map(o =>
    `<div class="script-obj"><b>${o[0]}</b> — ${o[1]}</div>`).join('');

  $('#dScript').innerHTML = `
    <div class="funnel-step">
      <div class="funnel-num">1</div>
      <div class="funnel-body">
        <div class="funnel-label">Установление контакта</div>
        <div class="funnel-text">«${p.name.split(' ')[0]}, здравствуйте! Это Елена, стоматология “Дента+”. Удобно говорить пару минут?»</div>
        <div class="funnel-goal">Цель этапа: получить 2 минуты внимания, доброжелательный тон</div>
      </div>
    </div>
    <div class="funnel-step">
      <div class="funnel-num">2</div>
      <div class="funnel-body">
        <div class="funnel-label">Повод звонка — актуализация проблемы</div>
        <div class="funnel-text">${p.reason}. Объяснить простыми словами, что будет, если отложить (медицинский аргумент из плана лечения).</div>
        <div class="funnel-goal">Цель этапа: пациент понял, почему важно не откладывать</div>
      </div>
    </div>
    <div class="funnel-step key">
      <div class="funnel-num">3</div>
      <div class="funnel-body">
        <div class="funnel-label">Предложение — под инсайт пациента</div>
        <div class="funnel-text"><mark>${p.argument}</mark></div>
        <div class="funnel-goal">Цель этапа: интерес — аргумент подобран ИИ по истории пациента</div>
      </div>
    </div>
    <div class="funnel-step">
      <div class="funnel-num">4</div>
      <div class="funnel-body">
        <div class="funnel-label">Работа с возражениями</div>
        ${objections}
      </div>
    </div>
    <div class="funnel-step close-step">
      <div class="funnel-num">5</div>
      <div class="funnel-body">
        <div class="funnel-label">Закрытие на запись</div>
        <div class="funnel-text">Предложить два конкретных окна на этой неделе — «вам удобнее в четверг в 17:00 или в субботу в 11:00?» — и записать. Подтвердить SMS-напоминанием.</div>
        <div class="funnel-goal">Если запись не состоялась — зафиксировать итог и договорённость о следующем шаге</div>
      </div>
    </div>`;

  $('#scriptBackdrop').classList.remove('hidden');
  $('#scriptDrawer').classList.remove('hidden');
  $('#scriptDrawer').scrollTop = 0;
}

function closeScript() {
  $('#scriptDrawer').classList.add('hidden');
  $('#scriptBackdrop').classList.add('hidden');
}

$('#drawerClose').addEventListener('click', closeCard);
$('#btnScript').addEventListener('click', openScript);
$('#scriptClose').addEventListener('click', closeScript);
$('#scriptBackdrop').addEventListener('click', closeScript);

$('#btnCopy').addEventListener('click', () => {
  navigator.clipboard && navigator.clipboard.writeText($('#dMessage').innerText);
  $('#btnCopy').textContent = '✓ Скопировано';
  setTimeout(() => { $('#btnCopy').textContent = 'Копировать'; }, 1600);
});

/* ---------- Итог звонка ---------- */
document.querySelectorAll('.outcome-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedOutcome = btn.dataset.oc;
  });
});

const OUTCOME_DETAILS = {
  booked: 'Записан(а) · дата уточнена по телефону',
  callback: 'Просил(а) перезвонить в другое время',
  noanswer: 'Попытка 1 из 3 · автоповтор через 2 дня',
  refused: 'Исключён(а) из обзвона на 6 месяцев',
  wrong: 'Номер помечен для обновления в МИС'
};

$('#btnSaveOutcome').addEventListener('click', () => {
  if (!selectedOutcome || !currentPatient) return;
  currentPatient.status = {
    type: selectedOutcome,
    detail: OUTCOME_DETAILS[selectedOutcome],
    comment: $('#outcomeComment').value
  };
  $('#sentNote').classList.remove('hidden');
  $('#btnSaveOutcome').disabled = true;

  if (selectedOutcome === 'booked') {
    $('#statBooked').textContent = +$('#statBooked').textContent + 1;
  }
  $('#statCalled').textContent = +$('#statCalled').textContent + 1;

  renderTasks();
  renderPatients();
});

/* ---------- Дашборд руководителя: графики ---------- */
function renderCharts() {
  const rev = [['Фев', 180], ['Мар', 320], ['Апр', 540], ['Май', 760], ['Июн', 980], ['Июл', 1240]];
  const max = 1300;
  $('#revChart').innerHTML = rev.map(([m, v], i) => `
    <div class="bar-col" title="${m}: ${v} тыс ₽">
      ${i === rev.length - 1 ? `<div class="bar-val">${v}</div>` : ''}
      <div class="bar ${i === rev.length - 1 ? 'bar-current' : ''}" style="height:${Math.round(v / max * 100)}%"></div>
      <div class="bar-month">${m}</div>
    </div>`).join('');

  const refuse = [
    ['Дорого', 38], ['Лечится в другом месте', 27], ['Переезд', 18], ['Нет времени', 11], ['Прочее', 6]
  ];
  $('#refuseChart').innerHTML = refuse.map(([label, v]) => `
    <div class="hbar-row">
      <div>${label}</div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${v / 40 * 100}%"></div></div>
      <div class="hbar-val">${v}%</div>
    </div>`).join('');
}

/* ---------- Интеграция: кнопка синхронизации ---------- */
$('#btnSync').addEventListener('click', () => {
  const btn = $('#btnSync');
  btn.disabled = true;
  btn.innerHTML = '<img src="assets/icons/bolt.png" alt="">Синхронизация…';
  setTimeout(() => {
    btn.innerHTML = '<img src="assets/icons/check.png" alt="">Готово · 41 обновление';
    const row = document.createElement('tr');
    row.innerHTML = '<td>20.07.2026 (сейчас)</td><td><span class="ok-chip">успешно</span></td><td>41 обновление</td><td>2 новые задачи</td>';
    $('#syncLog').prepend(row);
  }, 1800);
});

/* ============ Умный помощник 24/7: инбокс диалогов ============ */
const CHANNELS = {
  tg:  { label: 'Telegram', cls: 'ch-tg' },
  max: { label: 'MAX', cls: 'ch-max' },
  web: { label: 'Сайт', cls: 'ch-web' }
};
const DSTATUS = {
  'bot':        { cls: 'ds-bot',    label: '🤖 Бот отвечает' },
  'bot-booked': { cls: 'ds-booked', label: '✅ Бот записал' },
  'need-admin': { cls: 'ds-need',   label: '⚠️ Нужен админ' },
  'admin':      { cls: 'ds-taken',  label: '👩 Ведёт админ' },
  'closed':     { cls: 'ds-closed', label: '✓ Закрыт ботом' }
};

const DIALOGS = [
  {
    id: 'd1', channel: 'tg', patientId: 3, initials: 'МК', name: 'Мария Ковальчук',
    status: 'bot-booked', time: '12:41', unread: false,
    preview: 'Готово! Записала вас на 24.07…',
    next: '24.07.2026, 15:00 · д-р Гусев · консультация по имплантации',
    history: [
      ['Сегодня', 'Telegram', 'запись на консультацию (бот)'],
      ['05.02.2026', 'Звонок', 'удаление 4.6'],
      ['20.01.2026', 'Telegram', 'вопрос об острой боли (бот)']
    ],
    messages: [
      { from: 'patient', text: 'Здравствуйте! Хочу записаться на имплантацию, сколько это будет стоить?', time: '12:36' },
      { from: 'bot', text: 'Здравствуйте, Мария! 😊 Рады снова вас видеть. Консультация с 3D-снимком — бесплатно, имплант «под ключ» — от 45 000 ₽. Записать вас на бесплатную консультацию к доктору Гусеву?', time: '12:37' },
      { from: 'patient', text: 'Да, давайте', time: '12:39' },
      { from: 'bot', text: 'На этой неделе есть окна: четверг 15:00 или суббота 11:00. Какое удобнее?', time: '12:39' },
      { from: 'patient', text: 'Четверг', time: '12:40' },
      { from: 'bot', text: 'Готово! ✅ Записала вас на 24.07 в 15:00 к доктору Гусеву — консультация по имплантации. Пришлю напоминание за день. До встречи!', time: '12:41' },
      { from: 'system', kind: 'booked', text: '🤖 Запись создана в МИС · 24.07.2026 15:00 · Гусев А. В. · Консультация' }
    ]
  },
  {
    id: 'd2', channel: 'web', patientId: null, initials: '?', name: 'Посетитель сайта',
    status: 'need-admin', time: '12:38', unread: true,
    preview: 'Можно ли импланты при диабете и остеопорозе?',
    messages: [
      { from: 'patient', text: 'Здравствуйте! Можно ли ставить импланты при диабете 2 типа и остеопорозе?', time: '12:37' },
      { from: 'bot', text: 'Здравствуйте! Спасибо за вопрос. При диабете и остеопорозе имплантация возможна, но требует оценки врача — важно учесть показатели и препараты, которые вы принимаете. Подключаю администратора, чтобы подобрать доктора и всё корректно рассказать. Один момент 🙌', time: '12:38' },
      { from: 'system', kind: 'need', text: '⚠️ Сложный медицинский вопрос — бот запросил передачу администратору' }
    ]
  },
  {
    id: 'd3', channel: 'max', patientId: 2, initials: 'ДВ', name: 'Дмитрий Волков',
    status: 'bot', time: '11:58', unread: false,
    preview: 'Свободно окно сегодня в 18:30…',
    next: 'нет активной записи',
    history: [
      ['Сегодня', 'MAX', 'острая боль (бот)'],
      ['27.04.2026', 'Приём', 'лечение кариеса 1.6']
    ],
    messages: [
      { from: 'patient', text: 'Здравствуйте, разболелся зуб слева сверху, можно сегодня попасть?', time: '11:56' },
      { from: 'bot', text: 'Дмитрий, здравствуйте! Понимаю, острая боль — это неприятно, поможем сегодня. Есть неотложное окно в 18:30 к доктору Орловой. Успеете подъехать?', time: '11:58' }
    ]
  },
  {
    id: 'd4', channel: 'max', patientId: 4, initials: 'ИР', name: 'Игорь Романов',
    status: 'bot-booked', time: '10:12', unread: false,
    preview: 'Перенесла на 25.07 20:00 ✅',
    next: '25.07.2026, 20:00 · д-р Орлова · постоянная пломба 2.6',
    history: [
      ['Сегодня', 'MAX', 'перенос записи (бот)'],
      ['19.05.2026', 'Приём', 'лечение каналов 2.6']
    ],
    messages: [
      { from: 'patient', text: 'Можно перенести мою запись с четверга на пятницу?', time: '10:10' },
      { from: 'bot', text: 'Конечно, Игорь! Ваша запись — 24.07 в 19:30, постоянная пломба 2.6. На пятницу 25.07 свободно 19:30 или 20:00. Какое поставить?', time: '10:11' },
      { from: 'patient', text: '20:00', time: '10:12' },
      { from: 'bot', text: 'Готово! ✅ Перенесла на 25.07 в 20:00, старую запись отменила. Пришлю напоминание.', time: '10:12' },
      { from: 'system', kind: 'booked', text: '🤖 Запись изменена в МИС · 25.07.2026 20:00 · Орлова Е. В.' }
    ]
  },
  {
    id: 'd5', channel: 'tg', patientId: 1, initials: 'АС', name: 'Анна Смирнова',
    status: 'closed', time: '09:24', unread: false,
    preview: 'Хорошего дня! 😊',
    next: '24.07.2026, 10:30 · протезирование',
    history: [
      ['Сегодня', 'Telegram', 'вопрос о графике (бот)'],
      ['14.03.2026', 'Приём', 'лечение кариеса 3.6']
    ],
    messages: [
      { from: 'patient', text: 'Добрый день, до скольки вы сегодня работаете?', time: '09:23' },
      { from: 'bot', text: 'Здравствуйте, Анна! Сегодня клиника работает до 21:00. Записать вас на удобное время?', time: '09:23' },
      { from: 'patient', text: 'Нет, спасибо, просто уточнила', time: '09:24' },
      { from: 'bot', text: 'Хорошего дня! 😊 Будем рады видеть вас.', time: '09:24' }
    ]
  }
];

let activeDialog = null;
let dialogFilter = 'all';

function renderAssistant() {
  renderDialogList();
  if (!activeDialog || !DIALOGS.includes(activeDialog)) activeDialog = DIALOGS[0];
  openDialog(activeDialog);
  updateDialogBadge();
}

function updateDialogBadge() {
  const n = DIALOGS.filter(d => d.status === 'need-admin').length;
  const b = $('#navDialogCount');
  if (b) { b.textContent = n; b.style.display = n ? '' : 'none'; }
}

function renderDialogList() {
  const list = $('#dialogList');
  const items = DIALOGS.filter(d =>
    dialogFilter === 'all' ? true :
    dialogFilter === 'need-admin' ? d.status === 'need-admin' :
    dialogFilter === 'bot' ? (d.status === 'bot' || d.status === 'bot-booked') : true);

  list.innerHTML = items.map(d => {
    const ch = CHANNELS[d.channel], st = DSTATUS[d.status];
    return `
      <div class="dialog-item ${d === activeDialog ? 'active' : ''}" data-id="${d.id}">
        ${d.unread ? '<span class="di-unread"></span>' : ''}
        <div class="di-avatar ${d.patientId ? '' : 'unknown'}">${d.initials}</div>
        <div class="di-main">
          <div class="di-name"><span class="ch-badge ${ch.cls}">${ch.label}</span>${d.name}</div>
          <div class="di-preview">${d.preview}</div>
        </div>
        <div class="di-right">
          <span class="di-time">${d.time}</span>
          <span class="di-status ${st.cls}">${st.label}</span>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.dialog-item').forEach(el =>
    el.addEventListener('click', () => {
      const d = DIALOGS.find(x => x.id === el.dataset.id);
      d.unread = false;
      activeDialog = d;
      renderDialogList();
      openDialog(d);
    }));
}

function openDialog(d) {
  const ch = CHANNELS[d.channel], st = DSTATUS[d.status];

  $('#chatHead').innerHTML = `
    <div class="di-avatar ${d.patientId ? '' : 'unknown'}">${d.initials}</div>
    <div class="chat-head-main">
      <div class="chat-head-name">${d.name}<span class="ch-badge ${ch.cls}">${ch.label}</span></div>
      <div class="chat-head-sub">${d.patientId ? 'Определён по номеру в МИС' : 'Не найден в МИС — новый контакт'}</div>
    </div>
    <span class="di-status ${st.cls}">${st.label}</span>`;

  $('#chatBody').innerHTML = d.messages.map(m => msgHtml(m)).join('');
  $('#chatBody').scrollTop = $('#chatBody').scrollHeight;

  renderChatFoot(d);
  renderChatCard(d);
}

function msgHtml(m) {
  if (m.from === 'system') {
    const cls = m.kind === 'booked' ? 'sys-booked' : m.kind === 'taken' ? 'sys-taken' : 'sys-need';
    return `<div class="msg-system ${cls}">${m.text}</div>`;
  }
  if (m.from === 'patient') {
    return `<div class="msg msg-in">
      <div class="msg-bubble">${m.text}</div>
      <div class="msg-time">${m.time || ''}</div></div>`;
  }
  const who = m.from === 'bot' ? '🤖 Бот' : '👩 ' + (m.who || 'Елена Ковалёва');
  return `<div class="msg msg-out ${m.from}">
    <div class="msg-who">${who}</div>
    <div class="msg-bubble">${m.text}</div>
    <div class="msg-time">${m.time || 'сейчас'}</div></div>`;
}

function renderChatFoot(d) {
  const foot = $('#chatFoot');
  if (d.status === 'admin') {
    foot.innerHTML = `
      <div class="admin-badge">👩 Вы ведёте диалог · бот приостановлен</div>
      <div class="admin-input">
        <input type="text" id="adminMsg" placeholder="Написать пациенту…">
        <button id="adminSend">Отправить</button>
      </div>`;
    $('#adminSend').addEventListener('click', sendAdminMsg);
    $('#adminMsg').addEventListener('keydown', e => { if (e.key === 'Enter') sendAdminMsg(); });
  } else {
    const urgent = d.status === 'need-admin';
    const note = urgent
      ? '⚠️ <b>Бот передаёт диалог администратору</b> — сложный вопрос'
      : d.status === 'closed'
        ? 'Диалог закрыт ботом. Можно подключиться вручную.'
        : '🤖 Сейчас отвечает бот. Можно подключиться в любой момент.';
    foot.innerHTML = `
      <div class="takeover-bar">
        <div class="takeover-note">${note}</div>
        <button class="btn-takeover ${urgent ? 'urgent' : ''}" id="btnTakeover">
          <img src="assets/icons/headset.png" alt="" style="width:16px;height:16px">Принять диалог
        </button>
      </div>`;
    $('#btnTakeover').addEventListener('click', () => takeOver(d));
  }
}

function takeOver(d) {
  d.messages.push({ from: 'system', kind: 'taken', text: '👩 Елена Ковалёва подключилась к диалогу. Бот приостановлен.' });
  d.status = 'admin';
  d.preview = 'Диалог ведёт администратор';
  renderDialogList();
  openDialog(d);
  updateDialogBadge();
}

function sendAdminMsg() {
  const input = $('#adminMsg');
  const text = input.value.trim();
  if (!text) return;
  activeDialog.messages.push({ from: 'admin', text, time: 'сейчас' });
  activeDialog.preview = text;
  $('#chatBody').innerHTML = activeDialog.messages.map(m => msgHtml(m)).join('');
  $('#chatBody').scrollTop = $('#chatBody').scrollHeight;
  renderDialogList();
  input.value = '';
  input.focus();
}

function renderChatCard(d) {
  const el = $('#chatCard');
  if (!d.patientId) {
    el.innerHTML = `<div class="cc-scroll">
      <div class="cc-head">
        <div class="di-avatar unknown">?</div>
        <div><div class="cc-name">Новый контакт</div><div class="cc-sub">${CHANNELS[d.channel].label}</div></div>
      </div>
      <span class="cc-mis new">● Не найден в МИС</span>
      <div class="cc-newnote">Пациент не идентифицирован по номеру. После ответа администратора бот уточнит контакты и предложит создать карточку в МИС.</div>
    </div>`;
    return;
  }
  const p = byId(d.patientId);
  el.innerHTML = `<div class="cc-scroll">
    <div class="cc-head">
      <div class="di-avatar">${p.initials}</div>
      <div><div class="cc-name">${p.name}</div><div class="cc-sub">${p.phone}</div></div>
    </div>
    <span class="cc-mis found">● Найден в МИС</span>
    <div class="cc-block">
      <div class="cc-label">Ближайшая запись</div>
      <div class="cc-next">${d.next && d.next !== 'нет активной записи'
        ? '📅 <b>' + d.next + '</b>'
        : 'Активной записи нет'}</div>
    </div>
    <div class="cc-block">
      <div class="cc-label">Лечение</div>
      <div class="cc-treat">${p.treat}</div>
    </div>
    <div class="cc-block">
      <div class="cc-label">История обращений</div>
      <ul class="cc-hist">${d.history.map(h =>
        `<li><span>${h[0]} · ${h[1]}</span> — ${h[2]}</li>`).join('')}</ul>
    </div>
    <button class="btn-ghost cc-open" data-id="${p.id}">
      <img src="assets/icons/doc.png" alt="">Открыть карточку в МИС
    </button>
  </div>`;
  const btn = el.querySelector('.cc-open');
  if (btn) btn.addEventListener('click', () => openCard(byId(+btn.dataset.id)));
}

document.querySelectorAll('.itab').forEach(tab =>
  tab.addEventListener('click', () => {
    document.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    dialogFilter = tab.dataset.filter;
    renderDialogList();
  }));

/* ============ Анализ звонков ============ */
const SENT = {
  pos: { cls: 'sent-pos', label: '😊 Позитивное' },
  neu: { cls: 'sent-neu', label: '😐 Нейтральное' },
  neg: { cls: 'sent-neg', label: '😟 Негативное' }
};
const CALL_TAGS = {
  'no-greeting': { cls: 'tag-bad',  label: '⚠️ Нет приветствия' },
  'price-first': { cls: 'tag-bad',  label: 'Сразу цена' },
  'no-needs':    { cls: 'tag-warn', label: 'Не выявил потребность' },
  'no-close':    { cls: 'tag-bad',  label: 'Не закрыл на запись' },
  'interrupt':   { cls: 'tag-warn', label: 'Перебивал клиента' },
  'parasites':   { cls: 'tag-warn', label: 'Слова-паразиты' },
  'good':        { cls: 'tag-good', label: '✅ Эталонный звонок' }
};
const scoreCls = (s) => s >= 75 ? 'score-good' : s >= 55 ? 'score-mid' : 'score-bad';

/* псевдо-осциллограмма (детерминированная) */
const WAVE = [8,14,22,30,18,26,40,34,20,12,28,44,50,38,24,16,30,46,52,40,26,18,10,22,34,48,42,30,20,14,26,38,44,32,22,12,20,34,28,18,10,16,24,36,30,20,12,8];

const CALLS = [
  {
    id: 'c1', date: '20.07 · 14:23', admin: 'Ирина Соловьёва', adminInit: 'ИС',
    clientName: 'Новый пациент', clientSub: '+7 977 530-37-02', patientId: null,
    type: 'Входящий', duration: '3:12', sentiment: 'neg', score: 41, booked: false,
    tags: ['no-greeting', 'price-first', 'no-close'],
    sentFrom: 'neu', sentTo: 'neg',
    metrics: [
      ['Приветствие', 'нет', 'bad'], ['Слова-паразиты', '7', 'bad'],
      ['Перебивания', '1', 'bad'], ['Монолог админа', '38%', 'ok'], ['Обращение по имени', 'нет', 'bad']
    ],
    transcript: [
      { who: 'client', text: 'Здравствуйте, сколько у вас стоит поставить коронку?' },
      { who: 'admin', text: 'PARA[Ну] коронка… PARA[это], PARA[короче], от 18 тысяч, зависит от материала.', flag: '✗ Нет приветствия и представления, сразу цена без вопросов' },
      { who: 'client', text: 'А почему так дорого?' },
      { who: 'admin', text: 'PARA[Ну] PARA[как бы] это средняя цена, у всех так.', flag: '✗ Возражение «дорого» не отработано' },
      { who: 'client', text: 'Понятно, я подумаю. До свидания.' },
      { who: 'admin', text: 'Ага, до свидания.', flag: '✗ Не предложил осмотр и не закрыл на запись' }
    ],
    criteria: [
      ['Приветствие и представление', 'no', 'Не поздоровался по стандарту, не назвал клинику и имя'],
      ['Обращение к клиенту по имени', 'no', 'Имя не уточнено и не использовано'],
      ['Выявление потребности', 'no', 'Ни одного вопроса о ситуации клиента'],
      ['Презентация ценности', 'no', 'Озвучена только цена, без пользы'],
      ['Работа с возражениями', 'no', '«Дорого» — ответил шаблонно, без аргументов'],
      ['Закрытие на запись', 'no', 'Не предложил время, отпустил клиента'],
      ['Прощание и следующий шаг', 'part', 'Попрощался, но без договорённости']
    ],
    funnel: ['skip', 'skip', 'part', 'skip', 'skip'],
    mistakes: [
      ['Не поздоровался по стандарту и не представился', 'Начинать: «Стоматология “Дента+”, администратор Ирина, здравствуйте!»'],
      ['Сразу назвал цену без выявления потребности', 'Сначала 2–3 вопроса: какой зуб, был ли осмотр, что беспокоит — потом предложение.'],
      ['7 слов-паразитов («ну», «короче», «как бы»)', 'Заменять паузой; проговорить скрипт вслух 5 раз для автоматизма.'],
      ['Не отработал возражение «дорого»', 'Показать ценность → рассрочка 0% → пригласить на бесплатный осмотр.'],
      ['Не закрыл на запись', 'Предложить конкретное время: «Запишу вас на осмотр — вам удобнее завтра в 10:00 или в 18:00?»']
    ]
  },
  {
    id: 'c2', date: '20.07 · 12:37', admin: 'Елена Ковалёва', adminInit: 'ЕК',
    clientName: 'Мария Ковальчук', clientSub: '+7 903 777-51-12', patientId: 3,
    type: 'Входящий', duration: '2:48', sentiment: 'pos', score: 92, booked: true,
    tags: ['good'],
    sentFrom: 'neu', sentTo: 'pos',
    metrics: [
      ['Приветствие', 'по стандарту', 'ok'], ['Слова-паразиты', '0', 'ok'],
      ['Перебивания', '0', 'ok'], ['Монолог админа', '46%', 'ok'], ['Обращение по имени', '2 раза', 'ok']
    ],
    transcript: [
      { who: 'admin', text: 'Стоматология «Дента+», администратор Елена, здравствуйте!', flag: '✓ Приветствие по стандарту', good: true },
      { who: 'client', text: 'Здравствуйте, хочу узнать про имплантацию.' },
      { who: 'admin', text: 'Подскажите, вас беспокоит один зуб или планируете несколько?', flag: '✓ Выявление потребности', good: true },
      { who: 'client', text: 'Один, нижний, недавно удалили.' },
      { who: 'admin', text: 'Поняла вас, Мария. После удаления важно не тянуть. Приглашаю на бесплатную консультацию с 3D-снимком — четверг или суббота?', flag: '✓ Ценность + имя + закрытие', good: true },
      { who: 'client', text: 'Давайте четверг.' },
      { who: 'admin', text: 'Записала на четверг 15:00 к доктору Гусеву, пришлю напоминание. Хорошего дня!' }
    ],
    criteria: [
      ['Приветствие и представление', 'ok', 'Клиника + имя + «здравствуйте»'],
      ['Обращение к клиенту по имени', 'ok', 'Назвала по имени дважды'],
      ['Выявление потребности', 'ok', 'Уточнила ситуацию до предложения'],
      ['Презентация ценности', 'ok', 'Через пользу, а не цену'],
      ['Работа с возражениями', 'ok', 'Возражений не возникло — сняла заранее'],
      ['Закрытие на запись', 'ok', 'Предложила выбор из двух окон, записала'],
      ['Прощание и следующий шаг', 'ok', 'Напоминание + тёплое прощание']
    ],
    funnel: ['done', 'done', 'done', 'done', 'done'],
    mistakes: []
  },
  {
    id: 'c3', date: '20.07 · 11:05', admin: 'Ирина Соловьёва', adminInit: 'ИС',
    clientName: 'Дмитрий Волков', clientSub: '+7 926 118-22-40', patientId: 2,
    type: 'Входящий', duration: '1:54', sentiment: 'neu', score: 66, booked: true,
    tags: ['interrupt'],
    sentFrom: 'neu', sentTo: 'neu',
    metrics: [
      ['Приветствие', 'кратко', 'bad'], ['Слова-паразиты', '2', 'ok'],
      ['Перебивания', '1', 'bad'], ['Монолог админа', '52%', 'ok'], ['Обращение по имени', 'нет', 'bad']
    ],
    transcript: [
      { who: 'admin', text: 'Дента плюс, здравствуйте.', flag: '~ Не представилась по имени' },
      { who: 'client', text: 'Здравствуйте, болит зуб, можно записаться?' },
      { who: 'admin', text: 'Да, конечно, а когда вам удоб…' },
      { who: 'client', text: '(перебивает) Сегодня можно?' },
      { who: 'admin', text: 'Сегодня в 18:30, записываю?', flag: '~ Не уточнила характер боли' },
      { who: 'client', text: 'Да.' },
      { who: 'admin', text: 'Записала, до встречи.' }
    ],
    criteria: [
      ['Приветствие и представление', 'part', 'Поздоровалась, но не назвала имя'],
      ['Обращение к клиенту по имени', 'no', 'Имя не использовано'],
      ['Выявление потребности', 'part', 'Не уточнила характер и срочность боли'],
      ['Презентация ценности', 'ok', 'Быстро предложила неотложное окно'],
      ['Работа с возражениями', 'ok', 'Возражений не было'],
      ['Закрытие на запись', 'ok', 'Записала на конкретное время'],
      ['Прощание и следующий шаг', 'ok', 'Попрощалась корректно']
    ],
    funnel: ['part', 'part', 'done', 'done', 'done'],
    mistakes: [
      ['Не представилась по имени', 'Добавить имя: «…администратор Ирина, здравствуйте!»'],
      ['Не обратилась к клиенту по имени', 'Спросить и использовать имя — это повышает доверие.'],
      ['Не уточнила характер боли', 'Один вопрос: «Давно болит, реакция на горячее/холодное?» — важно для приоритета записи.']
    ]
  },
  {
    id: 'c4', date: '20.07 · 10:18', admin: 'Елена Ковалёва', adminInit: 'ЕК',
    clientName: 'Новый пациент', clientSub: '+7 995 210-44-70', patientId: null,
    type: 'Входящий', duration: '1:36', sentiment: 'neg', score: 54, booked: false,
    tags: ['price-first', 'no-close'],
    sentFrom: 'neu', sentTo: 'neg',
    metrics: [
      ['Приветствие', 'по стандарту', 'ok'], ['Слова-паразиты', '1', 'ok'],
      ['Перебивания', '0', 'ok'], ['Монолог админа', '35%', 'ok'], ['Обращение по имени', 'нет', 'bad']
    ],
    transcript: [
      { who: 'admin', text: 'Дента плюс, Елена, здравствуйте!', flag: '✓ Приветствие по стандарту', good: true },
      { who: 'client', text: 'Здравствуйте, вы брекеты детям ставите?' },
      { who: 'admin', text: 'Да, ставим, от 12 лет.' },
      { who: 'client', text: 'А сколько стоит?' },
      { who: 'admin', text: 'Зависит от системы, от 80 тысяч.', flag: '✗ Цена без выявления ситуации и ценности' },
      { who: 'client', text: 'Ясно, спасибо.' },
      { who: 'admin', text: 'Пожалуйста, до свидания.', flag: '✗ Не предложила бесплатную консультацию ортодонта' }
    ],
    criteria: [
      ['Приветствие и представление', 'ok', 'По стандарту'],
      ['Обращение к клиенту по имени', 'no', 'Имя не уточнено'],
      ['Выявление потребности', 'no', 'Не уточнила возраст ребёнка и ситуацию'],
      ['Презентация ценности', 'no', 'Только цена, без пользы'],
      ['Работа с возражениями', 'no', 'Не удержала после вопроса о цене'],
      ['Закрытие на запись', 'no', 'Не предложила консультацию/осмотр']
    ],
    funnel: ['done', 'skip', 'skip', 'skip', 'skip'],
    mistakes: [
      ['Сразу назвала цену без выявления ситуации', 'Уточнить: возраст ребёнка, был ли осмотр ортодонта, что беспокоит.'],
      ['Не предложила бесплатную консультацию', 'Ортодонт-консультация бесплатна — это лёгкий следующий шаг для записи.'],
      ['Не закрыла на запись', 'Предложить конкретное время осмотра и записать.']
    ]
  },
  {
    id: 'c5', date: '20.07 · 09:41', admin: 'Ирина Соловьёва', adminInit: 'ИС',
    clientName: 'Игорь Романов', clientSub: '+7 917 604-93-25', patientId: 4,
    type: 'Входящий', duration: '2:10', sentiment: 'pos', score: 79, booked: true,
    tags: ['good'],
    sentFrom: 'neu', sentTo: 'pos',
    metrics: [
      ['Приветствие', 'по стандарту', 'ok'], ['Слова-паразиты', '1', 'ok'],
      ['Перебивания', '0', 'ok'], ['Монолог админа', '44%', 'ok'], ['Обращение по имени', '1 раз', 'ok']
    ],
    transcript: [
      { who: 'admin', text: 'Стоматология «Дента+», Ирина, здравствуйте!', flag: '✓ Приветствие по стандарту', good: true },
      { who: 'client', text: 'Здравствуйте, хочу перенести запись.' },
      { who: 'admin', text: 'Конечно, Игорь. У вас 24 июля, лечение. На когда перенести?' },
      { who: 'client', text: 'На пятницу вечером.' },
      { who: 'admin', text: 'Есть 19:30 и 20:00, какое удобно?' },
      { who: 'client', text: '20:00.' },
      { who: 'admin', text: 'Готово, перенесла на пятницу 20:00, напоминание пришлю. Хорошего дня!' }
    ],
    criteria: [
      ['Приветствие и представление', 'ok', 'По стандарту'],
      ['Обращение к клиенту по имени', 'ok', 'Назвала по имени'],
      ['Выявление потребности', 'ok', 'Уточнила детали переноса'],
      ['Презентация ценности', 'ok', 'Предложила конкретные окна'],
      ['Работа с возражениями', 'ok', 'Возражений не было'],
      ['Закрытие на запись', 'ok', 'Перенос оформлен'],
      ['Прощание и следующий шаг', 'ok', 'Напоминание + прощание']
    ],
    funnel: ['done', 'done', 'done', 'done', 'done'],
    mistakes: [
      ['Не уточнила причину переноса', 'Один мягкий вопрос о причине помогает удержать пациента и вернуть, если он «остывает».']
    ]
  }
];

const byCallId = (id) => CALLS.find(c => c.id === id);
let callFilter = 'all';

const MISTAKE_CARDS = [
  {
    name: 'Сразу называют цену, без выявления потребности', count: '11 звонков',
    example: '«Коронка? Ну, от 18 тысяч, зависит от материала.»',
    why: 'Клиент сравнивает клиники только по цене и уходит «подумать» — ценность не показана.',
    how: 'Сначала 2–3 вопроса (какой зуб, был ли осмотр, что беспокоит), затем предложение и только потом цена в связке с пользой.',
    who: 'Чаще всего — Ирина Соловьёва'
  },
  {
    name: 'Не закрывают звонок на запись', count: '9 звонков',
    example: '«Ясно, спасибо. — Пожалуйста, до свидания.»',
    why: 'Тёплый пациент, который сам позвонил, уходит без записи — деньги потеряны.',
    how: 'Всегда предлагать выбор из двух конкретных окон: «Вам удобнее завтра в 10:00 или в 18:00?»',
    who: 'Ирина Соловьёва, Елена Ковалёва'
  },
  {
    name: 'Слова-паразиты снижают доверие', count: '18 звонков',
    example: '«Ну, короче, это как бы средняя цена…»',
    why: 'Речь звучит неуверенно и непрофессионально — пациент сомневается в клинике.',
    how: 'Заменять «ну / короче / как бы» короткой паузой; проговорить скрипт вслух 5 раз для автоматизма.',
    who: 'Обе — как речевая привычка'
  }
];

function renderMistakeCards() {
  $('#mistCards').innerHTML = MISTAKE_CARDS.map(m => `
    <div class="mist-card">
      <div class="mist-head">
        <div class="mist-name">${m.name}</div>
        <span class="mist-count">${m.count}</span>
      </div>
      <div class="mist-example">Пример из звонка: ${m.example}</div>
      <div class="mist-row bad"><span class="mist-k">Почему плохо:</span><span>${m.why}</span></div>
      <div class="mist-row good"><span class="mist-k">Как надо:</span><span>${m.how}</span></div>
      <div class="mist-who">Кого касается: ${m.who}</div>
    </div>`).join('');
}

function renderCalls() {
  renderCallList();
  renderCallCharts();
  renderMistakeCards();
}

function renderCallList() {
  const list = $('#callList');
  const items = CALLS.filter(c =>
    callFilter === 'all' ? true :
    callFilter === 'bad' ? c.score < 70 :
    callFilter === 'good' ? c.score >= 80 : true);

  list.innerHTML = items.map(c => {
    const s = SENT[c.sentiment];
    const tags = c.tags.map(t => `<span class="call-tag ${CALL_TAGS[t].cls}">${CALL_TAGS[t].label}</span>`).join('');
    return `
      <div class="call-row">
        <button class="call-play" data-id="${c.id}">▶</button>
        <div class="call-admin">
          <div class="p-avatar">${c.adminInit}</div>
          <div><div class="call-who-name">${c.admin}</div><div class="call-who-sub">${c.date} · ${c.duration}</div></div>
        </div>
        <div><div class="call-who-name">${c.clientName}</div><div class="call-who-sub">${c.clientSub} · ${c.type}</div></div>
        <div><span class="sent-chip ${s.cls}">${s.label}</span></div>
        <div><span class="score-badge ${scoreCls(c.score)}">${c.score}</span></div>
        <div class="call-tags">${tags}</div>
        <button class="call-open" data-id="${c.id}">Разбор</button>
      </div>`;
  }).join('');

  list.querySelectorAll('.call-open, .call-play').forEach(btn =>
    btn.addEventListener('click', () => openCall(byCallId(btn.dataset.id))));
}

function renderCallCharts() {
  const admins = [['Ирина', 64], ['Елена', 81]];
  $('#callAdminChart').innerHTML = admins.map(([m, v]) => `
    <div class="bar-col" title="${m}: ${v}">
      <div class="bar-val">${v}</div>
      <div class="bar ${v >= 75 ? 'bar-current' : ''}" style="height:${v}%"></div>
      <div class="bar-month">${m}</div>
    </div>`).join('');

  const errs = [
    ['Слова-паразиты', 18], ['Не выявляет потребность', 14],
    ['Сразу цена', 11], ['Не закрывает на запись', 9],
    ['Перебивает клиента', 8], ['Нет приветствия', 6]
  ];
  const maxE = 20;
  const hbar = errs.map(([label, v]) => `
    <div class="hbar-row">
      <div>${label}</div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${v / maxE * 100}%"></div></div>
      <div class="hbar-val">${v}</div>
    </div>`).join('');
  $('#callErrChart').innerHTML = hbar;
  if ($('#mistErrChart')) $('#mistErrChart').innerHTML = hbar;
}

/* разбор звонка (модалка на весь экран) */
function openCall(c) {
  $('#callAvatar').textContent = c.patientId ? byId(c.patientId).initials : '?';
  $('#callAvatar').className = 'p-avatar big' + (c.patientId ? '' : ' unknown');
  $('#callTitle').textContent = c.clientName;
  $('#callMeta').textContent = `${c.clientSub} · ${c.type} · ${c.date} · ${c.duration} · администратор ${c.admin}`;
  $('#callScoreBig').textContent = c.score;
  $('#callScoreBig').className = 'call-score-big ' + (c.score >= 75 ? 'accent-green' : c.score >= 55 ? 'accent-orange' : 'accent-red');
  $('#callScoreBig').style.color = c.score >= 75 ? 'var(--green)' : c.score >= 55 ? 'var(--orange)' : 'var(--red)';
  $('#callDur').textContent = c.duration;

  const cut = Math.round(WAVE.length * 0.35);
  $('#callWave').innerHTML = WAVE.map((h, i) =>
    `<span class="${i < cut ? 'played' : ''}" style="height:${h + 6}px"></span>`).join('');

  $('#callMetrics').innerHTML = c.metrics.map(m =>
    `<div class="metric"><span class="metric-val ${m[2]}">${m[1]}</span><span class="metric-label">${m[0]}</span></div>`).join('');

  $('#callTranscript').innerHTML = c.transcript.map(t => {
    const text = t.text.replace(/PARA\[(.*?)\]/g, '<span class="parasite">$1</span>');
    const flag = t.flag ? `<span class="tr-flag ${t.good ? 'good' : ''}">${t.flag}</span>` : '';
    return `<div class="tr-line tr-${t.who}">
      <div class="tr-who">${t.who === 'admin' ? 'Админ' : 'Клиент'}</div>
      <div class="tr-bubble">${text}${flag}</div></div>`;
  }).join('');

  const CM = { ok: ['crit-ok', '✓'], no: ['crit-no', '✕'], part: ['crit-part', '~'] };
  $('#callCriteria').innerHTML = c.criteria.map(cr => {
    const [cls, sym] = CM[cr[1]];
    return `<div class="crit-row ${cls}">
      <div class="crit-mark">${sym}</div>
      <div class="crit-main"><div class="crit-name">${cr[0]}</div><div class="crit-note">${cr[2]}</div></div></div>`;
  }).join('');

  const FN = ['Контакт', 'Потребность', 'Презентация', 'Возражения', 'Закрытие'];
  $('#callFunnel').innerHTML = c.funnel.map((st, i) =>
    `<div class="fstep ${st}"><div class="fstep-bar"></div><div class="fstep-name">${FN[i]}</div></div>`).join('');

  const sf = SENT[c.sentFrom], stt = SENT[c.sentTo];
  const up = (c.sentTo === 'pos') || (c.sentFrom === 'neg' && c.sentTo === 'neu');
  $('#callSent').innerHTML = `
    <span class="sent-chip ${sf.cls}">${sf.label}</span>
    <div class="sent-arrow ${up ? 'up' : ''}"></div>
    <span class="sent-chip ${stt.cls}">${stt.label}</span>`;

  $('#callMistakes').innerHTML = c.mistakes.length
    ? c.mistakes.map(m => `<div class="fix-card">
        <div class="fix-problem"><b>Ошибка:</b> ${m[0]}</div>
        <div class="fix-how"><b>Как надо:</b> ${m[1]}</div></div>`).join('')
    : '<div class="fix-empty">✅ Грубых ошибок нет. Звонок можно использовать как эталон для обучения.</div>';

  $('#callmodal').classList.remove('hidden');
  $('#callmodal').scrollTop = 0;
}

$('#callClose').addEventListener('click', () => $('#callmodal').classList.add('hidden'));

document.querySelectorAll('.ctab').forEach(tab =>
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    callFilter = tab.dataset.f;
    renderCallList();
  }));

$('#btnMeeting').addEventListener('click', () => {
  const b = $('#btnMeeting');
  b.innerHTML = '<img src="assets/icons/check.png" alt="">Отчёт сформирован (PDF)';
});

$('#btnSyncTel').addEventListener('click', () => {
  const b = $('#btnSyncTel');
  b.disabled = true;
  b.innerHTML = '<img src="assets/icons/bolt.png" alt="">Загрузка записей…';
  setTimeout(() => {
    b.innerHTML = '<img src="assets/icons/check.png" alt="">Готово · 14 новых разборов';
    const row = document.createElement('tr');
    row.innerHTML = '<td>20.07.2026 (сейчас)</td><td><span class="ok-chip">успешно</span></td><td>14 записей</td><td>14 разборов</td>';
    $('#telLog').prepend(row);
  }, 1800);
});

/* ---------- Инициализация ---------- */
$('#todayLabel').textContent = fmtToday();
renderTasks();
renderPatients();
renderCharts();
renderAssistant();
renderCalls();

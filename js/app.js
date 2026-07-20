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
    : `<button class="p-action" data-id="${p.id}"><img src="assets/icons/phone.png" alt="">Сценарий звонка</button>`;
}

/* ---------- Переключение экранов ---------- */
document.querySelectorAll('.side-link[data-screen]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $('#screen-' + link.dataset.screen).classList.remove('hidden');
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
    btn.addEventListener('click', () => openDrawer(byId(+btn.dataset.id))));
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
    if (btn) btn.addEventListener('click', () => openDrawer(p));
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

function openDrawer(p) {
  currentPatient = p;
  selectedOutcome = null;
  const ins = INSIGHTS[p.insight];

  $('#dAvatar').textContent = p.initials;
  $('#dName').textContent = p.name;
  $('#dPhone').textContent = p.phone + ' · последний визит ' + p.lastVisit;
  $('#dTreat').textContent = p.treatFull;
  $('#dVisits').innerHTML = p.visits.map(v =>
    `<li><span>${v[0]}</span> — ${v[1]} <em>· ${v[2]}</em></li>`).join('');
  $('#dInsight').innerHTML = `
    <span class="insight-chip ${ins.chip}">${ins.icon} ${ins.label}</span>
    <p>${ins.detail}</p>
    <p><b>Рекомендация ИИ:</b> ${ins.reco}</p>`;

  renderScript(p, ins);

  document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('selected'));
  $('#outcomeComment').value = '';
  $('#sentNote').classList.add('hidden');
  $('#btnSaveOutcome').disabled = false;

  $('#drawerBackdrop').classList.remove('hidden');
  $('#drawer').classList.remove('hidden');
  $('#drawer').scrollTop = 0;
}

function renderScript(p, ins) {
  const objections = ins.objections.map(o =>
    `<div class="script-obj"><b>${o[0]}</b> — ${o[1]}</div>`).join('');
  $('#dScript').innerHTML = `
    <div class="script-step">
      <div class="script-step-label">Приветствие</div>
      «${p.name.split(' ')[0]}, здравствуйте! Это Елена, стоматология “Дента+”. Удобно говорить пару минут?»
    </div>
    <div class="script-step">
      <div class="script-step-label">Повод звонка</div>
      ${p.reason}. Объяснить, почему важно не откладывать (медицинский аргумент из плана лечения).
    </div>
    <div class="script-step key">
      <div class="script-step-label">Ключевой аргумент — под инсайт пациента</div>
      <span id="scriptKey"></span>
    </div>
    <div class="script-step">
      <div class="script-step-label">Если возражает</div>
      ${objections}
    </div>
    <div class="script-step">
      <div class="script-step-label">Цель звонка</div>
      Предложить два конкретных окна на этой неделе и записать. Подтвердить SMS-напоминанием.
    </div>`;
  typeText($('#scriptKey'), p.argument);
}

/* эффект «ИИ печатает» для ключевого аргумента */
function typeText(el, text) {
  clearInterval(typingTimer);
  el.textContent = '';
  el.classList.add('typing-caret');
  const words = text.split(' ');
  let i = 0;
  typingTimer = setInterval(() => {
    el.textContent += (i ? ' ' : '') + words[i];
    i++;
    if (i >= words.length) {
      clearInterval(typingTimer);
      el.classList.remove('typing-caret');
    }
  }, 90);
}

function closeDrawer() {
  clearInterval(typingTimer);
  $('#drawer').classList.add('hidden');
  $('#drawerBackdrop').classList.add('hidden');
}

$('#drawerClose').addEventListener('click', closeDrawer);
$('#drawerBackdrop').addEventListener('click', closeDrawer);

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

/* ---------- Инициализация ---------- */
$('#todayLabel').textContent = fmtToday();
renderTasks();
renderPatients();
renderCharts();

/* ============ Точка роста АйТи — логика демо-приложения ============ */

/* ---------- Данные (демо) ---------- */
const INSIGHTS = {
  promo: {
    chip: 'chip-promo', icon: '🏷️', label: 'Реагирует на акции',
    detail: 'Дважды записывался после рассылок со скидкой (март, октябрь). Средний чек растёт при спецпредложении.',
    reco: 'Предложить акцию −15% на продолжение лечения до конца месяца.'
  },
  credit: {
    chip: 'chip-credit', icon: '💳', label: 'Важна рассрочка',
    detail: 'Оба крупных лечения оплачивал в рассрочку на 6 месяцев. Отложил протезирование после озвучивания полной цены.',
    reco: 'Сделать акцент на рассрочке 0% без переплат.'
  },
  care: {
    chip: 'chip-care', icon: '💚', label: 'Ценит заботу и врача',
    detail: 'Ходит только к «своему» врачу, оставил благодарный отзыв. Реагирует на личное внимание, а не на скидки.',
    reco: 'Написать от имени лечащего врача с заботой о результате.'
  },
  evening: {
    chip: 'chip-evening', icon: '🌙', label: 'Записывается на вечер',
    detail: 'Все визиты — после 18:00, дважды переносил дневные записи. Работает в графике 5/2.',
    reco: 'Предложить конкретные вечерние окна на этой неделе.'
  },
  family: {
    chip: 'chip-family', icon: '👨‍👩‍👧', label: 'Семейный пациент',
    detail: 'Приводит двоих детей, жена лечится в этой же клинике. Реагирует на семейные предложения.',
    reco: 'Предложить семейную программу и совместный визит с детьми.'
  }
};

const PATIENTS = [
  {
    id: 1, name: 'Анна Смирнова', initials: 'АС', phone: '+7 912 345-67-89',
    lastVisit: '14.03.2026', daysAgo: 128,
    treat: 'Пломба на 3.6 поставлена, <b>рекомендована коронка — не записалась</b>',
    treatFull: 'Лечение кариеса 3.6 завершено 14.03.2026. Врач рекомендовал коронку на этот зуб — без неё высок риск скола стенки. Запись на протезирование не создана.',
    insight: 'credit',
    visits: [
      ['14.03.2026', 'Лечение кариеса 3.6, пломба', 'оплата в рассрочку 6 мес.'],
      ['02.02.2026', 'Консультация + план протезирования', 'от коронки отказалась: «дорого сразу»'],
      ['11.09.2025', 'Лечение пульпита 4.5', 'оплата в рассрочку 6 мес.'],
      ['15.04.2025', 'Профгигиена', 'оплата картой']
    ],
    message: 'Анна, здравствуйте! Это стоматология «Дента+». Доктор Орлова напоминает: после лечения зуба 3.6 важно поставить коронку — без неё зуб может не выдержать нагрузку. {Сейчас коронку можно оформить в рассрочку 0% на 6 месяцев — без первого взноса и переплат.} Подобрать удобное время на этой неделе?'
  },
  {
    id: 2, name: 'Дмитрий Волков', initials: 'ДВ', phone: '+7 926 118-22-40',
    lastVisit: '27.04.2026', daysAgo: 84,
    treat: 'Пролечено 2 кариеса из 4, <b>визиты по плану прерваны</b>',
    treatFull: 'По плану лечения — 4 кариеса. Пролечены зубы 1.5 и 1.6, на 2.4 и 2.5 пациент не записался. Последний визит 27.04.2026.',
    insight: 'promo',
    visits: [
      ['27.04.2026', 'Лечение кариеса 1.6', 'запись по акции из рассылки'],
      ['12.04.2026', 'Лечение кариеса 1.5', 'оплата наличными'],
      ['29.03.2026', 'Диагностика: план на 4 зуба', 'пришёл по акции «бесплатная диагностика»'],
      ['10.10.2025', 'Профгигиена по акции −20%', 'запись после SMS-рассылки']
    ],
    message: 'Дмитрий, добрый день! Стоматология «Дента+». У вас пролечены 2 зуба из 4 по плану — осталось два небольших кариеса, лучше закрыть их, пока они не выросли в пульпит. {До конца месяца для вас действует скидка 15% на завершение плана лечения.} Записать вас на удобный день?'
  },
  {
    id: 3, name: 'Мария Ковальчук', initials: 'МК', phone: '+7 903 777-51-12',
    lastVisit: '05.02.2026', daysAgo: 165,
    treat: 'Удаление 4.6 выполнено, <b>имплантация отложена</b>',
    treatFull: 'Зуб 4.6 удалён 05.02.2026. Врач рекомендовал имплантацию в течение 3–6 месяцев, пока не началась убыль кости. Пациентка взяла паузу «подумать».',
    insight: 'care',
    visits: [
      ['05.02.2026', 'Удаление 4.6 (д-р Гусев)', 'оставила отзыв 5★ о враче'],
      ['20.01.2026', 'Острая боль, консультация д-ра Гусева', 'пришла по рекомендации подруги'],
      ['03.06.2025', 'Профгигиена (просила к д-ру Гусеву)', 'оплата картой']
    ],
    message: 'Мария, здравствуйте! Это «Дента+», пишем от доктора Гусева. Прошло почти полгода после удаления зуба — сейчас самое подходящее время для имплантации, {дальше кость в этом месте начнёт убывать, и лечение станет сложнее. Доктор хотел бы сам посмотреть вас и спокойно обсудить варианты — без спешки и навязывания.} Подберём удобное время?'
  },
  {
    id: 4, name: 'Игорь Романов', initials: 'ИР', phone: '+7 917 604-93-25',
    lastVisit: '19.05.2026', daysAgo: 62,
    treat: 'Каналы 2.6 пролечены, <b>не пришёл на постоянную пломбу</b>',
    treatFull: 'Эндодонтическое лечение 2.6 завершено 19.05.2026, стоит временная пломба. Через 2–3 недели требовалась постоянная реставрация — записи нет, временная пломба уже изношена.',
    insight: 'evening',
    visits: [
      ['19.05.2026', 'Лечение каналов 2.6, визит 19:30', 'оплата картой'],
      ['12.05.2026', 'Лечение каналов 2.6, визит 20:00', 'перенёс дневную запись на вечер'],
      ['05.05.2026', 'Острая боль, приём 19:00', 'оплата картой']
    ],
    message: 'Игорь, добрый вечер! Стоматология «Дента+». После лечения каналов у вас стоит временная пломба — её пора заменить на постоянную, иначе зуб может треснуть. {Есть вечерние окна: четверг 19:30 или пятница 20:00 — как вам удобно.} Забронировать одно из них?'
  },
  {
    id: 5, name: 'Ольга Белова', initials: 'ОБ', phone: '+7 921 458-30-77',
    lastVisit: '30.01.2026', daysAgo: 171,
    treat: 'Брекеты: <b>пропущены 2 плановые коррекции</b>',
    treatFull: 'Ортодонтическое лечение с 09.2025. Коррекции нужны каждые 4–6 недель, последний визит 30.01.2026 — пропущены две активации. Лечение фактически остановлено.',
    insight: 'family',
    visits: [
      ['30.01.2026', 'Активация брекет-системы', 'приходила с дочкой (осмотр)'],
      ['15.12.2025', 'Активация брекет-системы', 'записала мужа на гигиену'],
      ['28.09.2025', 'Установка брекет-системы', 'семейная скидка 10%']
    ],
    message: 'Ольга, здравствуйте! «Дента+». Ваши брекеты ждут коррекции — прошло уже 5 месяцев, без активации лечение затягивается и результат «откатывается». {Можем совместить: вы на коррекцию, а дочке в это же время сделаем плановый осмотр — по семейной программе он бесплатный.} Подобрать время, удобное для вас двоих?'
  },
  {
    id: 6, name: 'Сергей Мельник', initials: 'СМ', phone: '+7 909 233-18-64',
    lastVisit: '22.04.2026', daysAgo: 89,
    treat: 'Профгигиена сделана, <b>лечение 2 кариесов не начато</b>',
    treatFull: 'На профгигиене 22.04.2026 выявлены кариесы 3.4 и 3.5. Пациент сказал «запишусь позже» — записи нет.',
    insight: 'promo',
    visits: [
      ['22.04.2026', 'Профгигиена, найдено 2 кариеса', 'пришёл по акции −20%'],
      ['18.11.2025', 'Профгигиена по акции', 'запись после рассылки']
    ],
    message: 'Сергей, добрый день! Стоматология «Дента+». Весной на гигиене мы нашли два небольших кариеса — сейчас их лечение займёт один визит и минимум затрат, дальше будет дороже. {Для вас действует спецпредложение: −15% на лечение обоих зубов при записи до конца месяца.} Подобрать удобный день?'
  },
  {
    id: 7, name: 'Наталья Крылова', initials: 'НК', phone: '+7 915 872-46-01',
    lastVisit: '11.03.2026', daysAgo: 131,
    treat: 'Съёмный протез: <b>не пришла на коррекцию и осмотр</b>',
    treatFull: 'Протез установлен 11.03.2026. Плановая коррекция через 2 недели и контрольный осмотр через 3 месяца не состоялись.',
    insight: 'care',
    visits: [
      ['11.03.2026', 'Установка съёмного протеза (д-р Орлова)', 'оплата в 2 этапа'],
      ['20.02.2026', 'Примерка, подгонка', 'просила «только к Орловой»'],
      ['28.12.2025', 'Снятие слепков', 'оплата картой']
    ],
    message: 'Наталья Петровна, здравствуйте! Это «Дента+», от доктора Орловой. Доктор интересуется, как вы привыкли к протезу — обычно через пару месяцев нужна небольшая коррекция, чтобы ничего не натирало. {Осмотр и подгонка для вас бесплатны — это часть вашего лечения.} Когда вам было бы удобно заглянуть?'
  }
];

/* ---------- Утилиты ---------- */
const $ = (sel) => document.querySelector(sel);

function fmtToday() {
  const d = new Date();
  return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

/* подсветка персонализированной части: {…} -> <mark>…</mark> */
function renderMsg(raw) {
  return raw.replace('{', '<mark>').replace('}', '</mark>');
}

/* ---------- Инициализация ---------- */
$('#todayLabel').textContent = fmtToday();

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

/* ---------- Шаг 2: анализ ---------- */
const LOG_LINES = [
  'Загружена картотека: 248 пациентов за выбранный период',
  'Сверены планы лечения и фактические визиты',
  'Найдено незаконченное лечение: 31 пациент',
  'Проанализированы история визитов, оплаты и отклики на рассылки',
  'Готовы персональные сообщения для каждого пациента'
];

$('#btnAnalyze').addEventListener('click', () => {
  $('#periodPanel').classList.add('hidden');
  $('#analyzePanel').classList.remove('hidden');

  const fill = $('#progressFill');
  const log = $('#analyzeLog');
  log.innerHTML = '';

  LOG_LINES.forEach((line, i) => {
    setTimeout(() => {
      fill.style.width = ((i + 1) / LOG_LINES.length * 100) + '%';
      const div = document.createElement('div');
      div.textContent = line;
      log.appendChild(div);
    }, 650 * i + 400);
  });

  setTimeout(showResults, 650 * LOG_LINES.length + 1100);
});

function showResults() {
  $('#analyzePanel').classList.add('hidden');
  $('#resultsPanel').classList.remove('hidden');
  renderPatients();
}

/* ---------- Список пациентов ---------- */
function renderPatients() {
  const list = $('#patientList');
  list.innerHTML = '';
  PATIENTS.forEach((p, i) => {
    const ins = INSIGHTS[p.insight];
    const row = document.createElement('div');
    row.className = 'patient-row';
    row.style.animationDelay = (i * 0.09) + 's';
    row.innerHTML = `
      <div class="p-avatar">${p.initials}</div>
      <div>
        <div class="p-name">${p.name}</div>
        <div class="p-meta">был(а) ${p.lastVisit} · ${p.daysAgo} дн. назад</div>
      </div>
      <div class="p-treat">${p.treat}</div>
      <div><span class="insight-chip ${ins.chip}">${ins.icon} ${ins.label}</span></div>
      <button class="p-action" data-id="${p.id}">Сообщение</button>
    `;
    row.querySelector('.p-action').addEventListener('click', () => openDrawer(p));
    list.appendChild(row);
  });
}

/* ---------- Карточка пациента ---------- */
let typingTimer = null;

function openDrawer(p) {
  const ins = INSIGHTS[p.insight];
  $('#dAvatar').textContent = p.initials;
  $('#dName').textContent = p.name;
  $('#dPhone').textContent = p.phone + ' · последний визит ' + p.lastVisit;
  $('#dTreat').innerHTML = p.treatFull.replace(/(не |нет|отложил|прерван|остановлен)/i, '$1');
  $('#dVisits').innerHTML = p.visits.map(v =>
    `<li><span>${v[0]}</span> — ${v[1]} <em>· ${v[2]}</em></li>`).join('');
  $('#dInsight').innerHTML = `
    <span class="insight-chip ${ins.chip}">${ins.icon} ${ins.label}</span>
    <p>${ins.detail}</p>
    <p><b>Рекомендация ИИ:</b> ${ins.reco}</p>`;
  $('#sentNote').classList.add('hidden');
  $('#btnSend').disabled = false;

  $('#drawerBackdrop').classList.remove('hidden');
  $('#drawer').classList.remove('hidden');

  typeMessage(renderMsg(p.message));
  $('#btnSend').dataset.id = p.id;
}

/* эффект «ИИ печатает сообщение» */
function typeMessage(html) {
  const box = $('#dMessage');
  clearInterval(typingTimer);
  box.innerHTML = '';
  box.classList.add('typing-caret');

  /* печатаем по словам, чтобы не ломать теги <mark> */
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

function closeDrawer() {
  clearInterval(typingTimer);
  $('#drawer').classList.add('hidden');
  $('#drawerBackdrop').classList.add('hidden');
}

$('#drawerClose').addEventListener('click', closeDrawer);
$('#drawerBackdrop').addEventListener('click', closeDrawer);

$('#btnSend').addEventListener('click', () => {
  $('#sentNote').classList.remove('hidden');
  $('#btnSend').disabled = true;
  const id = $('#btnSend').dataset.id;
  const btn = document.querySelector(`.p-action[data-id="${id}"]`);
  if (btn) { btn.textContent = '✓ Отправлено'; btn.classList.add('sent'); }
});

$('#btnCopy').addEventListener('click', () => {
  navigator.clipboard && navigator.clipboard.writeText($('#dMessage').innerText);
  $('#btnCopy').textContent = '✓ Скопировано';
  setTimeout(() => { $('#btnCopy').textContent = 'Копировать'; }, 1600);
});

$('#btnCall').addEventListener('click', () => {
  alert('Сценарий звонка сформирован — откроется в отдельном окне (демо).');
});

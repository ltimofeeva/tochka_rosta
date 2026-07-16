/* ============ Точка роста АйТи — логика демо ============ */

/* ---------- Мобильное меню ---------- */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.addEventListener('click', e => {
  if (e.target.tagName === 'A') { mainNav.classList.remove('open'); navDropdown.classList.remove('open'); }
});

/* ---------- Выпадающее меню «О продукте» ---------- */
const navDropdown = document.getElementById('navDropdown');
const navDropBtn = navDropdown.querySelector('.nav-drop-btn');
navDropBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = navDropdown.classList.toggle('open');
  navDropBtn.setAttribute('aria-expanded', open);
});
document.addEventListener('click', e => {
  if (!navDropdown.contains(e.target)) {
    navDropdown.classList.remove('open');
    navDropBtn.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- Появление секций при скролле ---------- */
document.querySelectorAll('.section > .container > *').forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ============================================================
   ДЕМО 1 — Возвращаем пациентов из картотеки
   (данные — со слайда 3 презентации)
   ============================================================ */
const PATIENTS = [
  {
    name: 'Иван П.', visit: 'июнь 2025', proc: 'Удаление зуба', status: 'Не завершено',
    brief: [
      ['Был', 'удаление зуба, июнь 2025'],
      ['Не закончено', 'новый зуб на место удалённого так и не поставлен'],
      ['Чем грозит откладывание', 'соседние зубы смещаются, лечение дорожает'],
      ['Повод связаться', 'консультация по восстановлению'],
    ],
    message: '«Иван, после удаления зуба важно не затягивать с восстановлением, чтобы не пошла нагрузка на соседние зубы. Подобрать удобное время для консультации?»',
  },
  {
    name: 'Мария С.', visit: 'март 2025', proc: 'Консультация', status: 'Не завершено',
    brief: [
      ['Была', 'консультация, март 2025'],
      ['Не закончено', 'лечение так и не началось'],
      ['Чем грозит откладывание', 'проблема развивается — лечение дорожает'],
      ['Повод связаться', 'повторная консультация и план лечения'],
      ['Подход к пациенту', 'важна цена — рассказываем про рассрочку'],
    ],
    message: '«Мария, после консультации прошло время — лучше не откладывать начало лечения. Кстати, у нас появилась рассрочка без переплаты. Подобрать удобное время?»',
  },
  { name: 'Олег К.', visit: 'май 2025', proc: 'Имплантация', status: 'Лечение идёт' },
  { name: 'Анна Т.', visit: 'апрель 2025', proc: 'Лечение кариеса', status: 'Завершено' },
];

const STATUS_BADGE = {
  'Не завершено': 'badge-flag',
  'Лечение идёт': 'badge-progress',
  'Завершено': 'badge-ok',
};

function statusBadge(p) {
  return `<span class="badge ${STATUS_BADGE[p.status]}">${p.status === 'Не завершено' ? '⚠ ' : p.status === 'Завершено' ? '✓ ' : ''}${p.status}</span>`;
}

const tbody = document.querySelector('#patientsTable tbody');
const demo1Start = document.getElementById('demo1Start');
const demo1Status = document.getElementById('demo1Status');
const demo1Result = document.getElementById('demo1Result');
const patientBrief = document.getElementById('patientBrief');
const aiMessageText = document.getElementById('aiMessageText');
let demo1Running = false;
let typeTimer = null;

function isFlagged(p) { return p.status === 'Не завершено'; }

function renderPatients(state) {
  // state: 'idle' | номер сканируемой строки | 'done'
  tbody.innerHTML = '';
  PATIENTS.forEach((p, i) => {
    const tr = document.createElement('tr');
    let badge = '<span class="badge badge-wait">ожидает</span>';
    if (state === 'idle') badge = '<span class="badge badge-wait">—</span>';
    else if (typeof state === 'number') {
      if (i < state) badge = statusBadge(p);
      else if (i === state) { badge = '<span class="badge badge-scan">анализирую…</span>'; tr.classList.add('scanning'); }
    } else if (state === 'done') {
      badge = statusBadge(p);
    }
    const shown = state === 'done' || (typeof state === 'number' && i < state);
    if (shown && isFlagged(p)) tr.classList.add('flagged');
    if (shown && !isFlagged(p)) tr.classList.add('ok-row');
    tr.innerHTML = `<td>${p.name}</td><td>${p.visit}</td><td>${p.proc}</td><td>${badge}</td>`;
    if (tr.classList.contains('flagged')) tr.addEventListener('click', () => selectPatient(i));
    tr.dataset.index = i;
    tbody.appendChild(tr);
  });
}

function typeText(el, text, speed = 22) {
  clearInterval(typeTimer);
  el.textContent = '';
  el.classList.remove('done');
  let i = 0;
  typeTimer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) { clearInterval(typeTimer); el.classList.add('done'); }
  }, speed);
}

function fillBrief(el, p) {
  el.innerHTML =
    `<div><b>Пациент:</b> ${p.name} — ${p.proc.toLowerCase()}</div>` +
    p.brief.map(([k, v]) => `<div><b>${k}:</b> ${v}</div>`).join('');
}

function selectPatient(i) {
  const p = PATIENTS[i];
  if (!isFlagged(p)) return;
  tbody.querySelectorAll('tr').forEach(tr => tr.classList.toggle('active', +tr.dataset.index === i));
  fillBrief(patientBrief, p);
  demo1Result.hidden = false;
  document.querySelector('.demo1-body').classList.add('has-result');
  typeText(aiMessageText, p.message);
}

demo1Start.addEventListener('click', () => {
  if (demo1Running) return;
  demo1Running = true;
  demo1Result.hidden = true;
  document.querySelector('.demo1-body').classList.remove('has-result');
  demo1Start.disabled = true;
  let i = 0;
  demo1Status.textContent = 'ИИ просматривает картотеку…';
  const step = () => {
    renderPatients(i);
    if (i >= PATIENTS.length) {
      renderPatients('done');
      const found = PATIENTS.filter(isFlagged).length;
      demo1Status.textContent = `Готово: найдено ${found} пациента с незаконченным лечением — нажмите на строку`;
      demo1Start.disabled = false;
      demo1Start.textContent = '↻ Запустить анализ ещё раз';
      demo1Running = false;
      selectPatient(0);
      return;
    }
    i++;
    setTimeout(step, 550);
  };
  step();
});

renderPatients('idle');

/* ============================================================
   Автодемо в герое — то же демо модуля 1, но проигрывается само
   ============================================================ */
const heroTbody = document.querySelector('#heroTable tbody');
const heroStatus = document.getElementById('heroStatus');
const heroResult = document.getElementById('heroResult');
const heroAnalyzing = document.getElementById('heroAnalyzing');
const heroResultBody = document.getElementById('heroResultBody');
const heroBrief = document.getElementById('heroBrief');
const heroMsgText = document.getElementById('heroMsgText');
const heroFlagged = PATIENTS.map((p, i) => isFlagged(p) ? i : -1).filter(i => i >= 0);
let heroTypeTimer = null;

/* та же отрисовка, что и в модуле 1 */
function heroRender(state) {
  heroTbody.innerHTML = '';
  PATIENTS.forEach((p, i) => {
    const tr = document.createElement('tr');
    let badge = '<span class="badge badge-wait">ожидает</span>';
    if (state === 'idle') badge = '<span class="badge badge-wait">—</span>';
    else if (typeof state === 'number') {
      if (i < state) badge = statusBadge(p);
      else if (i === state) { badge = '<span class="badge badge-scan">анализирую…</span>'; tr.classList.add('scanning'); }
    } else if (state === 'done') {
      badge = statusBadge(p);
    }
    const shown = state === 'done' || (typeof state === 'number' && i < state);
    if (shown && isFlagged(p)) tr.classList.add('flagged');
    if (shown && !isFlagged(p)) tr.classList.add('ok-row');
    tr.innerHTML = `<td>${p.name}</td><td>${p.visit}</td><td>${p.proc}</td><td>${badge}</td>`;
    heroTbody.appendChild(tr);
  });
}

/* резервируем место под самый высокий разбор — карточка не меняет размер */
function heroReserveHeight() {
  heroResultBody.hidden = false;
  let max = 0;
  heroFlagged.forEach(idx => {
    const p = PATIENTS[idx];
    fillBrief(heroBrief, p);
    heroMsgText.textContent = p.message;
    max = Math.max(max, heroResult.offsetHeight);
  });
  heroResult.style.minHeight = max + 'px';
  heroBrief.innerHTML = '';
  heroMsgText.textContent = '';
  heroResultBody.hidden = true;
}

/* последовательный показ найденных пациентов */
function heroShowSeq(k) {
  heroAnalyzing.style.display = 'none';
  heroResultBody.hidden = false;
  const idx = heroFlagged[k];
  const p = PATIENTS[idx];
  heroTbody.querySelectorAll('tr').forEach((tr, i) => tr.classList.toggle('active', i === idx));
  fillBrief(heroBrief, p);
  clearInterval(heroTypeTimer);
  heroMsgText.textContent = '';
  heroMsgText.classList.remove('done');
  let j = 0;
  heroTypeTimer = setInterval(() => {
    heroMsgText.textContent = p.message.slice(0, ++j);
    if (j >= p.message.length) {
      clearInterval(heroTypeTimer);
      heroMsgText.classList.add('done');
      setTimeout(() => {
        if (k + 1 < heroFlagged.length) heroShowSeq(k + 1);
        else setTimeout(heroLoop, 1200);
      }, 3200);
    }
  }, 22);
}

function heroLoop() {
  heroResultBody.hidden = true;
  heroAnalyzing.style.display = 'flex';
  heroRender('idle');
  heroStatus.textContent = 'ИИ просматривает картотеку…';
  let i = 0;
  const step = () => {
    heroRender(i);
    if (i >= PATIENTS.length) {
      heroRender('done');
      heroStatus.textContent = `Готово: найдено ${heroFlagged.length} пациента с незаконченным лечением`;
      setTimeout(() => heroShowSeq(0), 600);
      return;
    }
    i++;
    setTimeout(step, 550);
  };
  setTimeout(step, 900);
}

heroReserveHeight();
heroLoop();

/* ============================================================
   ДЕМО 2 — Умный помощник в мессенджере
   (сценарий «острая боль» — со слайда 4 презентации)
   ============================================================ */
const SCENARIOS = {
  pain: {
    result: '<b>✓ Запись создана в расписании клиники</b>Пациент с острой болью получил ближайшее время — завтра, 9:30. Помощник напомнит за 2 часа до визита.',
    steps: [
      ['bot', 'Здравствуйте! Клиника «Улыбка» на связи. Чем можем помочь?'],
      ['user', 'Здравствуйте! Очень болит зуб, можно записаться сегодня-завтра?'],
      ['bot', 'Понимаю. При острой боли найдём ближайшее время — завтра, 9:30. Записать?'],
      ['user', 'Да, записывайте'],
      ['bot', 'Готово! Напомню за 2 часа до визита.'],
      ['system', '✓ Запись создана в расписании клиники'],
    ],
  },
  booking: {
    result: '<b>✓ Запись создана в расписании клиники</b>Помощник сам подобрал удобное время и записал пациента — без участия администратора.',
    steps: [
      ['bot', 'Здравствуйте! Клиника «Улыбка» на связи. Чем можем помочь?'],
      ['user', 'Хочу записаться на чистку зубов, но работаю до 18:00'],
      ['bot', 'Конечно! Есть вечернее время: четверг 18:30 или суббота утром 10:00. Как удобнее?'],
      ['user', 'Четверг подойдёт'],
      ['bot', 'Записала вас на четверг, 18:30. Напомню о визите накануне. Хорошего дня!'],
      ['system', '✓ Запись создана в расписании клиники'],
    ],
  },
  price: {
    result: '<b>✓ Вопрос о цене превращён в запись</b>Помощник не «назвал цену и замолчал», а предложил понятный следующий шаг — это и поднимает конверсию в запись.',
    steps: [
      ['bot', 'Здравствуйте! Клиника «Улыбка» на связи. Чем можем помочь?'],
      ['user', 'Сколько стоит имплантация зуба?'],
      ['bot', 'Имплантация «под ключ» — от 45 000 ₽. Точная стоимость зависит от диагностики — это займёт всего 40 минут, подберём время?'],
      ['user', 'Давайте'],
      ['bot', 'Есть время завтра в 11:00 или в пятницу в 17:30. Что удобнее?'],
      ['user', 'В пятницу'],
      ['bot', 'Записала вас на пятницу, 17:30. Напомню накануне. До встречи!'],
      ['system', '✓ Запись создана в расписании клиники'],
    ],
  },
};

const chatBody = document.getElementById('chatBody');
const chatResult = document.getElementById('chatResult');
const scenarioPicker = document.getElementById('scenarioPicker');
let chatTimers = [];

function clearChat() {
  chatTimers.forEach(t => clearTimeout(t));
  chatTimers = [];
  chatBody.innerHTML = '';
  chatResult.hidden = true;
}

function addMsg(kind, html) {
  const div = document.createElement('div');
  div.className = 'msg msg-' + kind;
  div.innerHTML = html;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
  return div;
}

function playScenario(key) {
  clearChat();
  const sc = SCENARIOS[key];
  let delay = 400;
  sc.steps.forEach(([who, text]) => {
    if (who === 'bot') {
      const tDelay = delay;
      chatTimers.push(setTimeout(() => {
        const typing = addMsg('bot', '<span class="typing"><i></i><i></i><i></i></span>');
        chatTimers.push(setTimeout(() => { typing.remove(); addMsg('bot', text); }, 900));
      }, tDelay));
      delay += 900 + Math.min(1800, 500 + text.length * 9);
    } else {
      const tDelay = delay;
      chatTimers.push(setTimeout(() => addMsg(who, text), tDelay));
      delay += who === 'system' ? 700 : 1000;
    }
  });
  chatTimers.push(setTimeout(() => {
    chatResult.innerHTML = sc.result;
    chatResult.hidden = false;
  }, delay + 200));
}

scenarioPicker.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  scenarioPicker.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === btn));
  playScenario(btn.dataset.scenario);
});

/* ============================================================
   ДЕМО 3 — Анализ звонков (звонки — со слайда 5 презентации)
   ============================================================ */
const CALLS = [
  {
    name: 'Иван П.', time: '09:32', dur: '1:58', topic: 'Имплантация', status: 'не записан', ok: false,
    lostAt: 2,
    transcript: [
      ['Пациент', 'Здравствуйте, подскажите, сколько у вас стоит имплантация?'],
      ['Администратор', 'Здравствуйте. Имплантация от 45 тысяч рублей.'],
      ['Администратор', '…', 'администратор назвал цену — и замолчал'],
      ['Пациент', 'Понятно… спасибо, я подумаю.'],
    ],
    fix: '«Точная стоимость зависит от диагностики — это займёт всего 40 минут, подберём время?» Пациент получает понятный следующий шаг вместо «голой» цены.',
  },
  {
    name: 'Мария С.', time: '11:07', dur: '3:12', topic: 'Чистка зубов', status: 'записана', ok: true,
    lostAt: -1,
    transcript: [
      ['Пациент', 'Добрый день, хочу записаться на чистку.'],
      ['Администратор', 'Добрый день! Конечно. Удобнее утром или вечером?'],
      ['Пациент', 'Вечером.'],
      ['Администратор', 'Есть четверг 18:30 и пятница 19:00. Что выбираете?'],
      ['Пациент', 'Четверг. Записывайте!'],
    ],
    fix: 'Хороший пример: администратор сразу предложил конкретное время на выбор. Такие фразы система добавляет в сценарии для всей команды.',
  },
  {
    name: 'Пётр Н.', time: '12:40', dur: '2:05', topic: 'Брекеты', status: 'не записан', ok: false,
    lostAt: 3,
    transcript: [
      ['Пациент', 'Здравствуйте! Дочке нужны брекеты, что посоветуете?'],
      ['Администратор', 'Здравствуйте. У нас есть ортодонт, приём по записи.'],
      ['Пациент', 'А когда можно попасть?'],
      ['Администратор', 'Посмотрите расписание на сайте, там всё есть.', 'пациент был готов записаться — но его отправили «на сайт»'],
      ['Пациент', 'Эм… хорошо, посмотрю.'],
    ],
    fix: '«Ортодонт принимает в среду и субботу. Есть время в субботу в 11:00 — записать на первичную консультацию?» Никогда не отправляем записываться «куда-то ещё».',
  },
  {
    name: 'Светлана В.', time: '16:30', dur: '1:12', topic: 'Отбеливание', status: 'перезвонить', ok: false,
    lostAt: 1,
    transcript: [
      ['Пациент', 'Скажите, отбеливание — это вредно для эмали?'],
      ['Администратор', 'Ну, это лучше у врача спросить, я не подскажу.', 'сомнение пациента осталось без ответа — частая причина срыва записи'],
      ['Пациент', 'Ладно, тогда я ещё почитаю отзывы.'],
    ],
    fix: '«Врач сначала оценит эмаль на бесплатной консультации и честно скажет, подойдёт ли вам отбеливание. Записать?» Система собирает такие сомнения и готовые ответы на них.',
  },
];

const REASONS = [
  ['Не предложили время записи', 34],
  ['Сомнение осталось без ответа', 28],
  ['Назвали цену без следующего шага', 22],
  ['Долгое ожидание на линии', 16],
];

const callsList = document.getElementById('callsList');
const callReview = document.getElementById('callReview');

CALLS.forEach((c, i) => {
  const btn = document.createElement('button');
  btn.className = 'call-item';
  const badgeClass = c.ok ? 'badge-ok' : (c.status === 'перезвонить' ? 'badge-scan' : 'badge-flag');
  btn.innerHTML = `<span><b>${c.name}</b><small>${c.time} · ${c.dur} · ${c.topic}</small></span><span class="badge ${badgeClass}">${c.status}</span>`;
  btn.addEventListener('click', () => showCall(i));
  callsList.appendChild(btn);
});

function showCall(i) {
  const c = CALLS[i];
  callsList.querySelectorAll('.call-item').forEach((b, j) => b.classList.toggle('active', j === i));
  const lines = c.transcript.map(([who, text, note], j) => {
    const lost = j === c.lostAt;
    return `<div class="tr-line${lost ? ' lost' : ''}"><b>${who}:</b> ${text}${lost && note ? `<span class="tr-lost-note">⚠ Где потеряли: ${note}</span>` : ''}</div>`;
  }).join('');
  callReview.innerHTML = `
    <div class="review-meta">
      <span class="badge badge-scan">${c.time} · ${c.dur}</span>
      <span class="badge badge-wait">${c.topic}</span>
      <span class="badge ${c.ok ? 'badge-ok' : 'badge-flag'}">${c.status}</span>
    </div>
    <div class="review-transcript">${lines}</div>
    <div class="review-fix"><b>${c.ok ? '✓ Что взять в сценарии:' : '💡 Как надо:'}</b>${c.fix}</div>`;
}

/* Диаграмма причин: один тон синего — величина, прямые подписи значений */
const reasonsChart = document.getElementById('reasonsChart');
REASONS.forEach(([label, val]) => {
  const row = document.createElement('div');
  row.className = 'hbar-row';
  row.innerHTML = `<span>${label}</span><div class="hbar-track"><div class="hbar-fill" data-w="${val / REASONS[0][1] * 100}"></div></div><span class="hbar-val">${val}%</span>`;
  reasonsChart.appendChild(row);
});
const chartIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.querySelectorAll('.hbar-fill').forEach(f => { f.style.width = f.dataset.w + '%'; });
    chartIO.unobserve(en.target);
  });
}, { threshold: 0.4 });
chartIO.observe(reasonsChart);

/* Открыть первый звонок по умолчанию, когда демо попадает в поле зрения */
const demo3IO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    showCall(0);
    demo3IO.unobserve(en.target);
  });
}, { threshold: 0.2 });
demo3IO.observe(document.getElementById('demo3'));

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
   Автодемо в герое — зацикленный «видеоролик» анализа картотеки
   ============================================================ */
const HERO_ROWS = [
  { name: 'Иван П.', proc: 'удаление зуба · июнь 2025', flag: true },
  { name: 'Мария С.', proc: 'консультация · март 2025', flag: true },
  { name: 'Ольга В.', proc: 'профгигиена · май 2026', flag: false },
  { name: 'Алексей К.', proc: 'слепки для коронки · февраль 2026', flag: true },
];
const HERO_MSG = '«После удаления зуба важно не затягивать с восстановлением. Подобрать удобное время для консультации?»';

const heroRowsEl = document.getElementById('heroDemoRows');
const heroMsgEl = document.getElementById('heroDemoMsg');
const heroTextEl = document.getElementById('heroDemoText');

function heroBuildRows() {
  heroRowsEl.innerHTML = HERO_ROWS.map(r =>
    `<div class="hd-row"><span><b>${r.name}</b><small>${r.proc}</small></span><span class="badge badge-wait">—</span></div>`
  ).join('');
}

function heroLoop() {
  heroBuildRows();
  heroMsgEl.classList.remove('show');
  heroTextEl.textContent = '';
  const rows = [...heroRowsEl.children];
  let i = 0;
  const scanNext = () => {
    rows.forEach(r => r.classList.remove('scanning'));
    if (i > 0) {
      const prev = rows[i - 1], data = HERO_ROWS[i - 1];
      prev.classList.toggle('flag', data.flag);
      prev.querySelector('.badge').outerHTML = data.flag
        ? '<span class="badge badge-flag">⚠ вернуть</span>'
        : '<span class="badge badge-ok">✓ ок</span>';
    }
    if (i >= rows.length) { heroShowMsg(); return; }
    rows[i].classList.add('scanning');
    rows[i].querySelector('.badge').outerHTML = '<span class="badge badge-scan">анализ…</span>';
    i++;
    setTimeout(scanNext, 650);
  };
  setTimeout(scanNext, 700);
}

function heroShowMsg() {
  heroMsgEl.classList.add('show');
  let j = 0;
  const t = setInterval(() => {
    heroTextEl.textContent = HERO_MSG.slice(0, ++j);
    if (j >= HERO_MSG.length) {
      clearInterval(t);
      setTimeout(heroLoop, 3800); // пауза и повтор «ролика»
    }
  }, 28);
}

heroLoop();

/* ============================================================
   ДЕМО 1 — Возвращаем пациентов из картотеки
   ============================================================ */
const PATIENTS = [
  {
    name: 'Иван П.', visit: 'июнь 2025', proc: 'Удаление зуба', flagged: true,
    brief: [
      ['Был', 'удаление зуба, июнь 2025'],
      ['Не закончено', 'новый зуб на место удалённого так и не поставлен'],
      ['Чем грозит откладывание', 'соседние зубы смещаются, лечение дорожает'],
      ['Повод связаться', 'консультация по восстановлению'],
      ['Подход к пациенту', 'по истории общения важно «не больно» — делаем акцент на комфорт'],
    ],
    message: '«После удаления зуба важно не затягивать с восстановлением, чтобы не пошла нагрузка на соседние зубы. Подобрать удобное время для консультации?»',
  },
  {
    name: 'Мария С.', visit: 'март 2025', proc: 'Консультация по имплантации', flagged: true,
    brief: [
      ['Была', 'консультация по имплантации, март 2025'],
      ['Не закончено', 'лечение так и не началось'],
      ['Чем грозит откладывание', 'костная ткань убывает — имплантация усложняется'],
      ['Повод связаться', 'повторная консультация и план лечения'],
      ['Подход к пациенту', 'в переписке спрашивала о стоимости — предлагаем рассрочку'],
    ],
    message: '«Мария, после консультации прошло время — костная ткань в месте отсутствующего зуба постепенно убывает, и лучше не откладывать. Кстати, у нас появилась рассрочка без переплаты. Рассказать подробнее?»',
  },
  {
    name: 'Ольга В.', visit: 'май 2026', proc: 'Профгигиена', flagged: false },
  {
    name: 'Алексей К.', visit: 'февраль 2026', proc: 'Слепки для коронки', flagged: true,
    brief: [
      ['Был', 'подготовка зуба и слепки для коронки, февраль 2026'],
      ['Не закончено', 'постоянная коронка не установлена — стоит временная'],
      ['Чем грозит откладывание', 'временная коронка не рассчитана на долгий срок — зуб под ней уязвим'],
      ['Повод связаться', 'установка готовой коронки'],
      ['Подход к пациенту', 'ценит своё время — подчёркиваем, что визит займёт 40 минут'],
    ],
    message: '«Алексей, ваша постоянная коронка готова. Временная не рассчитана на долгий срок — зуб под ней остаётся уязвимым. Установка займёт около 40 минут. Подобрать время на этой неделе?»',
  },
  { name: 'Дмитрий Н.', visit: 'апрель 2026', proc: 'Лечение кариеса', flagged: false },
  { name: 'Елена Т.', visit: 'июнь 2026', proc: 'Отбеливание', flagged: false },
];

const tbody = document.querySelector('#patientsTable tbody');
const demo1Start = document.getElementById('demo1Start');
const demo1Status = document.getElementById('demo1Status');
const demo1Result = document.getElementById('demo1Result');
const patientBrief = document.getElementById('patientBrief');
const aiMessageText = document.getElementById('aiMessageText');
let demo1Running = false;
let typeTimer = null;

function renderPatients(state) {
  // state: 'idle' | index досмотренной строки | 'done'
  tbody.innerHTML = '';
  PATIENTS.forEach((p, i) => {
    const tr = document.createElement('tr');
    let badge = '<span class="badge badge-wait">ожидает</span>';
    if (state === 'idle') badge = '<span class="badge badge-wait">—</span>';
    else if (typeof state === 'number') {
      if (i < state) badge = p.flagged
        ? '<span class="badge badge-flag">⚠ незаконченное лечение</span>'
        : '<span class="badge badge-ok">✓ лечение завершено</span>';
      else if (i === state) { badge = '<span class="badge badge-scan">анализирую…</span>'; tr.classList.add('scanning'); }
    } else if (state === 'done') {
      badge = p.flagged
        ? '<span class="badge badge-flag">⚠ незаконченное лечение</span>'
        : '<span class="badge badge-ok">✓ лечение завершено</span>';
    }
    if ((state === 'done' || (typeof state === 'number' && i < state)) && p.flagged) tr.classList.add('flagged');
    if ((state === 'done' || (typeof state === 'number' && i < state)) && !p.flagged) tr.classList.add('ok-row');
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

function selectPatient(i) {
  const p = PATIENTS[i];
  if (!p.flagged) return;
  tbody.querySelectorAll('tr').forEach(tr => tr.classList.toggle('active', +tr.dataset.index === i));
  patientBrief.innerHTML =
    `<div><b>Пациент:</b> ${p.name} — ${p.proc.toLowerCase()}</div>` +
    p.brief.map(([k, v]) => `<div><b>${k}:</b> ${v}</div>`).join('');
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
      const found = PATIENTS.filter(p => p.flagged).length;
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
   ДЕМО 2 — Умный помощник в мессенджере
   ============================================================ */
const SCENARIOS = {
  booking: {
    result: '<b>✅ Запись создана и добавлена в расписание клиники</b>Чистка зубов · чт, 16 июля, 18:30 · врач-гигиенист Соколова А. И. За день до визита помощник напомнит и попросит подтвердить запись.',
    steps: [
      ['user', 'Здравствуйте! Хочу записаться на чистку зубов, но работаю до 18:00'],
      ['bot', 'Здравствуйте! Конечно 🙂 Профессиональная гигиена занимает около часа. Есть вечернее время: в четверг 16 июля в 18:30 или в субботу утром в 10:00. Как вам удобнее?'],
      ['user', 'Четверг подойдёт'],
      ['bot', 'Отлично! Записала вас на четверг, 16 июля, 18:30, к врачу-гигиенисту Соколовой Анне Ивановне. Приём в клинике на ул. Ленина, 12. Напомнить вам о визите накануне?'],
      ['user', 'Да, напомните пожалуйста'],
      ['bot', 'Готово! Запись уже в расписании клиники. В среду вечером пришлю напоминание. Хорошего дня! 😊'],
      ['system', '🗓 Запись автоматически создана в расписании — без участия администратора'],
    ],
  },
  pain: {
    result: '<b>✅ Пациент с острой болью записан в ближайшее свободное окно</b>Сегодня, 14:40 · дежурный врач Орлов Д. С. Администратор получил уведомление о срочном пациенте.',
    steps: [
      ['user', 'Здравствуйте, у меня очень болит зуб, дёргает всю ночь 😖'],
      ['bot', 'Здравствуйте! Сочувствую, острая боль — это тяжело. Таких пациентов мы принимаем в ближайшее свободное время. Сегодня есть окно в 14:40 у дежурного врача Орлова Дмитрия Сергеевича. Успеете подъехать?'],
      ['user', 'Да, успею!'],
      ['bot', 'Записала вас на сегодня, 14:40. Возьмите с собой паспорт. Если боль усилится — примите обезболивающее, которое вам обычно подходит, но не грейте больное место. Ждём вас!'],
      ['system', '🚨 Помощник поставил пациента с острой болью в ближайшее окно и предупредил администратора'],
    ],
  },
  price: {
    result: '<b>✅ Вопрос о цене превращён в запись на консультацию</b>Помощник не «назвал цену и замолчал», а предложил понятный следующий шаг — это и поднимает конверсию в запись.',
    steps: [
      ['user', 'Добрый день! Сколько стоит имплантация зуба?'],
      ['bot', 'Добрый день! Имплантация «под ключ» в нашей клинике — от 45 000 ₽. Точная стоимость зависит от диагностики: состояния кости и соседних зубов. Давайте начнём с консультации и снимка — это займёт 30 минут, и вы получите точный план и цену. Подобрать время?'],
      ['user', 'А консультация платная?'],
      ['bot', 'Консультация по имплантации бесплатная, снимок — 800 ₽, при начале лечения он входит в стоимость. Есть время завтра в 11:00 или в пятницу в 17:30. Что удобнее?'],
      ['user', 'Давайте в пятницу'],
      ['bot', 'Записала вас на пятницу, 17:30, к хирургу-имплантологу Белову Игорю Петровичу. Пришлю напоминание накануне. До встречи! 😊'],
      ['system', '💬 Сложные вопросы (боль, жалобы, нестандартные случаи) помощник сразу передаёт живому администратору'],
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
      // сначала «печатает…», потом сообщение
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
   Калькулятор неотвеченных звонков
   ============================================================ */
const fmt = n => new Intl.NumberFormat('ru-RU').format(Math.round(n));
const calcEls = {
  calls: document.getElementById('calcCalls'),
  missed: document.getElementById('calcMissed'),
  conv: document.getElementById('calcConv'),
  check: document.getElementById('calcCheck'),
};
const calcOuts = {
  calls: document.getElementById('calcCallsOut'),
  missed: document.getElementById('calcMissedOut'),
  conv: document.getElementById('calcConvOut'),
  check: document.getElementById('calcCheckOut'),
};

function recalc() {
  const calls = +calcEls.calls.value;
  const missedPct = +calcEls.missed.value;
  const convPct = +calcEls.conv.value;
  const check = +calcEls.check.value;
  const lostPatients = calls * missedPct / 100;
  const lostVisits = lostPatients * convPct / 100;
  const lostMoney = lostVisits * check;
  calcOuts.calls.textContent = fmt(calls);
  calcOuts.missed.textContent = missedPct + '%';
  calcOuts.conv.textContent = convPct + '%';
  calcOuts.check.textContent = fmt(check) + ' ₽';
  document.getElementById('calcTotal').textContent = '≈ ' + fmt(lostMoney) + ' ₽';
  document.getElementById('calcDetail').textContent =
    fmt(lostPatients) + ' потерянных пациентов → ' + fmt(lostVisits) + ' несостоявшихся визитов';
}
Object.values(calcEls).forEach(el => el.addEventListener('input', recalc));
recalc();

/* ============================================================
   ДЕМО 3 — Анализ звонков
   ============================================================ */
const CALLS = [
  {
    time: 'Пн 10:12', topic: 'Имплантация', status: 'не записан', ok: false,
    lostAt: 2,
    transcript: [
      ['Пациент', 'Здравствуйте, подскажите, сколько у вас стоит имплантация?'],
      ['Администратор', 'Здравствуйте. Имплантация от 45 тысяч рублей.'],
      ['Администратор', '…', 'Администратор назвал цену — и замолчал, не предложил следующий шаг'],
      ['Пациент', 'Понятно… спасибо, я подумаю.'],
    ],
    fix: '«Точная стоимость зависит от диагностики — давайте начнём с консультации и снимка, это займёт 30 минут». Пациент получает понятный следующий шаг вместо «голой» цены.',
  },
  {
    time: 'Пн 12:47', topic: 'Чистка зубов', status: 'записан', ok: true,
    lostAt: -1,
    transcript: [
      ['Пациент', 'Добрый день, хочу записаться на чистку.'],
      ['Администратор', 'Добрый день! Конечно. Удобнее утром или вечером?'],
      ['Пациент', 'Вечером.'],
      ['Администратор', 'Есть четверг 18:30 и пятница 19:00. Что выбираете?'],
      ['Пациент', 'Четверг. Записывайте!'],
    ],
    fix: 'Хороший пример: администратор сразу предложил конкретное время на выбор. Такие фразы программа добавляет в сценарии для всей команды.',
  },
  {
    time: 'Вт 09:03', topic: 'Брекеты', status: 'не записан', ok: false,
    lostAt: 3,
    transcript: [
      ['Пациент', 'Здравствуйте! Дочке нужны брекеты, что посоветуете?'],
      ['Администратор', 'Здравствуйте. У нас есть ортодонт, приём по записи.'],
      ['Пациент', 'А когда можно попасть?'],
      ['Администратор', 'Посмотрите расписание на сайте, там всё есть.', 'Пациента был готов записаться — но его отправили «на сайт» вместо предложения времени'],
      ['Пациент', 'Эм… хорошо, посмотрю.'],
    ],
    fix: '«Ортодонт принимает в среду и субботу. На этой неделе есть время в субботу в 11:00 — записать дочку на первичную консультацию?» Никогда не отправляем записываться «куда-то ещё».',
  },
  {
    time: 'Вт 16:30', topic: 'Отбеливание', status: 'перезвонить', ok: false,
    lostAt: 1,
    transcript: [
      ['Пациент', 'Скажите, отбеливание — это вредно для эмали?'],
      ['Администратор', 'Ну, это лучше у врача спросить, я не подскажу.', 'Сомнение пациента осталось без ответа — а это самая частая причина срыва записи'],
      ['Пациент', 'Ладно, тогда я ещё почитаю отзывы.'],
    ],
    fix: '«Отличный вопрос! Мы используем систему с реминерализацией — врач сначала оценит эмаль на бесплатной консультации и честно скажет, подойдёт ли вам отбеливание. Записать?» Программа собирает такие сомнения и готовые ответы на них.',
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
  btn.innerHTML = `<span><b>${c.topic}</b><small>${c.time}</small></span><span class="badge ${badgeClass}">${c.status}</span>`;
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
      <span class="badge badge-scan">${c.time}</span>
      <span class="badge badge-wait">${c.topic}</span>
      <span class="badge ${c.ok ? 'badge-ok' : 'badge-flag'}">${c.status}</span>
    </div>
    <div class="review-transcript">${lines}</div>
    <div class="review-fix"><b>${c.ok ? '✅ Что взять в сценарии:' : '💡 Как надо:'}</b>${c.fix}</div>`;
}

/* Диаграмма причин: одна тональность синего — величина, прямые подписи значений */
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

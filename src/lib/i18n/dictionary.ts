// Translation dictionary. Keep keys flat and namespaced by `.`.
// Add a key here once, reference it via `t("key")` anywhere.
//
// Russian strings are translated for every user-facing English string.
// If a key is missing from `ru`, the `en` value is used as a fallback.

export type Locale = "en" | "ru";

export const SUPPORTED_LOCALES: Locale[] = ["en", "ru"];

export const dictionaries = {
  en: {
    // Nav
    "nav.play": "Play",
    "nav.puzzles": "Puzzles",
    "nav.coach": "Coach",
    "nav.leaderboard": "Leaderboard",
    "nav.shop": "Shop",
    "nav.signIn": "Sign in",
    "nav.signOut": "Sign out",
    "nav.account": "Account",
    "nav.guestMode": "Guest mode",
    "nav.theme.toggle": "Toggle theme",
    "nav.language.toggle": "Switch language",

    // Landing
    "landing.badge": "AI Coach included",
    "landing.title.line1": "Connect Four that",
    "landing.title.line2": "makes you better.",
    "landing.subtitle":
      "Every match gets analyzed move-by-move. The Coach calls out blunders, spots missed wins, and explains the threats you let through — so the next game, you win.",
    "landing.cta.playNow": "Play now",
    "landing.cta.seeCoach": "See the Coach",
    "landing.cta.note": "Free forever. Upgrade for deeper analysis and custom boards.",
    "landing.feature.analysis.title": "Move-by-move analysis",
    "landing.feature.analysis.body":
      "Every move gets a label — Best, Inaccuracy, Blunder — with a plain-English reason. No more guessing what went wrong.",
    "landing.feature.opponents.title": "Three AI opponents",
    "landing.feature.opponents.body":
      "From a friendly tutor to a ruthless master that looks 8 moves ahead and punishes every mistake. Pick your level.",
    "landing.feature.online.title": "Online with a link",
    "landing.feature.online.body":
      "Send a URL to a friend, play in real time. Reconnect after a refresh, no account needed for casual games.",
    "landing.feature.ratings.title": "Ratings & history",
    "landing.feature.ratings.body":
      "ELO ratings, match history, replays. Watch how your play improves week over week.",
    "landing.feature.hints.title": "Hints when you're stuck",
    "landing.feature.hints.body":
      "One-tap suggestion of the engine's top move. Use it to learn, not to win.",
    "landing.feature.puzzles.title": "Daily puzzle",
    "landing.feature.puzzles.body":
      "A fresh tactical position every day. Spot the winning move, keep your streak alive, sharpen your eye.",
    "landing.hero.evalBest": "Best",
    "landing.hero.evalInaccuracy": "Inaccuracy",
    "landing.hero.evalBlunder": "Blunder",
    "landing.hero.depthValue": "8",
    "landing.hero.depthLabel": "moves ahead",
    "landing.hero.depthCaption": "Engine depth",
    "landing.pro.title": "Your personal grandmaster.",
    "landing.pro.subtitle":
      "Free already makes you a strong player. Pro makes you the one others fear.",
    "landing.pro.cta": "Upgrade to Pro",
    "landing.pro.popular": "Most popular",
    "landing.pro.period": "/mo",
    "landing.pro.free.name": "Free",
    "landing.pro.free.price": "$0",
    "landing.pro.free.cta": "Your current plan",
    "landing.pro.pro.name": "Pro",
    "landing.pro.pro.price": "$4",
    "landing.pro.free.f1": "3-level engine — looks up to 6 moves ahead",
    "landing.pro.free.f2": "Vs AI & online play via link",
    "landing.pro.free.f3": "AI Coach — every move analyzed",
    "landing.pro.free.f4neg": "Opening books",
    "landing.pro.free.f5neg": "Custom board themes",
    "landing.footer": "Built for nFactorial. Open source.",

    // Play picker
    "play.picker.title": "Pick a mode",
    "play.picker.subtitle":
      "Three ways to play. All games can be analyzed by the AI Coach when they finish.",
    "play.picker.hotSeat.title": "Hot seat",
    "play.picker.hotSeat.body":
      "Two players on one device. Quickest way to play with the person next to you.",
    "play.picker.ai.title": "Vs AI",
    "play.picker.ai.body":
      "Three levels — from a friendly tutor to a master that looks 10 moves ahead.",
    "play.picker.online.title": "Online with a link",
    "play.picker.online.body":
      "Create a room, send the link, play in real time. No sign-up needed.",
    "play.picker.linkPlay": "Play →",
    "play.more.title": "Or explore",
    "play.more.puzzles.desc": "Daily puzzle — find the best move",
    "play.more.coach.desc": "Replay & analyze your games",
    "play.more.leaderboard.desc": "Top players by ELO",

    // Game view
    "game.kicker.local": "Local · hot seat",
    "game.kicker.ai": "vs AI",
    "game.title.local": "Two players, one device",
    "game.title.ai": "Beat the engine",
    "game.difficulty.easy": "Easy",
    "game.difficulty.medium": "Medium",
    "game.difficulty.hard": "Hard",
    "game.button.hint": "Hint",
    "game.button.undo": "Undo",
    "game.button.newGame": "New game",
    "game.status.win.local": "Player {p} wins! 🎉",
    "game.status.win.ai.loss": "Next time for sure!",
    "game.status.win.ai.win": "You won!",
    "game.status.draw": "Draw — perfectly balanced.",
    "game.status.draw.local": "Draw. Solid game, both of you.",
    "game.status.turn.local": "Player {p} to move",
    "game.status.turn.you": "Your move",
    "game.status.turn.thinking": "Engine is thinking…",
    "game.status.turn.engine": "Engine's move",
    "game.tip.local": "Tip: tap a column to drop. Hot-seat — pass the device after each move.",
    "game.analyze": "Analyze with AI Coach →",
    "game.result.playAgain": "Play again",
    "game.result.viewBoard": "View the board",
    "game.result.close": "Close",
    "game.button.fullscreen": "Fullscreen",
    "game.button.exitFullscreen": "Exit",

    // Online
    "online.title": "Online play",
    "online.subtitle":
      "Create a room and share the link — your opponent doesn't need an account.",
    "online.create.title": "Create a new room",
    "online.create.body": "You play as Yellow. Send the link to your opponent.",
    "online.create.button": "Create room",
    "online.join.title": "Join with a code",
    "online.join.body": "Got a code from a friend? Enter it here.",
    "online.join.button": "Join room",
    "online.placeholder.needSupabase": "Online play needs Supabase",
    "online.placeholder.needSupabaseBody":
      "Set the Supabase environment variables to enable real-time rooms.",
    "online.room.kicker": "Room {code}",
    "online.room.yellow": "You play Yellow",
    "online.room.red": "You play Red",
    "online.room.connecting": "Connecting…",
    "online.room.invite": "Copy invite link",
    "online.room.copied": "Copied",
    "online.room.rematch": "Rematch",
    "online.room.waiting": "Waiting for your opponent — share the invite link.",
    "online.room.you.win": "You win! 🎉",
    "online.room.you.lose": "Your opponent wins this round.",
    "online.room.draw": "Draw.",
    "online.room.turn.you": "Your move",
    "online.room.turn.opp": "Opponent's move…",

    // Coach
    "coach.kicker": "AI Coach",
    "coach.empty.title": "AI Coach",
    "coach.empty.body":
      "Finish a game first — the Coach reviews every move once the match ends. Try a",
    "coach.empty.link": "quick game vs the AI",
    "coach.analyzing": "Analyzing {n} moves with the engine…",
    "coach.move.start": "Starting position",
    "coach.move.title": "Move {n} — {color} plays column {col}",
    "coach.color.yellow": "Yellow",
    "coach.color.red": "Red",
    "coach.evalLabel": "Engine eval",
    "coach.suggested": "Suggested: column {col}",
    "coach.summary": "Summary",
    "coach.moveList": "Move list",
    "coach.stat.best": "Best moves",
    "coach.stat.inaccuracies": "Inaccuracies",
    "coach.stat.mistakes": "Mistakes",
    "coach.stat.blunders": "Blunders",
    "coach.label.Best": "Best",
    "coach.label.Brilliant": "Brilliant",
    "coach.label.Good": "Good",
    "coach.label.Book": "Book",
    "coach.label.Inaccuracy": "Inaccuracy",
    "coach.label.Mistake": "Mistake",
    "coach.label.Blunder": "Blunder",
    "coach.label.MissedWin": "Missed win",
    "coach.label.Forced": "Forced",

    // Coach explanation templates — keyed by pattern kind
    "coach.expl.winning_move": "Winning move — completing four-in-a-row.",
    "coach.expl.missed_win":
      "Missed a win in one — column {best} would have completed four-in-a-row.",
    "coach.expl.missed_defense":
      "{opp} now wins by playing column {block}. The block was column {block}.",
    "coach.expl.forced_block":
      "Forced block — {opp} was threatening column {col}.",
    "coach.expl.fork": "Creates a double threat ({n} winning replies). {opp} can only block one.",
    "coach.expl.opening_center":
      "Best opening — taking the center sets up the most winning lines.",
    "coach.expl.best": "Engine's top choice. {self} keeps the initiative.",
    "coach.expl.good_match":
      "Solid move.",
    "coach.expl.good_close":
      "Solid move; column {best} was slightly stronger.",
    "coach.expl.inaccuracy":
      "Lets some of the advantage slip. Column {best} was more accurate.",
    "coach.expl.mistake":
      "Column {best} was clearly stronger — this move weakens {self}'s position.",
    "coach.expl.blunder":
      "Decisive error — column {best} kept the game balanced. After this, {opp} should win with best play.",

    // Puzzles
    "puzzles.kicker.day": "Daily puzzle",
    "puzzles.streak": "streak",
    "puzzles.solved": "solved",
    "puzzles.feedback.idle": "Click a column to commit to your move. One shot — make it count.",
    "puzzles.feedback.correct": "Correct.",
    "puzzles.feedback.wrong": "Not this time — the right move was column {col}.",
    "puzzles.button.tryAgain": "Try again",
    "puzzles.button.next": "Next puzzle →",
    "puzzles.tag.MateIn1": "Mate in 1",
    "puzzles.tag.BlockTheThreat": "Block the threat",
    "puzzles.tag.Opening": "Opening",
    "puzzles.tag.Tactics": "Tactics",
    "puzzles.title": "Puzzles",
    "puzzles.subtitle": "Pick a position and find the best move.",
    "puzzles.difficulty.easy": "Easy",
    "puzzles.difficulty.medium": "Medium",
    "puzzles.difficulty.hard": "Hard",
    "puzzles.play": "Solve",
    "puzzles.back": "All puzzles",
    "puzzles.featuredCta": "Solve today's",
    "puzzles.doneBadge": "Solved",
    "puzzles.sectionProgress": "{done}/{total} solved",

    // Auth / login
    "login.title": "Sign in",
    "login.subtitle": "We'll email you a magic link. No password to remember.",
    "login.email": "Email",
    "login.send": "Send magic link",
    "login.sending": "Sending…",
    "login.sent": "Check your inbox at {email} — click the link to finish signing in.",
    "login.google": "Continue with Google",
    "login.google.notEnabled":
      "Google sign-in isn't enabled yet. Use the magic link above, or enable the Google provider in Supabase.",
    "login.or": "or",
    "login.disabled.title": "Sign-in is disabled",
    "login.disabled.body":
      "The Supabase environment variables aren't set. Local games still work without an account. To enable history, ratings, and online play, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",

    // Onboarding
    "onboarding.title": "Choose a nickname",
    "onboarding.subtitle": "This is the name everyone sees on the leaderboard. Your email is never shown.",
    "onboarding.label": "Nickname",
    "onboarding.placeholder": "e.g. tactician42",
    "onboarding.hint": "3–20 characters: letters, digits, or underscore.",
    "onboarding.save": "Save and continue",
    "onboarding.saving": "Saving…",
    "onboarding.error.format": "Use 3–20 characters: letters, digits, or underscore.",
    "onboarding.error.taken": "That nickname is already taken — pick another.",
    "onboarding.error.email": "Don't use your email as a nickname — pick something else.",
    "onboarding.error.generic": "Couldn't save your nickname. Please try again.",

    // Pro
    "pro.badge": "FourSight Pro",
    "pro.price": "$4 / month",
    "pro.tagline": "Go from playing Connect Four to thinking like a grandmaster of it.",
    "pro.feat.depth": "Grandmaster-level analysis — 13 moves ahead (6 on free)",
    "pro.feat.book": "Opening book — first 8 plies pre-computed",
    "pro.feat.history": "Unlimited match history & replays",
    "pro.feat.themes": "Custom board themes (5 styles)",
    "pro.feat.queue": "Priority matchmaking for online play",
    "pro.feat.prose": "Coach annotations in Claude-quality prose",
    "pro.cta": "Upgrade to Pro",
    "pro.opening": "Opening checkout…",
    "pro.fineprint": "Cancel any time. Stripe handles payment; we never see your card.",

    // Shop
    "shop.title": "Shop",
    "shop.subtitle": "Spend coins you earn from wins on custom disc colors and board themes.",
    "shop.coins": "{n} coins",
    "shop.signInTitle": "Sign in to shop",
    "shop.signInBody": "Coins and cosmetics are tied to your account. Sign in to start earning and customizing.",
    "shop.signIn": "Sign in",
    "shop.section.yourBalls": "Your discs",
    "shop.section.oppBalls": "Opponent discs",
    "shop.section.boards": "Board themes",
    "shop.buy": "Buy · {price}",
    "shop.equip": "Equip",
    "shop.equipped": "Equipped",
    "shop.owned": "Owned",
    "shop.free": "Free",
    "shop.notEnough": "Not enough coins",
    "shop.preview": "Preview",
  } satisfies Record<string, string>,
  ru: {
    // Nav
    "nav.play": "Играть",
    "nav.puzzles": "Задачи",
    "nav.coach": "Тренер",
    "nav.leaderboard": "Рейтинг",
    "nav.shop": "Магазин",
    "nav.signIn": "Войти",
    "nav.signOut": "Выйти",
    "nav.account": "Аккаунт",
    "nav.guestMode": "Гостевой режим",
    "nav.theme.toggle": "Сменить тему",
    "nav.language.toggle": "Сменить язык",

    // Landing
    "landing.badge": "С AI-тренером",
    "landing.title.line1": "«Четыре в ряд»,",
    "landing.title.line2": "которые делают тебя сильнее.",
    "landing.subtitle":
      "Каждая партия разбирается ход за ходом. Тренер находит ошибки, упущенные выигрыши и объясняет угрозы, которые ты пропустил — чтобы в следующей партии ты выиграл.",
    "landing.cta.playNow": "Играть",
    "landing.cta.seeCoach": "Посмотреть тренера",
    "landing.cta.note": "Бесплатно навсегда. Pro — для глубокого анализа и кастомных досок.",
    "landing.feature.analysis.title": "Разбор каждого хода",
    "landing.feature.analysis.body":
      "Каждому ходу присваивается метка — Лучший, Неточность, Зевок — с понятным объяснением. Больше не нужно гадать, где ошибся.",
    "landing.feature.opponents.title": "Три уровня AI-соперника",
    "landing.feature.opponents.body":
      "От дружелюбного учителя до беспощадного мастера, который считает на 8 ходов вперёд и наказывает каждую ошибку. Выбери свой уровень.",
    "landing.feature.online.title": "Онлайн по ссылке",
    "landing.feature.online.body":
      "Отправь URL другу и играй в реальном времени. Переподключение после обновления страницы — без аккаунта.",
    "landing.feature.ratings.title": "Рейтинг и история",
    "landing.feature.ratings.body":
      "ELO-рейтинг, история партий, повторы. Смотри, как растёт твоя игра неделя за неделей.",
    "landing.feature.hints.title": "Подсказки, когда застрял",
    "landing.feature.hints.body":
      "Одно нажатие — и движок подсказывает лучший ход. Используй, чтобы учиться, а не побеждать.",
    "landing.feature.puzzles.title": "Задача дня",
    "landing.feature.puzzles.body":
      "Каждый день — новая тактическая позиция. Найди выигрышный ход, держи серию и набивай глаз на комбинации.",
    "landing.hero.evalBest": "Лучший",
    "landing.hero.evalInaccuracy": "Неточность",
    "landing.hero.evalBlunder": "Зевок",
    "landing.hero.depthValue": "8",
    "landing.hero.depthLabel": "ходов вперёд",
    "landing.hero.depthCaption": "Глубина движка",
    "landing.pro.title": "Твой персональный гроссмейстер.",
    "landing.pro.subtitle":
      "Бесплатно ты уже сильный игрок. С Pro — тот, кого боятся.",
    "landing.pro.cta": "Перейти на Pro",
    "landing.pro.popular": "Популярный",
    "landing.pro.period": "/мес",
    "landing.pro.free.name": "Free",
    "landing.pro.free.price": "$0",
    "landing.pro.free.cta": "Твой текущий план",
    "landing.pro.pro.name": "Pro",
    "landing.pro.pro.price": "$4",
    "landing.pro.free.f1": "Движок 3 уровней — считает на 6 ходов вперёд",
    "landing.pro.free.f2": "Игра против AI и онлайн по ссылке",
    "landing.pro.free.f3": "AI-тренер — разбор каждого хода",
    "landing.pro.free.f4neg": "Дебютные книги",
    "landing.pro.free.f5neg": "Кастомные темы доски",
    "landing.footer": "Сделано для nFactorial. Открытый код.",

    // Play picker
    "play.picker.title": "Выбери режим",
    "play.picker.subtitle":
      "Три способа играть. Все партии можно разобрать с AI-тренером после окончания.",
    "play.picker.hotSeat.title": "Один экран",
    "play.picker.hotSeat.body":
      "Два игрока на одном устройстве. Самый быстрый способ сыграть с тем, кто рядом.",
    "play.picker.ai.title": "Против AI",
    "play.picker.ai.body":
      "Три уровня — от дружелюбного учителя до мастера, который считает на 10 ходов вперёд.",
    "play.picker.online.title": "Онлайн по ссылке",
    "play.picker.online.body":
      "Создай комнату, отправь ссылку, играй в реальном времени. Без регистрации.",
    "play.picker.linkPlay": "Играть →",
    "play.more.title": "Что ещё",
    "play.more.puzzles.desc": "Задача дня — найди лучший ход",
    "play.more.coach.desc": "Разбор и повтор твоих партий",
    "play.more.leaderboard.desc": "Топ игроков по ELO",

    // Game view
    "game.kicker.local": "Локально · один экран",
    "game.kicker.ai": "против AI",
    "game.title.local": "Два игрока, одно устройство",
    "game.title.ai": "Победи движок",
    "game.difficulty.easy": "Лёгкий",
    "game.difficulty.medium": "Средний",
    "game.difficulty.hard": "Сложный",
    "game.button.hint": "Подсказка",
    "game.button.undo": "Отмена",
    "game.button.newGame": "Новая партия",
    "game.status.win.local": "Игрок {p} побеждает! 🎉",
    "game.status.win.ai.loss": "Получится в следующий раз",
    "game.status.win.ai.win": "Ты победил!",
    "game.status.draw": "Ничья — идеально сбалансировано.",
    "game.status.draw.local": "Ничья. Хорошая партия для обоих.",
    "game.status.turn.local": "Ход игрока {p}",
    "game.status.turn.you": "Твой ход",
    "game.status.turn.thinking": "Движок думает…",
    "game.status.turn.engine": "Ход движка",
    "game.tip.local": "Совет: нажми на колонку, чтобы бросить фишку. Передавай устройство после каждого хода.",
    "game.analyze": "Разобрать с AI-тренером →",
    "game.result.playAgain": "Сыграть снова",
    "game.result.viewBoard": "Посмотреть доску",
    "game.result.close": "Закрыть",
    "game.button.fullscreen": "На весь экран",
    "game.button.exitFullscreen": "Свернуть",

    // Online
    "online.title": "Онлайн-игра",
    "online.subtitle":
      "Создай комнату и поделись ссылкой — сопернику не нужен аккаунт.",
    "online.create.title": "Создать новую комнату",
    "online.create.body": "Ты играешь жёлтыми. Отправь ссылку сопернику.",
    "online.create.button": "Создать комнату",
    "online.join.title": "Войти по коду",
    "online.join.body": "Получил код от друга? Введи его здесь.",
    "online.join.button": "Войти в комнату",
    "online.placeholder.needSupabase": "Для онлайн-игры нужен Supabase",
    "online.placeholder.needSupabaseBody":
      "Задай переменные окружения Supabase, чтобы включить реалтайм-комнаты.",
    "online.room.kicker": "Комната {code}",
    "online.room.yellow": "Ты играешь жёлтыми",
    "online.room.red": "Ты играешь красными",
    "online.room.connecting": "Подключение…",
    "online.room.invite": "Скопировать приглашение",
    "online.room.copied": "Скопировано",
    "online.room.rematch": "Реванш",
    "online.room.waiting": "Ждём соперника — поделись ссылкой-приглашением.",
    "online.room.you.win": "Ты победил! 🎉",
    "online.room.you.lose": "Соперник побеждает в этом раунде.",
    "online.room.draw": "Ничья.",
    "online.room.turn.you": "Твой ход",
    "online.room.turn.opp": "Ход соперника…",

    // Coach
    "coach.kicker": "AI-тренер",
    "coach.empty.title": "AI-тренер",
    "coach.empty.body":
      "Сначала сыграй партию — тренер разберёт каждый ход после её завершения. Попробуй",
    "coach.empty.link": "быструю партию против AI",
    "coach.analyzing": "Анализируем {n} ходов движком…",
    "coach.move.start": "Начальная позиция",
    "coach.move.title": "Ход {n} — {color} играет колонку {col}",
    "coach.color.yellow": "Жёлтый",
    "coach.color.red": "Красный",
    "coach.evalLabel": "Оценка движка",
    "coach.suggested": "Рекомендовано: колонка {col}",
    "coach.summary": "Сводка",
    "coach.moveList": "Список ходов",
    "coach.stat.best": "Лучшие ходы",
    "coach.stat.inaccuracies": "Неточности",
    "coach.stat.mistakes": "Ошибки",
    "coach.stat.blunders": "Зевки",
    "coach.label.Best": "Лучший",
    "coach.label.Brilliant": "Блестяще",
    "coach.label.Good": "Хороший",
    "coach.label.Book": "Дебют",
    "coach.label.Inaccuracy": "Неточность",
    "coach.label.Mistake": "Ошибка",
    "coach.label.Blunder": "Зевок",
    "coach.label.MissedWin": "Упустил выигрыш",
    "coach.label.Forced": "Вынужденно",

    // Coach explanation templates
    "coach.expl.winning_move": "Победный ход — заканчивает четыре в ряд.",
    "coach.expl.missed_win":
      "Упущен выигрыш в один ход — колонка {best} завершила бы четыре в ряд.",
    "coach.expl.missed_defense":
      "{opp} теперь выигрывает ходом в колонку {block}. Нужно было блокировать колонку {block}.",
    "coach.expl.forced_block":
      "Вынужденный блок — {opp} угрожал колонкой {col}.",
    "coach.expl.fork":
      "Создаёт двойную угрозу ({n} выигрышных продолжений). {opp} может заблокировать только одно.",
    "coach.expl.opening_center":
      "Лучшее начало — центр участвует в максимальном числе линий из четырёх.",
    "coach.expl.best": "Топ-ход движка. {self} сохраняет инициативу.",
    "coach.expl.good_match": "Уверенный ход.",
    "coach.expl.good_close":
      "Уверенный ход; колонка {best} была чуть сильнее.",
    "coach.expl.inaccuracy":
      "Часть преимущества уходит. Колонка {best} была точнее.",
    "coach.expl.mistake":
      "Колонка {best} была явно сильнее — этот ход ослабляет позицию {self}.",
    "coach.expl.blunder":
      "Решающая ошибка — колонка {best} удерживала равновесие. После этого {opp} должен выигрывать при лучшей игре.",

    // Puzzles
    "puzzles.kicker.day": "Задача дня",
    "puzzles.streak": "серия",
    "puzzles.solved": "решено",
    "puzzles.feedback.idle": "Нажми на колонку, чтобы сделать ход. Одна попытка — выбирай аккуратно.",
    "puzzles.feedback.correct": "Верно.",
    "puzzles.feedback.wrong": "Не в этот раз — правильный ход был колонка {col}.",
    "puzzles.button.tryAgain": "Ещё раз",
    "puzzles.button.next": "Следующая →",
    "puzzles.tag.MateIn1": "Мат в 1",
    "puzzles.tag.BlockTheThreat": "Блокируй угрозу",
    "puzzles.tag.Opening": "Дебют",
    "puzzles.tag.Tactics": "Тактика",
    "puzzles.title": "Задачи",
    "puzzles.subtitle": "Выбери позицию и найди лучший ход.",
    "puzzles.difficulty.easy": "Лёгкие",
    "puzzles.difficulty.medium": "Средние",
    "puzzles.difficulty.hard": "Сложные",
    "puzzles.play": "Решать",
    "puzzles.back": "Все задачи",
    "puzzles.featuredCta": "Решать сегодняшнюю",
    "puzzles.doneBadge": "Решено",
    "puzzles.sectionProgress": "{done}/{total} решено",

    // Auth / login
    "login.title": "Вход",
    "login.subtitle": "Пришлём magic-ссылку на почту. Пароль не нужен.",
    "login.email": "Email",
    "login.send": "Отправить magic-ссылку",
    "login.sending": "Отправляем…",
    "login.sent": "Проверь почту {email} — кликни по ссылке, чтобы войти.",
    "login.google": "Войти через Google",
    "login.google.notEnabled":
      "Вход через Google пока не настроен. Используй magic-ссылку выше или включи Google-провайдер в Supabase.",
    "login.or": "или",
    "login.disabled.title": "Вход отключён",
    "login.disabled.body":
      "Переменные окружения Supabase не заданы. Локальные партии работают без аккаунта. Для истории, рейтинга и онлайна задай NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",

    // Onboarding
    "onboarding.title": "Выбери ник",
    "onboarding.subtitle": "Это имя видят все в лидерборде. Почта нигде не показывается.",
    "onboarding.label": "Ник",
    "onboarding.placeholder": "напр. tactician42",
    "onboarding.hint": "3–20 символов: буквы, цифры или подчёркивание.",
    "onboarding.save": "Сохранить и продолжить",
    "onboarding.saving": "Сохраняем…",
    "onboarding.error.format": "Используй 3–20 символов: буквы, цифры или подчёркивание.",
    "onboarding.error.taken": "Этот ник уже занят — выбери другой.",
    "onboarding.error.email": "Не используй почту как ник — придумай другое.",
    "onboarding.error.generic": "Не удалось сохранить ник. Попробуй ещё раз.",

    // Pro
    "pro.badge": "FourSight Pro",
    "pro.price": "$4 / месяц",
    "pro.tagline":
      "Перейди от «играю в Четыре в ряд» к «думаю как гроссмейстер».",
    "pro.feat.depth": "Анализ уровня гроссмейстера — на 13 ходов вперёд (в бесплатной — 6)",
    "pro.feat.book": "Дебютная книга — первые 8 полуходов предрасчитаны",
    "pro.feat.history": "Безлимитная история партий и повторы",
    "pro.feat.themes": "Кастомные темы доски (5 стилей)",
    "pro.feat.queue": "Приоритетный матчмейкинг в онлайне",
    "pro.feat.prose": "Аннотации тренера в стиле Claude",
    "pro.cta": "Перейти на Pro",
    "pro.opening": "Открываем оплату…",
    "pro.fineprint": "Отмени в любой момент. Оплата через Stripe; мы не видим карту.",

    // Shop
    "shop.title": "Магазин",
    "shop.subtitle": "Трать монеты за победы на цвета фишек и темы доски.",
    "shop.coins": "{n} монет",
    "shop.signInTitle": "Войди, чтобы открыть магазин",
    "shop.signInBody": "Монеты и предметы привязаны к аккаунту. Войди, чтобы зарабатывать и кастомизировать.",
    "shop.signIn": "Войти",
    "shop.section.yourBalls": "Твои фишки",
    "shop.section.oppBalls": "Фишки соперника",
    "shop.section.boards": "Темы доски",
    "shop.buy": "Купить · {price}",
    "shop.equip": "Надеть",
    "shop.equipped": "Надето",
    "shop.owned": "Куплено",
    "shop.free": "Бесплатно",
    "shop.notEnough": "Не хватает монет",
    "shop.preview": "Превью",
  } satisfies Record<string, string>,
} as const;

export type TKey = keyof (typeof dictionaries)["en"];

export function translate(locale: Locale, key: TKey, params?: Record<string, string | number>): string {
  const dict = dictionaries[locale] as Record<string, string>;
  const en = dictionaries.en as Record<string, string>;
  let s = dict[key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

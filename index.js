require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const registrationUrl = process.env.REGISTRATION_AND_LOGIN;
const premiumChanel = process.env.PREMIUM_CHANEL;
const token = process.env.TOKEN;
const fileName = process.env.FILE;
const countFileName = process.env.FILE_COUNT;
const IMAGEPATH = process.env.IMGPATH;

const CALLBACK_DATA = {
    BOT_FEATURES: "bot_features",
};

// Функция для проверки и создания файлов
function checkAndCreateFile(file) {
    if (!fs.existsSync(file)) {
        if (file === countFileName) {
            fs.writeFileSync(file, JSON.stringify({totalUsers: 0}, null, 2), 'utf8');
        } else {
            const initialData = {users: []};
            fs.writeFileSync(file, JSON.stringify(initialData, null, 2), 'utf8');
        }
    }
}

// Загрузка данных пользователей
function loadUserData() {
    checkAndCreateFile(fileName);
    try {
        const data = fs.readFileSync(fileName, 'utf8');
        return JSON.parse(data).users || [];
    } catch (err) {
        console.error("Ошибка при попытке загрузить данные пользователя:", err);
        return [];
    }
}

// Сохранение данных пользователей
function saveUserData(users) {
    const data = {users: users};
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf8');
}

// Загрузка счетчика пользователей
function loadUserCount() {
    checkAndCreateFile(countFileName);
    try {
        const data = fs.readFileSync(countFileName, 'utf8');
        return JSON.parse(data).totalUsers || 0;
    } catch (err) {
        console.error("Ошибка при попытке загрузить количество пользователей:", err);
        return 0;
    }
}

// Сохранение счетчика пользователей
function saveUserCount(count) {
    const data = {totalUsers: count};
    fs.writeFileSync(countFileName, JSON.stringify(data, null, 2), 'utf8');
}

const bot = new TelegramBot(token, {polling: true});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username || "Никнейм не установлен";
    const languageCode = msg.from.language_code;

    const now = new Date();
    const user = {
        userId,
        firstName,
        nickname: username,
        languageCode,
        date: now.toLocaleDateString("ru-RU"),
        time: now.toLocaleTimeString("ru-RU")
    };

    const users = loadUserData();
    const userRecord = {
        userId: userId,
        nickname: username,
        languageCode: languageCode,
        date: user.date,
        time: user.time
    };

    if (!users.some(line => line.userId === userId)) {
        users.push(userRecord);
        saveUserData(users);

        const count = loadUserCount() + 1;
        saveUserCount(count);
    }

    if (text === "/start") {
        await bot.sendPhoto(chatId, IMAGEPATH, {
            caption:
                "Этот бот - полная замена официального сайта 1win в России и странах СНГ \n" +
                "\n" +
                "Мы вывели казино на новый уровень, теперь можно играть в любимые слоты прямо в телеграмме 🎰\n" +
                "\n" +
                "Нажимайте на кнопку Регистрация и получите Бонус + 500% к депозиту и 30% кэшбэк на казино 💸",
            reply_markup: {
                inline_keyboard: [
                    [{text: "Регистрация 🗂️", web_app: {url: registrationUrl}}],
                    [{text: "Войти 🔐", web_app: {url: registrationUrl}}],
                    [
                        {
                            text: "Что умеет этот бот? 🤖",
                            callback_data: CALLBACK_DATA.BOT_FEATURES,
                        },
                    ],
                    [
                        {
                            text: "Подписаться на канал 1win Premium 😍",
                            url: premiumChanel,
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    }

    if (text === "/count=ebdf4515") {
        const count = loadUserCount();
        await bot.sendMessage(chatId, `Total count: ${count}`);
    }
});

// Обработка callback queries
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const callbackData = query.data;

    if (callbackData === CALLBACK_DATA.BOT_FEATURES) {
        await bot.sendPhoto(chatId, IMAGEPATH, {
            caption:
                "Что умеет этот бот ?\n" +
                "\n" +
                "Официальный бот от компании 1win \n" +
                "🤖 Бот создан для безопасного использования казино в Telegram. \n" +
                "✅ Теперь вы можете играть в любимые слоты прямо тут\n" +
                "✅ Для этого нажмите кнопку регистрация внизу экрана\n" +
                "✅ Пройдите регистрацию и наслаждайтесь игровым процессом \n" +
                "\n" +
                "Все данные данные защищены🛡",
            reply_markup: {
                inline_keyboard: [
                    [{text: "Регистрация 🗂️", web_app: {url: registrationUrl}}],
                    [{text: "Войти 🔐", web_app: {url: registrationUrl}}],
                    [
                        {
                            text: "Подписаться на канал 1win Premium 😍",
                            url: premiumChanel,
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } else if (callbackData === CALLBACK_DATA.SECRET_COMMAND) {
        const count = loadUserCount();
        await bot.sendMessage(chatId, `Общее количество уникальных пользователей, которые нажали /start: ${count}`);
    }
});

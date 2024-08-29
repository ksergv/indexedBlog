PWA blog based on indexed DB

Запустить ngrok: ngrok http https://localhost:3000
Скопировать адрес из Forwarding
Изменить адрес  в server.js (1 адрес) на адрес из ngrok
const allowedOrigins = ['https://ksergv.github.io', 'https://ff90-31-14-75-18.ngrok-free.app'];

 Изменить адреса fetch в script.js(3 адреса) на адрес из ngrok
Запустить сервер
Выполнить загрузку из json в базу данных(DB FROM JSON) и  прочитать из DB (LOAD DB) появятся  ве посты
После создания нового поста выполнить (DB TO JSON Для сохранения)
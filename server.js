const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('email.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(require('./middlewares')); // Добавьте middleware для CORS

server.get('/emails/check', (req, res) => {
  const emailToCheck = req.query.email;

  // Ваша логика проверки email-адреса здесь
  // Например, вы можете получить данные из вашей базы данных и проверить, существует ли email-адрес

  // Пример проверки, замените его своей логикой
  const emailExists = emails.some((item) => item.email === emailToCheck);

  res.status(200).json({ exists: emailExists });
});

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});

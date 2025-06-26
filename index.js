// Получаем элемент канваса и его контекст для рисования
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Элемент для отображения счета
const scoreDiv = document.getElementById("score");

// Размер клетки в пикселях
const gridSize = 20;

// Количество клеток по ширине и высоте (зависит от размера канваса)
const tileCount = canvas.width / gridSize;

// Начальная длина змейки
const initialLength = 3;

// Инициализация змейки в линию по горизонтали посередине поля
let snake = [];
for (let i = initialLength - 1; i >= 0; i--) {
  snake.push({ x: i, y: Math.floor(tileCount / 2) });
}

// Направление движения змейки: вправо по умолчанию
let dx = 1;
let dy = 0;

// Объект еды с координатами
let food = { x: 0, y: 0 };

// Текущий счет игрока
let score = 0;

// Скорость игры (интервал между обновлениями) в миллисекундах
let currentSpeed = 150; // начальная скорость
let gameIntervalId; // идентификатор интервала

// Массив препятствий — линии линий, создаваемых при старте
let obstacles = [];
const obstacleCount = 10; // Количество линий препятствий (можно изменить)

// Обновление отображения счета на странице
function updateScore() {
  scoreDiv.textContent = "Счет: " + score;
}

// Установка начальной позиции еды — случайная, избегая змейку и препятствия
function placeFood() {
  let validPosition;
  do {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    validPosition =
      !snake.some((s) => s.x === food.x && s.y === food.y) && // не на змейке
      !obstacles.some((o) => o.x === food.x && o.y === food.y); // не на препятствиях
  } while (!validPosition);
}

// Генерация линий препятствий — много линий длиной до 4 клеток, избегая пересечений с телом змейки и едой
function generateObstacles() {
  obstacles = []; // очищаем текущие препятствия

  const maxLineLength = 4; // максимальная длина линии препятствия

  const attemptsLimit = 5000; // лимит попыток для размещения линий (чтобы не зациклиться)
  let attempts = 0;

  // Пока не достигнем нужного количества линий или не исчерпаем лимит попыток
  while (
    obstacles.length < obstacleCount * maxLineLength &&
    attempts < attemptsLimit
  ) {
    attempts++;
    const orientation = Math.random() < 0.5 ? "horizontal" : "vertical"; // случайная ориентация линии

    const lineLength = Math.ceil(Math.random() * maxLineLength); // случайная длина линии до maxLineLength

    let startX, startY;

    if (orientation === "horizontal") {
      startX = Math.floor(Math.random() * (tileCount - lineLength + 1));
      startY = Math.floor(Math.random() * tileCount);
    } else {
      // вертикальная линия
      startX = Math.floor(Math.random() * tileCount);
      startY = Math.floor(Math.random() * (tileCount - lineLength + 1));
    }

    const newLine = []; // массив точек новой линии
    let collision = false; // флаг пересечения

    for (let i = 0; i < lineLength; i++) {
      const x = orientation === "horizontal" ? startX + i : startX;
      const y = orientation === "vertical" ? startY + i : startY;

      // Проверка пересечения с телом змейки, едой или уже существующими препятствиями
      if (
        snake.some((s) => s.x === x && s.y === y) ||
        (food.x === x && food.y === y) ||
        obstacles.some((o) => o.x === x && o.y === y)
      ) {
        collision = true; // есть пересечение — пропускаем эту линию
        break;
      }
      newLine.push({ x, y });
    }

    if (!collision && newLine.length === lineLength) {
      obstacles.push(...newLine); // добавляем линию в массив препятствий
    }
  }
}

// Обработка нажатий клавиш для управления змейкой — стрелки вверх/вниз/влево/вправо
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && dy !== 1) {
    // нельзя идти прямо назад
    dx = 0;
    dy = -1;
  } else if (e.key === "ArrowDown" && dy !== -1) {
    dx = 0;
    dy = 1;
  } else if (e.key === "ArrowLeft" && dx !== 1) {
    dx = -1;
    dy = 0;
  } else if (e.key === "ArrowRight" && dx !== -1) {
    dx = 1;
    dy = 0;
  }
});

// Функция рисования сегмента змейки с закругленными концами одинакового размера.
// В зависимости от положения сегмента рисуем круг или квадрат.
function drawSegment(segment, isHead, isTail, prevSegment, nextSegment) {
  const xPixel = segment.x * gridSize + gridSize / 2; // центр сегмента по X в пикселях
  const yPixel = segment.y * gridSize + gridSize / 2; // центр по Y

  const radius = gridSize / 2 - 2; // радиус круга для головы и хвоста

  ctx.fillStyle = "lime"; // цвет змейки

  ctx.beginPath();

  if (isHead || isTail) {
    ctx.arc(xPixel, yPixel, radius, 0, Math.PI * 2); // рисуем круг для головы или хвоста
    ctx.fill();
  } else {
    ctx.fillRect(
      segment.x * gridSize + 2,
      segment.y * gridSize + 2,
      gridSize - 4,
      gridSize - 4
    );
    // центральный квадрат для тела без закруглений
  }
}

// Основной цикл игры — обновление состояния и отрисовка
function gameLoop() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy }; // новая позиция головы

  // Проверка выхода за границы поля — конец игры при столкновении со стеной
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    alert("Игра окончена! Ваш счет: " + score);
    clearInterval(gameIntervalId);
    return;
  }

  // Проверка столкновения со своим телом — конец игры при столкновении с собой
  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    alert("Игра окончена! Ваш счет: " + score);
    clearInterval(gameIntervalId);
    return;
  }

  // Проверка столкновения с препятствием — конец игры при столкновении с препятствием
  if (obstacles.some((o) => o.x === head.x && o.y === head.y)) {
    alert("Игра окончена! Ваш счет: " + score);
    clearInterval(gameIntervalId);
    return;
  }

  snake.unshift(head); // добавляем новую позицию головы в начало массива

  if (head.x === food.x && head.y === food.y) {
    // если съели еду:
    score++;
    updateScore();
    placeFood();
    // Не удаляем хвост — змейка растет!
  } else {
    snake.pop();
    // иначе удаляем последний сегмент чтобы сохранить длину постоянной или уменьшить ее при движении без еды.
  }

  draw(); // перерисовываем сцену после обновлений.
}

// Запуск или перезапуск интервала игры по скорости currentSpeed.
function startGame() {
  if (gameIntervalId) clearInterval(gameIntervalId);
  gameIntervalId = setInterval(gameLoop, currentSpeed);
}

// Отрисовка всей сцены — фона, препятствий, еды и змейки.
function draw() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Рисуем препятствия как маленькие квадраты красного цвета.
  ctx.fillStyle = "red";
  for (let o of obstacles) {
    ctx.fillRect(
      o.x * gridSize + 2,
      o.y * gridSize + 2,
      gridSize - 4,
      gridSize - 4
    );
  }

  // Рисуем еду как желтый круг.
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Рисуем змейку с закругленными концами одинакового размера.
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    const prevSegment = snake[i - 1];
    const nextSegment = snake[i + 1];

    const isHead = i === 0;
    const isTail = i === snake.length - 1;

    drawSegment(segment, isHead, isTail, prevSegment, nextSegment);
  }
}

// Инициализация игры:
placeFood(); // размещение первой еды
updateScore(); // отображение начального счета
generateObstacles(); // создание линий препятствий при старте
startGame(); // запуск игрового цикла

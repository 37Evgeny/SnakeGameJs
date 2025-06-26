const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');

const gridSize = 20; // Размер клетки
const tileCount = canvas.width / gridSize; // Количество клеток по ширине и высоте

// Начальная длина змейки
const initialLength = 3;

// Инициализация змейки в линию по горизонтали
let snake = [];
for (let i = initialLength - 1; i >= 0; i--) {
    snake.push({x: i, y: Math.floor(tileCount/2)});
}

let dx = 1; // Начальное движение вправо
let dy = 0;

let food = {x: 0, y: 0};
let score = 0;

// Скорость и интервал
let currentSpeed = 150; // начальная скорость (мс)
let gameIntervalId;

// Обновление отображения счета
function updateScore() {
    scoreDiv.textContent = 'Счет: ' + score;
}

// Установка начальной еды
function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        placeFood();
    }
}

// Обработка нажатий клавиш для управления змейкой
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && dy !== 1) {
        dx=0; dy=-1;
    } else if (e.key === 'ArrowDown' && dy !== -1) {
        dx=0; dy=1;
    } else if (e.key === 'ArrowLeft' && dx !==1) {
        dx=-1; dy=0;
    } else if (e.key === 'ArrowRight' && dx !==-1) {
        dx=1; dy=0;
    }
});

// Функция для рисования сегмента змейки с закругленными концами одинакового размера
function drawSegment(segment, isHead, isTail, prevSegment, nextSegment) {
    const xPixel = segment.x * gridSize + gridSize/2; // центр клетки по X
    const yPixel = segment.y * gridSize + gridSize/2; // центр клетки по Y
    const radius = gridSize/2;

    ctx.fillStyle='lime';

    ctx.beginPath();

    if (isHead || isTail) {
        // Рисуем голову или хвост как круг одинакового размера
        ctx.arc(xPixel, yPixel, radius -2, 0, Math.PI*2);
        ctx.fill();
    } else {
        // Средний сегмент — квадрат внутри клетки с небольшими отступами
        ctx.fillRect(segment.x * gridSize +2 , segment.y * gridSize +2 , gridSize-4 , gridSize-4);
    }
}

// Основная функция игры
function gameLoop() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Проверка границ и столкновений
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        alert('Игра окончена! Ваш счет: ' + score);
        clearInterval(gameIntervalId);
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        alert('Игра окончена! Ваш счет: ' + score);
        clearInterval(gameIntervalId);
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        placeFood();
        increaseSpeed(); // увеличиваем скорость после съедания еды
    } else {
        snake.pop();
    }

    draw();
}

// Функция для рисования всей змейки и еды
function draw() {
    ctx.fillStyle='#222';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Рисуем еду
    ctx.fillStyle='red';
    ctx.fillRect(food.x*gridSize+4 , food.y*gridSize+4 , gridSize-8 , gridSize-8);

   // Рисуем змейку с закругленными концами одинакового размера
   for (let i=0; i<snake.length; i++) {
       const segment=snake[i];
       const prevSegment=snake[i-1];
       const nextSegment=snake[i+1];

       const isHead=(i===0);
       const isTail=(i===snake.length-1);

       drawSegment(segment,isHead,isTail,prevSegment,nextSegment);
   }
}

// Функция для увеличения скорости после каждого съедания
function increaseSpeed() {
   if (currentSpeed >50) { // минимальная скорость
       currentSpeed -=5;   // уменьшаем интервал на 10 мс
       startGame();         // перезапускаем цикл с новой скоростью
   }
}

// Функция для запуска или перезапуска интервала игры
function startGame() {
   if (gameIntervalId) clearInterval(gameIntervalId);
   gameIntervalId=setInterval(gameLoop,currentSpeed);
}

// Инициализация игры
placeFood();
updateScore();
startGame();
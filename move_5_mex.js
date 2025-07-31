/**
 * Главная функция для предварительного расчета всех g-чисел.
 * @param {number} maxSticks Максимальное общее количество палочек в игре.
 * @returns {Map<string, number>} Map, где ключ - каноническое состояние (н-р, "1,4,5"), а значение - его g-число.
 */
function gGen_5(maxSticks) {
    // Map для хранения g-чисел (мемоизация)
    // Ключ: '2,4,6', Значение: g-число
    const grundyMemo = new Map();
    
    // Установка базового случая: g ( { } )  = 0 (пустая игра - проигрышная позиция)
    grundyMemo.set('', 0);

    // --- Главный цикл динамического программирования ---
    // Идем "снизу-вверх " : от 1 палочки до maxSticks
    for (let totalSticks = 1; totalSticks <= maxSticks; totalSticks++) {
        console.log("Now totalSticks is"+totalSticks);
        // Шаг 1: Генерируем все состояния (разбиения), которые в сумме дают totalSticks
        const partitions = generatePartitions(totalSticks);
        
        // Шаг 2: Для каждого состояния вычисляем его g-число
        for (const piles of partitions) {

            const numPiles = piles.length;
            if (totalSticks + numPiles - 1 > maxSticks) {
                // Это состояние физически не может быть достигнуто из [maxSticks],
                // и нам никогда не понадобится его g-число для расчета
                // g-чисел достижимых состояний. Пропускаем.
                continue;
            }

            piles.sort((a, b) => a - b); 
            const key = piles.join(',');
            // Это состояние могло быть сгенерировано ранее (например, как результат хода)
            if (grundyMemo.has(key)) {
                continue;
            }

            const reachableGrundyNumbers = new Set();
            
            // --- Логика перебора ходов (та же, что и раньше, но без рекурсии) ---

            // Ход 1: Взять 1 любую палочку
            for (let i = 0; i < piles.length; i++) {
                // Оптимизация: пропускаем дубликаты куч (т.к. piles отсортирован)
                if (i > 0 && piles[i] === piles[i - 1]) continue;

                const pileSize = piles[i];
                for (let j = 0; j <= (pileSize) / 2; j++) { // Оптимизация симметрии
                    const newPiles = [...piles.slice(0, i), ...piles.slice(i + 1)];
                    if (j > 0) newPiles.push(j);
                    if (pileSize - 1 - j > 0) newPiles.push(pileSize - 1 - j);
                    
                    // КЛЮЧЕВОЙ МОМЕНТ: вместо рекурсии, берем готовое значение из Map
                    newPiles.sort((a, b) => a - b);
                    const newKey = newPiles.join(',');
                    reachableGrundyNumbers.add(grundyMemo.get(newKey));
                }
            }

// --- ИСПРАВЛЕННЫЙ БЛОК для хода "Взять 2 палочки" ---
// Этот код правильно обрабатывает все случаи для линейной игры.

for (let i = 0; i < piles.length; i++) {
    const pileSize = piles[i];
    if (pileSize < 2) continue;

    // Оптимизация, чтобы не обрабатывать одинаковые по размеру кучи повторно
    if (i > 0 && piles[i] === piles[i - 1]) continue;

    // База для нового состояния: все кучи, кроме текущей, которую мы меняем
    const basePiles = [...piles.slice(0, i), ...piles.slice(i + 1)];

    // Перебираем позиции ДВУХ изымаемых палочек (p1 и p2).
    // Позиции нумеруются от 1 до pileSize.
    for (let p1 = 1; p1 <= pileSize; p1++) {
        for (let p2 = p1 + 1; p2 <= pileSize; p2++) {
            
            // Начинаем формирование нового состояния с куч, которые мы не трогали
            const newPiles = [...basePiles];
            
            // Вычисляем размеры сегментов, которые образуются после удаления палочек
            // в позициях p1 и p2.
            
            // Сегмент до первой палочки
            const firstSegmentSize = p1 - 1;
            // Сегмент между двумя палочками
            const middleSegmentSize = p2 - p1 - 1;
            // Сегмент после второй палочки
            const lastSegmentSize = pileSize - p2;

            // Добавляем в результат только непустые сегменты
            if (firstSegmentSize > 0) {
                newPiles.push(firstSegmentSize);
            }
            if (middleSegmentSize > 0) {
                newPiles.push(middleSegmentSize);
            }
            if (lastSegmentSize > 0) {newPiles.push(lastSegmentSize);}
            newPiles.sort((a, b) => a - b);
            const newKey = newPiles.join(',');
            reachableGrundyNumbers.add(grundyMemo.get(newKey));
        }
    }
}

            // Ход 2: Взять 3 палочки подряд
            for (let i = 0; i < piles.length; i++) {
                if (i > 0 && piles[i] === piles[i - 1]) continue;
                
                const pileSize = piles[i];
                if (pileSize >= 3) {
                    for (let j = 0; j <= (pileSize+1) / 2; j++) { // Оптимизация симметрии
                        const newPiles = [...piles.slice(0, i), ...piles.slice(i + 1)];
                        if (j > 0) newPiles.push(j);
                        if (pileSize - 3 - j > 0) newPiles.push(pileSize - 3 - j);
                        
                        newPiles.sort((a, b) => a - b);
                        const newKey = newPiles.join(',');
                        reachableGrundyNumbers.add(grundyMemo.get(newKey));
                    }
                }
            }

            // Ход 3: Взять по 1 палочке из ДВУХ РАЗНЫХ кучек
            if (piles.length >= 2) {
                for (let i = 0; i < piles.length; i++) {
                    //if (i > 0 && piles[i] === piles[i - 1]) continue;
                    
                    for (let j = i + 1; j < piles.length; j++) {
                        //if (j > i + 1 && piles[j] === piles[j - 1]) continue;

                        const pile1Size = piles[i];
                        const pile2Size = piles[j];

                        for (let s1 = 0; s1 <= (pile1Size+1) / 2; s1++) {
                            for (let s2 = 0; s2 <= (pile2Size+1) / 2; s2++) {
                                const newPiles = [...piles.slice(0, i), ...piles.slice(i + 1, j), ...piles.slice(j + 1)];
                                if (s1 > 0) newPiles.push(s1);
                                if (pile1Size - 1 - s1 > 0) newPiles.push(pile1Size - 1 - s1);
                                if (s2 > 0) newPiles.push(s2);
                                if (pile2Size - 1 - s2 > 0) newPiles.push(pile2Size - 1 - s2);

                                newPiles.sort((a, b) => a - b);
                                const newKey = newPiles.join(',');
                                reachableGrundyNumbers.add(grundyMemo.get(newKey));
                            }
                        }
                    }
                }
            }

            // Вычисляем mex
            let mex = 0;
            while (reachableGrundyNumbers.has(mex)) {
                mex++;
            }
            
            // Сохраняем результат
            grundyMemo.set(key, mex);
        }
    }
    
    return grundyMemo;
}

/**
 * Вспомогательная функция для генерации разбиений числа n.
 * Разбиение - это способ представления числа в виде суммы положительных целых чисел.
 * Пример: для n=4, разбиения: [[4], [1,3], [2,2], [1,1,2], [1,1,1,1]]
 * @param {number} n Число для разбиения.
 * @returns {Array<Array<number>>} Массив всех разбиений.
 */
function generatePartitions(n) {
    const result = [];
    const partition = [];
    
    function find(target, max) {
        if (target === 0) {
            result.push([...partition]);
            return;
        }

        for (let i = Math.min(target, max); i >= 1; i--) {
            partition.push(i);
            find(target - i, i);
            partition.pop();
        }
    }
    
    find(n, n);
    return result;
}


// --- КАК ИСПОЛЬЗОВАТЬ ---

console.log("Начинаем предварительный расчет g-чисел... Это может занять некоторое время.");

// 1. Выполняем расчет ОДИН РАЗ в начале программы.
// ВНИМАНИЕ: для 50 палочек это может занять от 10-20 секунд до нескольких минут, 
// в зависимости от мощности вашего компьютера.
const MAX_GAME_STICKS = 30; // Для примера поставим 20. Для полной игры измените на 50.
//const grundyValues = calculateAllGrundyNumbers(MAX_GAME_STICKS);

console.log(`Расчет завершен. Найдено g-чисел для ${grundyValues.size} состояний.`);


// 2. Теперь используем готовые значения в игровой логике.
const currentPosition = [2, 4, 6]; // Ваша позиция {2, 4, 6}

// Приводим к каноническому виду
currentPosition.sort((a,b) => a - b);
const currentKey = currentPosition.join(',');

const nimSum = grundyValues.get(currentKey);

if (nimSum === undefined) {
    console.error("Ошибка: g-число для текущего состояния не найдено. Увеличьте MAX_GAME_STICKS.");
} else if (nimSum === 0) {
    console.log(`G-число для позиции [${currentKey}] равно 0. Это проигрышная позиция. Надейтесь на ошибку противника.`);
} else {
    console.log(`G-число для позиции [${currentKey}] равно ${nimSum}. Это выигрышная позиция!`);
    // Здесь должна быть логика поиска выигрышного хода,
    // которая перебирает все ходы, генерирует newKey и ищет тот, 
    // для которого grundyValues.get(newKey) === 0.
}

function move_5(currentPiles) {
  // Важно: работаем с отсортированной копией, чтобы не изменять исходный массив
  // и соответствовать формату ключей в Map.
  const piles = [...currentPiles].sort((a, b) => a - b);
              const numPiles = piles.length;

            // Ход 1: Взять 1 любую палочку
            for (let i = 0; i < piles.length; i++) {
                // Оптимизация: пропускаем дубликаты куч (т.к. piles отсортирован)
                if (i > 0 && piles[i] === piles[i - 1]) continue;

                const pileSize = piles[i];
                for (let j = 0; j <= (pileSize) / 2; j++) { // Оптимизация симметрии
                    const newPiles = [...piles.slice(0, i), ...piles.slice(i + 1)];
                    if (j > 0) newPiles.push(j);
                    if (pileSize - 1 - j > 0) newPiles.push(pileSize - 1 - j);
                    
                    // КЛЮЧЕВОЙ МОМЕНТ: вместо рекурсии, берем готовое значение из Map
                    newPiles.sort((a, b) => a - b);
                    const newKey = newPiles.join(',');
                    if(grundyValues.get(newKey) === 0) return newPiles;
                }
            }

// --- БЛОК для хода "Взять 2 палочки из одной кучи с разных мест" ---
for (let i = 0; i < piles.length; i++) {
    const pileSize = piles[i];
    if (pileSize < 2) continue;

    // Оптимизация, чтобы не обрабатывать одинаковые по размеру кучи повторно
    if (i > 0 && piles[i] === piles[i - 1]) continue;

    // База для нового состояния: все кучи, кроме текущей, которую мы меняем
    const basePiles = [...piles.slice(0, i), ...piles.slice(i + 1)];

    // Перебираем позиции ДВУХ изымаемых палочек (p1 и p2).
    // Позиции нумеруются от 1 до pileSize.
    for (let p1 = 1; p1 <= pileSize; p1++) {
        for (let p2 = p1 + 1; p2 <= pileSize; p2++) {
            
            // Начинаем формирование нового состояния с куч, которые мы не трогали
            const newPiles = [...basePiles];
            
            // Вычисляем размеры сегментов, которые образуются после удаления палочек
            // в позициях p1 и p2.
            
            // Сегмент до первой палочки
            const firstSegmentSize = p1 - 1;
            // Сегмент между двумя палочками
            const middleSegmentSize = p2 - p1 - 1;
            // Сегмент после второй палочки
            const lastSegmentSize = pileSize - p2;

            // Добавляем в результат только непустые сегменты
            if (firstSegmentSize > 0) {
                newPiles.push(firstSegmentSize);
            }
            if (middleSegmentSize > 0) {
                newPiles.push(middleSegmentSize);
            }
            if (lastSegmentSize > 0) {newPiles.push(lastSegmentSize);}
            newPiles.sort((a, b) => a - b);
            const newKey = newPiles.join(',');
            if(grundyValues.get(newKey) === 0) return newPiles;
        }
    }
}

            // Ход 2: Взять 3 палочки подряд
            for (let i = 0; i < piles.length; i++) {
                if (i > 0 && piles[i] === piles[i - 1]) continue;
                
                const pileSize = piles[i];
                if (pileSize >= 3) {
                    for (let j = 0; j <= (pileSize+1) / 2; j++) { // Оптимизация симметрии
                        const newPiles = [...piles.slice(0, i), ...piles.slice(i + 1)];
                        if (j > 0) newPiles.push(j);
                        if (pileSize - 3 - j > 0) newPiles.push(pileSize - 3 - j);
                        
                        newPiles.sort((a, b) => a - b);
                        const newKey = newPiles.join(',');
                        if(grundyValues.get(newKey) === 0) return newPiles;
                    }
                }
            }

            // Ход 3: Взять по 1 палочке из ДВУХ РАЗНЫХ кучек
            if (piles.length >= 2) {
                for (let i = 0; i < piles.length; i++) {
                    //if (i > 0 && piles[i] === piles[i - 1]) continue;
                    
                    for (let j = i + 1; j < piles.length; j++) {
                        //if (j > i + 1 && piles[j] === piles[j - 1]) continue;

                        const pile1Size = piles[i];
                        const pile2Size = piles[j];

                        for (let s1 = 0; s1 <= (pile1Size+1) / 2; s1++) {
                            for (let s2 = 0; s2 <= (pile2Size+1) / 2; s2++) {
                                const newPiles = [...piles.slice(0, i), ...piles.slice(i + 1, j), ...piles.slice(j + 1)];
                                if (s1 > 0) newPiles.push(s1);
                                if (pile1Size - 1 - s1 > 0) newPiles.push(pile1Size - 1 - s1);
                                if (s2 > 0) newPiles.push(s2);
                                if (pile2Size - 1 - s2 > 0) newPiles.push(pile2Size - 1 - s2);

                                newPiles.sort((a, b) => a - b);
                                const newKey = newPiles.join(',');
                                if(grundyValues.get(newKey) === 0) return newPiles;
                            }
                        }
                    }
                }
            }
  // Если мы дошли до этого места, значит, ни один из ходов не привел к g = 0
  return null;
}
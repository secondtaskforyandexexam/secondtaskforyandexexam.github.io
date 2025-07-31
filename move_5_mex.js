/**
 * Главная функция для предварительного расчета всех g-чисел.
 * @param {number} maxSticks Максимальное общее количество палочек в игре.
 * @returns {Map<string, number>} Map, где ключ - каноническое состояние (н-р, "1,4,5"), а значение - его g-число.
 */
grundyValues = null;
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



function move_5(currentPiles) {
  // Важно: работаем с отсортированной копией, чтобы не изменять исходный массив
  // и соответствовать формату ключей в Map.
  if(grundyValues === null) 
  {
    let sum = 0;
    for (const element of currentPiles)
    {
        sum+=element;
        sum++; //учитываем пропуск
    }
    if(sum>50)  sum = 50;
    if(sum>31)  alert("Не были рассчитаны или загружены данные для игры. Подтвердите начало расчета или обновите страницу.");
    grundyValues = gGen_5(sum);
  }
  const piles = [...currentPiles].sort((a, b) => a - b);
              const numPiles = piles.length;
            if(grundyValues.get(piles.join(',')) === 0)
            {
                if(piles[piles.length - 1]===1) 
                    {
                        
                        return piles.slice(0, -1);
                    }
                else 
                {
                    piles[piles.length - 1]-=1;
                    return piles
                }
            }
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


function mode_5_check(positionBefore, positionAfter) {

    // Шаг 1: Рассчитываем, сколько всего палочек было взято.
    const sticksBefore = positionBefore.reduce((sum, val) => sum + val, 0);
    const sticksAfter = positionAfter.reduce((sum, val) => sum + val, 0);
    const takenCount = sticksBefore - sticksAfter;

    // Шаг 2: Проверяем количество взятых палочек.
    // Если взято не 1, 2 или 3, ход точно неверный.
    if (takenCount !== 1 && takenCount !== 2 && takenCount !== 3) {
        console.error(`Неверный ход: взято ${takenCount} палочек. В этом режиме разрешено 1, 2 или 3.`);
        return false;
    }

    // Шаг 3: Проверяем простые случаи.
    // Если взяли 1 или 2 палочки, правила ("любые") не накладывают
    // никаких ограничений на их расположение. Поэтому ход всегда верный.
    if (takenCount === 1 || takenCount === 2) {
        return true;
    }

    // Шаг 4: Самый сложный случай. Если взято 3 палочки,
    // мы должны убедиться, что они были взяты ПОДРЯД из ОДНОГО фрагмента.
    if (takenCount === 3) {
        //ситуации: исчез, уменьшился, разбили на два
        console.log("test:")
        console.log(positionBefore);
        console.log(positionAfter);
        let flag = 0;
        let offset = 0;
        for(let i = 0; i<positionBefore.length; i++)
        {
            if(positionBefore[i] === positionAfter[i+offset])    continue;
            else{
                if(flag)    return false;
                if((positionBefore[i] === 3)&&(i===positionBefore.length-1?true:(positionAfter[i] === positionBefore[i+1]))) 
                {
                    offset = -1;
                    flag = 1;
                    continue;
                }
                if((positionBefore[i] === positionAfter[i]+3)&&(i===positionBefore.length-1?true:(positionAfter[i+1] === positionBefore[i+1]))) 
                {
                    flag = 1;
                    continue;
                }
                if(
                (positionBefore[i] === positionAfter[i]+positionAfter[i+1]+3)&&
                (positionBefore[i+1] === positionAfter[i+2]))
                {
                    offset = 1;
                    flag = 1;
                    continue;
                }
                return false;
                

            }
        }

        return true;
    }

    // Этот код не должен выполниться, но это хорошая практика на случай ошибок.
    return false;
}
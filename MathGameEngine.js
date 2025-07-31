//let globalMin, globalMax, startAmount;
//[globalMin, globalMax, startAmount] = [1, 3, 50]
function gGen(min, max, endValue) 
/*считает g(i) c нуля по i = endVValue по алгоритму:
хотим получить g(n)

из g(n) мы можем попасть во все позиции от [g(n)-min] до [g(n - max)], если 
можно разбить фрагмент на два (left и right), то g(итоговое) = g(left) ^ g(right), 

записываем в рядок числа по правилу : {g(n-min), g(n-min-1), ... , g(n-max+1), g(n-max)}
(предполагается что все значения g() до n мы знаем)

Ищем самое маленькое НЕВКЛЮЧЕННОЕ в ряд число, это и будет g(n)
*/
 {
    let ans = [];
    for(let i = 0; i <= endValue; i++) //для всех значений n от 0 до необходимого
    {
        let tmpGLinks = new Set;
        for(let ii = min; ii<=max; ii++) // значения удаляемого фрагмента
        {
            if(i-ii>=0)   
                {
                    tmpGLinks.add(ans[i-ii]); //забираем с края
                    if(i-ii>1) // забираем из центра
                    {
                        for(let iii = 1; iii<=(i - ii)/2; iii++) // левый отступ может быть с 1 по i - ii -1 включительно
                        {
                            tmpGLinks.add(ans[iii] ^ ans[i - ii - iii]);
                        }

                    }
                }
            else break;
        }
        let MEX = 0;
        while(tmpGLinks.has(MEX)) MEX++;
        ans[i]=MEX;
    }
    return ans;
}

function SticksRangeIndex(gTarget, stixAmount, min, max, deepSearch = 0)
{
    /*
    Функция проверяет, можно ли из некоторого количества палочек, сделав ход, получить значение gTarget 
    или gFirst и gSecond так, чтобы 
    gTarget = gFirst XOR gSecond
    возвращает ответ в формате [сколько забирать, сколько оставить слева]
    */
    for(let i = stixAmount-min; (i>=0)&&(i>=stixAmount-max); i--) if(gNumbers[i] === gTarget) { return [(stixAmount - i), 0]; }
    // если от этого фрагмента можно збрать количесиво палочек в промежутке [min, max] и получить целевое значение,
    //  то возвращаем это количество и ноль как количество паолочек в фрагменте слева от забранных
    if (deepSearch)
    {
        for( let i = min; i <=max; i++) // сколько забираем
        {
            // ii это сколько палочек будет составлять левый оставшийся фрагмент, после ii = (stixAmount-i)/2 будут только повторы
            for(let ii = 1; ii<=(stixAmount-i)/2; /**/ ii++ )  
            {
                //ищем такое разбиение на куски длиной a и b, чтобы ( g(a) XOR g(b) ) равнялось gTarget
                if((gNumbers[ii] ^ gNumbers[stixAmount-i-ii]) === gTarget)  return [i, ii]; 
                
            }
        }
    }
    //if(deepSearch)  throw "Game engine havn`t found right move. It is not exist or game engine is not absolutely correct";
    return [-1, -1];

}

function positionNimSum (arg)
{
    //считает ним - сумму для массива arg
    let ans = 0;
    arg.forEach(element => {
    console.log([element, gNumbers[element]]);
    ans = ans ^ gNumbers[element];
        
    });
    return ans;
}
function move_1_2(position, min, max)
/*
Функция делает простой ход для режимов 1-2. Если лучший ход сделать невозможно, делает случайный.
Возвращает позицию после хода или [-1], если ход невозможен
*/
{
    let sum = 0;
    for(const element of position)    sum+=element;
    if(sum<min)     return position;
    if(sum<=max)     return [0];
    const rest = sum%(min+max);
    //console.log(rest);
    let move =  0;
    // если остаток от деления меньше минимального числа, позиция проигрышная, т.к. на любой ход найдется ответ,
    // возвращающий позицию в эту же ситуацию, а окончательно нельзя будет взять палочки, т.к. их будет меньше минимума
    if(rest<min)    move = min+Math.round(Math.random()*100)%(max-min);
    else if(rest>max)   move = max;
    else move = rest;
    for(let i = position.length-1; i>=0; i--)
    {
        if(position[i]<=move)    move = move - position[i];
        else 
        {
            const ans = position.slice(0,i+1);
            ans[ans.length-1] = ans[ans.length-1] - move;
            return ans;
        }
    }

}
function move_3_4(position, min, max)
{
    if(gNumbers.length === 0) gNumbers = gGen(min, max, 50);
    let bestMove = [0, 0];
    let nimSum = positionNimSum(position);
    console.log("Nim Sum is" + String(nimSum));
    if(nimSum === 0)   
    {
        for(let i = 0; i<position.length; i++)
            if(position[i]>=min) 
                {
                    let ansPos = [...position];
                    ansPos[i] -=min;
                    return ansPos;
                } 
    }
    // сначала ищем быстрым поиском без разбиений
    for(let i = 0; i<position.length; i++) {
        let gTarget = nimSum ^ gNumbers[position[i]];
        bestMove = SticksRangeIndex(gTarget, position[i], min, max);
        //console.log(bestMove);
        if(bestMove[1] !== -1)  
            {
                let ansPos = [...position];
                if(position[i]-bestMove[0]>0)
                    ansPos.splice(i, 1, position[i]-bestMove[0]);
                else 
                    ansPos.splice(i, 1);
                return ansPos;
            }
    };
    //раз до сих пор возврата из функции не было значит ничего не нашли, используем разбиения
    for(let i = 0; i<position.length; i++) {
        let gTarget = nimSum ^ gNumbers[position[i]];
        bestMove = SticksRangeIndex(gTarget, position[i], min, max, 1);
        if(bestMove[1] !== -1)  
        {
            let ansPos = [...position];
            ansPos.splice(i, 1, bestMove[1], position[i] - bestMove[0] - bestMove[1])
            return ansPos;
        }
    };

    for(let i = 0; i<position.length; i++)
            if(position[i]>=min) 
                {
                    let ansPos = [...position] ;
                    ansPos[i] -=min;
                    return ansPos;
                }
}

function mode_1_2_check (positionBefore, positionAfter, min, max)
{
// в режимах 1 и 2 единственное условие корректности хода - количество 
// перемещенных палочек находится в границах от min до max
    let startSum = 0;
    for(const element of positionBefore)  startSum+=element;
    let endSum = 0;
    for(const element of positionAfter)   endSum+=element;
    const movedSicks = startSum-endSum;
    if((movedSicks>max) || (movedSicks < min))  return false;
    return true;


}
function mode_3_4_check (positionBefore, positionAfter, min, max)
{
    let flag = false;
    let offset = 0;
    const cycleCount = positionBefore.length > positionAfter.length ? positionBefore.length : positionAfter.length;
    for(let i = 0; i < cycleCount; i++)
    {
         // если ничего не поменялось с учетом оффсета, идем дальше
        if (positionBefore[i]===positionAfter[i+offset])    continue; 
        else
        {
            // если текущие фрагменты не совпадают, то возможны 3 варианта:
            // фрагмент разбили на 2 
            // фрагмент уменьшился 
            // фрагмент исчез

            //если flag уже изменяли, значит это не один ход
            if(flag)    return false;
            flag = true;

            // следующая позиция "до" хода равна текущей "после" - фрагмент исчез
            if(positionBefore[i+1]===positionAfter[i])   
            {
                // если убрали кусок больше макс или меньше мин то это ошибка
                if(positionBefore[i]>max || positionBefore[i]<min)  return false; 
                // иначе смещение -1 для positionAfter  
                offset = -1;
            }
            // следующая до равна следующей после - фрагмент уменьшился
            else if (positionBefore[i+1]===positionAfter[i+1])
            {
                const movedSicks = positionBefore[i]-positionAfter[i];
                if(movedSicks>max || movedSicks<min)    return false;
                // и все, offset менять не надо
            }
            else if(positionBefore[i+1]===positionAfter[i+2])
            {
                const movedSicks = positionBefore[i] - positionAfter[i] - positionAfter[i+1];
                if(movedSicks>max || movedSicks<min)    return false;
                // добавился новый фрагмент
                offset = 1;
            }
            // значит что то кто то намудрил
            else return false; 
        }
    }
    return true;
}
function move_5_check (positionBefore, positionAfter)
{
    
    let flag = false;
    let offset = 0;
    const cycleCount = positionBefore.length > positionAfter.length ? positionBefore.length : positionAfter.length;
    for(let i = 0; i < cycleCount; i++)
    {
         // если ничего не поменялось с учетом оффсета, идем дальше
        if (positionBefore[i]===positionAfter[i+offset])    continue; 
        else
        {
            // если текущие фрагменты не совпадают, то возможны 3 варианта:
            // фрагмент разбили на 2 
            // фрагмент уменьшился 
            // фрагмент исчез

            //если flag уже изменяли, значит это не один ход
            if(flag)    return false;
            flag = true;

            // следующая позиция "до" хода равна текущей "после" - фрагмент исчез
            if(positionBefore[i+1]===positionAfter[i])   
            {
                // если убрали кусок больше макс или меньше мин то это ошибка
                if(positionBefore[i]>max || positionBefore[i]<min)  return false; 
                // иначе смещение -1 для positionAfter  
                offset = -1;
            }
            // следующая до равна следующей после - фрагмент уменьшился
            else if (positionBefore[i+1]===positionAfter[i+1])
            {
                const movedSicks = positionBefore[i]-positionAfter[i];
                if(movedSicks>max || movedSicks<min)    return false;
                // и все, offset менять не надо
            }
            else if(positionBefore[i+1]===positionAfter[i+2])
            {
                const movedSicks = positionBefore[i] - positionAfter[i] - positionAfter[i+1];
                if(movedSicks>max || movedSicks<min)    return false;
                // добавился новый фрагмент
                offset = 1;
            }
            // значит что то кто то намудрил
            else return false; 
        }
    }
    return true;
}

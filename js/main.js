
/*Календарь*/
const startDate = new Date('2022-01-01'), // дата 'С'
    endDate = new Date('2023-01-01'); //дата 'ДО'
let arrDate = []; // пустой массив для промежутка дат

//функция для добавления 0 числам меньше и равным 9
function addZero(num) { 
    return num < 10 ? ('0' + num) : num;
}
//цикл для добавления в массив 'arrDate' промежутка дат:   getFullYear() - получить год; getMonth() - месяц; getDate() - день месяца. setDate() - устанавление дня месяца;
while (startDate.getTime() < endDate.getTime()) {
    arrDate.push(startDate.getFullYear() + '-' + addZero(startDate.getMonth() + 1) + '-' + addZero(startDate.getDate()));
    startDate.setDate(startDate.getDate() + 1);
}

const dayItem = document.querySelectorAll('.day-item'),
    weekNumber = document.querySelector('.planner-users'),
    nowDate = new Date(), // текущей датой
    start = new Date(nowDate.getFullYear(), 0, 1),  // 1 день года текущего месяца
    difference = nowDate - start,  // разница во времени между текущей датой и первым днем текущего года (миллисекунды)
    oneDay = 1000 * 60 * 60 * 24; // один день в миллисекундах
let day = Math.floor(difference / oneDay); // кол-ва дней (округление вниз)

//Добавление дат в блоки
function getWeek(date) {
    for (let i = 0; i < 7; i++) {
        let currentDate = date[day + i]; // получаем 7 дней
        let dayDate = currentDate.slice(8, 10);  // получаем день
        let monthDate = currentDate.slice(5, 7); // получаем месяц
        dayItem[i].textContent = dayDate + '.' + monthDate; // добавляем дату в блок
    }
};
getWeek(arrDate);

/*Получаем данные с ссылок */
let users = [], // пустой массив для данных о пользователях
    tasks = []; // пустой массив для данных о заданиях
const backlogList = document.querySelector('.backlog-list'),
    usersList = document.querySelector('.planner-users');

fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users')  // отправляем запрос по url
    .then((res) => {  // возвращяем Promise (обещание)
        return res.json(); // получаем ответ в формате JSON
    })
    .then((data) => {
        data.forEach((element) => {  // проходимся циклом по JSON 
            users.push(element) // добавляем в массив данные
        });
        users.forEach((item) => {  // проходимся циклом по полученному массиву данных
            const userItem = document.createElement('ul'), // создаем новый элемент
                userName = document.createElement('li'); // создаем новый элемент
            userItem.className = 'user-item'; // добаляем класс
            usersList.append(userItem);  // вставляем элемент

            userName.className = 'user-name'; // добаляем класс
            userName.textContent = item.firstName + ' ' + item.surname; // добавляем ФИО
            userItem.append(userName);  // вставляем элемент
            
            for(let i = 0; i < 7; i++) {
                const userDate = document.createElement('li'); // создаем новый элемент
                userDate.className = 'user-task'; // добаляем класс
                userDate.setAttribute('data-date', arrDate[day + i]); // добавляем data-атрибут с датой
                userItem.append(userDate); // вставляем элемент
            }
        });
        
        const prev = document.querySelector('.prev-week'),
            next = document.querySelector('.next-week');
        prev.addEventListener('click', () => {  // при клике на кнопку убавляем даты на неделю
            day = day - 7;  // убавляем даты
            getWeek(arrDate); // обновляем даты
            changeDate(); // функция смены даты в data-атрибуте при пролистывании недель
        });
        next.addEventListener('click', () => {  // при клике на кнопку прибавляем даты на неделю
            day = day + 7; // прибавляем даты
            getWeek(arrDate); // обновляем даты
            changeDate(); // функция смены даты в data-атрибуте при пролистывании недель
        });
    })
    .catch((err) => {  // если ошибка
        alert('Ошибка. Запрос не выполнен');
    });

fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks') //отправляем запрос по url
    .then((res) => {  // возвращяем Promise (обещание)
        return res.json(); // получаем ответ в формате JSON
    })
    .then((data) => {
        data.forEach((element) => {  // проходимся циклом по JSON 
            tasks.push(element)  // добавляем в массив данные
        });
        tasks.forEach((item) => {
            let li = document.createElement('li'); // создаем новый элемент
            li.className = 'backlog-item';  // добавляем класс
            li.setAttribute('data-end', item.endDate);  // добавляем data-атрибут с датой выполенния
            li.setAttribute('draggable', 'true');  // data-атрибут для перетаскивания блоков
            li.setAttribute('ondragstart', 'event.dataTransfer.setData("text/plain",null)');  // data-атрибут для перетаскивания блоков
            backlogList.append(li);  // вставляем элемент

            let titleTask = document.createElement('h3');  // создаем блок с заголовком
            titleTask.textContent = item.subject; // добаляем название задачи
            titleTask.className = 'backlog-item__titleTask'; // добалвяем класс
            li.append(titleTask); // вставляем элемент

            let hintTask = document.createElement('div');  // создаем блок с подсказкой
            hintTask.textContent = (item.description ? item.description : 'Подсказка'); // добавляем подсказку задачи, если отсутсвтует, то добавляем просто слово
            hintTask.className = 'backlog-item__hintTask'; // добавляем класс
            li.append(hintTask); // вставляем элемент
        });
        dragEvent(); // функция для перетаскивания блоков
    })
    .catch((err) => { // если ошибка
        alert('Ошибка. Запрос не выполнен');
    });

/*Смена даты в data-атрибуте при пролистывании недель */
function changeDate() {

    const userItem = document.querySelectorAll('.user-item'); // получаем строки пользоватей
    userItem.forEach((element) => { // проходимся по строкам пользователей циклом
        let userCalendar = element.querySelectorAll('.user-task'); // получаем в каждой строке блоки календаря

        userCalendar.forEach((el, index) => { // проходимся по блокам календаря циклом
            el.setAttribute('data-date', arrDate[day + index]); // добавляем data-атрибут каждому дню с датами текущей недели

            let date = el.getAttribute('data-date'), // записываем в переменную даты календаря
               allChildItem = el.querySelectorAll('.backlog-item'); //получаем все дочерние элементы одной ячейки календаря
            if (allChildItem) { // проверям на наличие дочерних элементов
                allChildItem.forEach((item) => { // проходимся циклом по ячейкам каждого пользователя
                    if (date == item.getAttribute('data-task-date')) { // делаем проверку на даты, если не сходятся, скрываем их
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                })
            }
        });
    });
};


/*Перетаскивание блока. ВНИМАНИЕ! Данная функция не работает на мобильной версии*/
function dragEvent() {
    let dragged;

    //событие запускается при перетаскивании элемента или выделения текста
    document.addEventListener('drag', function(event) {

    }, false);

    //событие запускается, когда пользователь начинает перетаскивать элемент или выделенный текст
    document.addEventListener('dragstart', function(event) {
    dragged = event.target;
    event.target.style.opacity = .5;
    }, false);

    //событие запускается, когда операция перетаскивания завершается
    document.addEventListener('dragend', function(event) {
    event.target.style.opacity = '';
    }, false);

    //событие запускается постоянно, когда элемент или выделение текста перетаскиваются, а указатель мыши находится над действительной целью перетаскивания
    document.addEventListener('dragover', function(event) {
    event.preventDefault();
    }, false);

    //событие запускается, когда перетаскиваемый элемент или выделенный текст попадает в допустимую цель перетаскивания
    document.addEventListener('dragenter', function(event) {
    if (event.target.className == 'user-task') { // если перетаскиваемую цель навели на элемент имеющий класс user-task, тогда добавляем стили CSS
        event.target.style.background = '#ff9999';
    }
    if (event.target.className == 'backlog-list') {
        event.target.style.background = '#ff9999';
    }
    }, false);

    //событие запускается, когда перетаскиваемый элемент или выделенный текст покидают допустимую цель перетаскивания
    document.addEventListener('dragleave', function(event) {
    if (event.target.className == 'user-task') { // еесли перетаскиваемую цель навели на элемент имеющий класс user-task, тогда убираем стили CSS
        event.target.style.background = '';
    }
    if (event.target.className == 'backlog-list') {
        event.target.style.background = '';
    }

    }, false);

    //событие запускается, когда выделенный элемент или текст перетаскивается на допустимую цель перетаскивания
    document.addEventListener('drop', function(event) {
        event.preventDefault(); //отмена действия браузера
        
        if (event.target.className == 'user-task') {  // если перетаскиваемую цель навели на элемент имеющий класс user-task, тогда добавляем дату родителя для закреплением за этим блоком
            let date = event.target.attributes['data-date'].nodeValue; // получаем дату из родительского блока
            event.target.style.background = '';
            dragged.parentNode.removeChild(dragged); // удаляем блок из перетаскиваемого места
            dragged.setAttribute('draggable', 'true');  // добвляем data-атрибут для перетаскивания блоков
            dragged.setAttribute('ondragstart', 'event.dataTransfer.setData("text/plain",null)');  // добвляем data-атрибут для перетаскивания блоков
            dragged.setAttribute('data-task-date', date); // добавляем дату родительского блока
            event.target.appendChild(dragged); // вставляем элемент
        }
        if (event.target.className == 'backlog-list') {  // если перетаскиваемую цель навели на элемент имеющий класс backlog-list, тогда добавляем элемент
            event.target.style.background = '';
            dragged.parentNode.removeChild(dragged); // удаляем блок из перетаскиваемого места
            event.target.appendChild(dragged); // вставляем элемент
        }
        if (event.target.className == 'user-name') { // если перетаскиваемую цель навели на элемент имеющий класс user-name, тогда находим нужный блок по дате и добавляем его туда
            let parent = event.target.closest('.user-item'), // находим ближайший родительский элемент
            dateTask = dragged.getAttribute('data-end'), //получаем его data-атрибут
            userTask = parent.querySelector(`.user-task[data-date='${dateTask}']`); //ищем блок с этим data-атрибутом
            dragged.setAttribute('data-task-date', dateTask); // добавляем дату родительского блока
            event.target.style.background = '';
            if (userTask) {
                dragged.parentNode.removeChild(dragged); // удаляем блок из перетаскиваемого места
                userTask.appendChild(dragged); // вставляем элемент
            } 
        }

    }, false);
}
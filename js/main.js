// Кнопка "Меню" в шапке. На телефоне и планшете пункты меню скрыты,
// кнопка показывает и прячет их. С 1024px кнопка скрыта через CSS.
const menuButton = document.querySelector('.site-header__toggle');
const siteNav = document.getElementById('site-nav');

if (menuButton && siteNav) {
    menuButton.addEventListener('click', () => {
        // toggle добавляет класс, если его нет, и убирает, если есть.
        // Возвращает true, если меню открылось.
        const isOpen = siteNav.classList.toggle('site-nav--open');

        // aria-expanded сообщает программе чтения с экрана, открыто ли меню.
        menuButton.setAttribute('aria-expanded', isOpen);
    });

    // Клавиша Escape закрывает меню и возвращает фокус на кнопку.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && siteNav.classList.contains('site-nav--open')) {
            siteNav.classList.remove('site-nav--open');
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.focus();
        }
    });

    // После нажатия на пункт меню (например, якорь на этой же странице)
    // меню закрывается, чтобы не закрывать собой раздел.
    siteNav.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            siteNav.classList.remove('site-nav--open');
            menuButton.setAttribute('aria-expanded', 'false');
        }
    });
}

// Кнопка "Показать фильтры" в каталоге. На узком экране фильтры свёрнуты,
// с 1200px они всегда открыты, а кнопка скрыта через CSS.
const filtersButton = document.querySelector('.catalog-filters__toggle');
const catalogFilters = document.querySelector('.catalog-filters');

if (filtersButton && catalogFilters) {
    filtersButton.addEventListener('click', () => {
        const isOpen = catalogFilters.classList.toggle('catalog-filters--open');

        filtersButton.setAttribute('aria-expanded', isOpen);
        filtersButton.textContent = isOpen ? 'Скрыть фильтры' : 'Показать фильтры';
    });
}

// Модальное окно быстрого заказа есть только на главной странице,
// поэтому сначала проверяем, что оно найдено.
const orderDialog = document.getElementById('order-dialog');

if (orderDialog) {
    // Получаем все кнопки заказа в карточках товаров.
    const orderButtons = document.querySelectorAll('.product-card__button');

    // Получаем кнопку закрытия модального окна.
    const closeDialogButton = document.getElementById('close-order-dialog');

    // Получаем скрытое поле, в которое будет записан выбранный товар.
    const selectedProductInput = document.getElementById('selected-product');

    // Получаем место в окне, где показывается название товара.
    const dialogProductName = document.getElementById('order-dialog-product');

    // Перебираем все кнопки "Заказать".
    orderButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Получаем название товара из data-атрибута.
            const productName = button.dataset.product;

            // Записываем название товара в скрытое поле формы.
            selectedProductInput.value = productName;

            // Показываем название товара в модальном окне.
            dialogProductName.textContent = productName;

            // Открываем модальное окно.
            orderDialog.showModal();
        });
    });

    // Закрываем модальное окно по кнопке "Закрыть".
    closeDialogButton.addEventListener('click', () => {
        orderDialog.close();
    });
}

// Если на страницу заявки перешли по кнопке "Заказать" из каталога,
// в адресе есть ?product=... и этот товар сразу выбирается в списке.
// Из калькулятора сборки ещё приходит ?comment=... с расчётом.
const productSelect = document.getElementById('order-product');

if (productSelect) {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    const comment = params.get('comment');

    if (product) {
        productSelect.value = product;
    }

    // value у textarea - это просто текст, HTML из адреса не выполнится.
    if (comment) {
        document.getElementById('order-comment').value = comment;
    }
}

// Проверка формы перед отправкой. Одинаково работает для формы заявки
// (в модальном окне или на order.html) и формы обратной связи на contacts.html.
function setupForm(form, successMessage) {
    form.addEventListener('submit', (event) => {
        // Отменяем стандартную отправку формы,
        // потому что backend пока не подключён.
        event.preventDefault();

        // Сбрасываем предыдущие признаки ошибок.
        const formElements = Array.from(form.elements);

        formElements.forEach((element) => {
            if (element.willValidate) {
                element.removeAttribute('aria-invalid');
            }
        });

        // Проверяем встроенные HTML-ограничения формы.
        if (!form.checkValidity()) {
            formElements.forEach((element) => {
                if (element.willValidate && !element.checkValidity()) {
                    element.setAttribute('aria-invalid', 'true');
                }
            });

            // Показываем стандартные сообщения браузера.
            form.reportValidity();
            return;
        }

        // Показываем сообщение об успешной отправке.
        successMessage.hidden = false;

        // Очищаем форму.
        form.reset();

        // Закрываем модальное окно, если форма была в нём.
        if (orderDialog) {
            orderDialog.close();
        }
    });
}

// Форма заявки и сообщение об успешной отправке.
const orderForm = document.getElementById('order-form');

if (orderForm) {
    setupForm(orderForm, document.getElementById('success-message'));
}

// Форма "Вопрос мастеру" на странице контактов.
const questionForm = document.getElementById('question-form');

if (questionForm) {
    setupForm(questionForm, document.getElementById('question-success'));

    // Подсказки по проблеме: примерная цена и срок.
    // Ключи совпадают с value у пунктов списка "Что случилось".
    const problemHints = {
        'dead-key': 'Чаще всего виноват свитч или пайка. Замена свитча от 50 ₽, перепайка 150 ₽ за свитч, срок 1-2 дня.',
        double: 'Это дребезг контактов свитча. Обычно помогает чистка или замена свитча: от 50 ₽, срок 1 день.',
        liquid: 'Отключите клавиатуру и не включайте, пока не привезёте. Ремонт после залития от 1 900 ₽, срок 2-5 дней.',
        rattle: 'Скорее всего, нужна смазка стабилизаторов: 600 ₽, срок 1 день.',
        switches: 'На плате с горячей заменой 50 ₽ за свитч, с пайкой 150 ₽. Свитчи можно выбрать в мастерской.',
        other: 'Опишите проблему в сообщении, мастер ответит и подскажет цену.'
    };

    const problemSelect = document.getElementById('question-problem');
    const problemHint = document.getElementById('question-hint');

    problemSelect.addEventListener('change', () => {
        const hint = problemHints[problemSelect.value];

        if (hint) {
            problemHint.textContent = hint;
        } else {
            problemHint.textContent = 'Выберите, что случилось, и мы подскажем примерную цену и срок.';
        }
    });
}

// Цена в виде строки: 12340 -> "12 340 ₽".
function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}

// Калькулятор сборки на странице build.html.
// Цены записаны в разметке в атрибутах data-price, поэтому при изменении
// цены нужно поправить только HTML.
const buildForm = document.getElementById('build-form');

if (buildForm) {
    const buildList = document.getElementById('build-list');
    const buildTotal = document.getElementById('build-total');
    const buildDays = document.getElementById('build-days');
    const buildOrderLink = document.getElementById('build-order-link');

    // Работа мастера, входит в каждую сборку.
    const workPrice = 2500;

    function calculateBuild() {
        const layout = buildForm.querySelector('input[name="layout"]:checked');
        const switches = buildForm.querySelector('input[name="switches"]:checked');
        const keycaps = buildForm.querySelector('input[name="keycaps"]:checked');
        const extras = buildForm.querySelectorAll('input[name="extras"]:checked');

        // Количество клавиш нужно, чтобы посчитать свитчи и смазку.
        const keys = Number(layout.dataset.keys);
        const lines = [];
        let total = 0;
        let days = 3;

        const layoutPrice = Number(layout.dataset.price);
        lines.push('Корпус и плата ' + layout.dataset.title + ': ' + formatPrice(layoutPrice));
        total += layoutPrice;

        const switchesPrice = Number(switches.dataset.price) * keys;
        lines.push('Свитчи ' + switches.dataset.title + ', ' + keys + ' шт.: ' + formatPrice(switchesPrice));
        total += switchesPrice;

        const keycapsPrice = Number(keycaps.dataset.price);
        lines.push('Кейкапы ' + keycaps.dataset.title + ': ' + formatPrice(keycapsPrice));
        total += keycapsPrice;

        extras.forEach((extra) => {
            let extraPrice = Number(extra.dataset.price);

            // Смазка считается за каждый свитч.
            if (extra.dataset.perKey === 'yes') {
                extraPrice = extraPrice * keys;
            }

            days += Number(extra.dataset.days);
            lines.push(extra.dataset.title + ': ' + formatPrice(extraPrice));
            total += extraPrice;
        });

        lines.push('Работа мастера: ' + formatPrice(workPrice));
        total += workPrice;

        // Список собираем через createElement и textContent, без innerHTML.
        buildList.textContent = '';

        lines.forEach((line) => {
            const item = document.createElement('li');
            item.textContent = line;
            buildList.append(item);
        });

        buildTotal.textContent = formatPrice(total);

        if (days < 5) {
            buildDays.textContent = 'Срок сборки: ' + days + ' рабочих дня';
        } else {
            buildDays.textContent = 'Срок сборки: ' + days + ' рабочих дней';
        }

        // Расчёт переносится в комментарий формы заявки.
        const comment = 'Расчёт сборки: ' + lines.join('; ') + '. Итого: ' + formatPrice(total);
        buildOrderLink.href = 'order.html?product=build&comment=' + encodeURIComponent(comment);
    }

    // Событие change срабатывает на форме при выборе любого варианта.
    buildForm.addEventListener('change', calculateBuild);
    calculateBuild();
}

// Предпросмотр гравировки на странице services.html.
const engravingForm = document.getElementById('engraving-form');

if (engravingForm) {
    const engravingText = document.getElementById('engraving-text');
    const engravingKey = document.getElementById('engraving-key');
    const engravingResult = document.getElementById('engraving-result');
    const engravingPrice = document.getElementById('engraving-price');

    function updateEngraving() {
        const place = engravingForm.querySelector('input[name="place"]:checked');
        const text = engravingText.value.trim();

        // Текст пользователя выводим через textContent, теги в нём не сработают.
        if (text) {
            engravingResult.textContent = text;
        } else {
            engravingResult.textContent = 'Ваш текст';
        }

        // Форма клавиши зависит от места: Esc, пробел или корпус.
        engravingKey.className = 'engraving__key engraving__key--' + place.value;
        engravingPrice.textContent = formatPrice(Number(place.dataset.price));
    }

    engravingForm.addEventListener('input', updateEngraving);
    engravingForm.addEventListener('change', updateEngraving);

    // Форма только для предпросмотра, Enter не должен перезагружать страницу.
    engravingForm.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    updateEngraving();
}

// Личный кабинет: статус заказа на странице status.html.
// Сервера пока нет, поэтому несколько заказов записаны здесь для проверки.
const orders = {
    '1024': {
        phone: '4567',
        keyboard: 'Клац 65 Wood',
        service: 'Чистка и смазка свитчей',
        master: 'Алексей',
        price: 2900,
        ready: '19 ноября',
        step: 2
    },
    '2048': {
        phone: '1234',
        keyboard: 'Keychron K8',
        service: 'Ремонт после залития',
        master: 'Сергей',
        price: 1900,
        ready: '21 ноября',
        step: 1
    },
    '3072': {
        phone: '7777',
        keyboard: 'Сборка TKL на Kailh Box Brown',
        service: 'Сборка на заказ',
        master: 'Алексей',
        price: 15215,
        ready: 'готова, можно забирать',
        step: 4
    }
};

const statusForm = document.getElementById('status-form');

if (statusForm) {
    const statusMessage = document.getElementById('status-message');
    const orderStatus = document.getElementById('order-status');
    const stepItems = document.querySelectorAll('.status-steps__item');

    statusForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const numberInput = document.getElementById('status-number');
        const phoneInput = document.getElementById('status-phone');

        numberInput.removeAttribute('aria-invalid');
        phoneInput.removeAttribute('aria-invalid');

        if (!statusForm.checkValidity()) {
            if (!numberInput.checkValidity()) {
                numberInput.setAttribute('aria-invalid', 'true');
            }

            if (!phoneInput.checkValidity()) {
                phoneInput.setAttribute('aria-invalid', 'true');
            }

            statusForm.reportValidity();
            return;
        }

        const order = orders[numberInput.value];

        // Заказ показываем, только если совпали и номер, и цифры телефона.
        if (!order || order.phone !== phoneInput.value) {
            orderStatus.hidden = true;
            statusMessage.textContent = 'Заказ не найден. Проверьте номер заказа и цифры телефона.';
            return;
        }

        statusMessage.textContent = '';
        document.getElementById('order-status-number').textContent = numberInput.value;
        document.getElementById('order-status-keyboard').textContent = order.keyboard;
        document.getElementById('order-status-service').textContent = order.service;
        document.getElementById('order-status-master').textContent = order.master;
        document.getElementById('order-status-price').textContent = formatPrice(order.price);
        document.getElementById('order-status-ready').textContent = order.ready;

        // Этапы до текущего выполнены, текущий выделен, остальные впереди.
        stepItems.forEach((item, index) => {
            const state = item.querySelector('.status-steps__state');
            item.classList.remove('status-steps__item--done', 'status-steps__item--current');
            item.removeAttribute('aria-current');

            if (index < order.step) {
                item.classList.add('status-steps__item--done');
                state.textContent = 'выполнено';
            } else if (index === order.step) {
                item.classList.add('status-steps__item--current');
                item.setAttribute('aria-current', 'step');
                state.textContent = 'сейчас';
            } else {
                state.textContent = '';
            }
        });

        orderStatus.hidden = false;

        // Переводим фокус на заголовок результата, чтобы с клавиатуры
        // и в программе чтения с экрана было сразу понятно, что заказ найден.
        document.getElementById('order-status-title').focus();
    });
}

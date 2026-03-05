document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const recentInput = document.getElementById('recent-input');
    let firstValue = null;
    let operator = null;
    let waitingForSecondValue = false;

    loadStateFromCookies();

    document.querySelector('.calculator-buttons').addEventListener('click', (event) => {
        const target = event.target;
        if (!target.matches('button')) {
            return;
        }

        if (target.dataset.action) {
            handleOperator(target.dataset.action);
        } else {
            inputDigit(target.textContent);
        }
        updateDisplay();
        saveStateToCookies();
    });

    document.addEventListener('keydown', (event) => {
        const key = event.key;
        if (key >= '0' && key <= '9') {
            inputDigit(key);
        } else if (key === '.') {
            handleOperator('decimal');
        } else if (key === '=' || key === 'Enter') {
            handleOperator('calculate');
        } else if (key === 'Backspace') {
            handleOperator('delete');
        } else if (key === 'Escape') {
            handleOperator('clear');
        } else if (key === '%') {
            handleOperator('percent');
        } else if (key === '+') {
            handleOperator('add');
        } else if (key === '-') {
            handleOperator('subtract');
        } else if (key === '*') {
            handleOperator('multiply');
        } else if (key === '/') {
            handleOperator('divide');
        }
        updateDisplay();
        saveStateToCookies();
    });

    function handleOperator(action) {
        const inputValue = parseFloat(display.textContent);

        if (action === 'clear') {
            firstValue = null;
            operator = null;
            waitingForSecondValue = false;
            display.textContent = '0';
            recentInput.textContent = '0';
            return;
        }

        if (action === 'delete') {
            display.textContent = display.textContent.slice(0, -1) || '0';
            return;
        }

        if (action === 'percent') {
            display.textContent = (inputValue / 100).toString();
            return;
        }

        if (action === 'decimal') {
            if (!display.textContent.includes('.')) {
                display.textContent += '.';
            }
            return;
        }

        if (firstValue === null && !isNaN(inputValue)) {
            firstValue = inputValue;
        } else if (operator) {
            const result = calculate(firstValue, inputValue, operator);
            display.textContent = result;
            firstValue = result;
        }

        waitingForSecondValue = true;
        operator = action;

        recentInput.textContent = `${firstValue} ${getOperatorSymbol(action)}`;
    }

    function inputDigit(digit) {
        if (waitingForSecondValue) {
            display.textContent = digit;
            waitingForSecondValue = false;
        } else {
            display.textContent = display.textContent === '0' ? digit : display.textContent + digit;
        }
    }

    function updateDisplay() {
        display.textContent = display.textContent.slice(0, 12);
    }

    function calculate(first, second, operator) {
        if (operator === 'add') {
            return first + second;
        } else if (operator === 'subtract') {
            return first - second;
        } else if (operator === 'multiply') {
            return first * second;
        } else if (operator === 'divide') {
            return first / second;
        }
        return second;
    }

    function getOperatorSymbol(operator) {
        switch (operator) {
            case 'add':
                return '+';
            case 'subtract':
                return '-';
            case 'multiply':
                return '×';
            case 'divide':
                return '÷';
            default:
                return '';
        }
    }

    function saveStateToCookies() {
        document.cookie = `firstValue=${firstValue};path=/`;
        document.cookie = `operator=${operator};path=/`;
        document.cookie = `display=${display.textContent};path=/`;
        document.cookie = `recentInput=${recentInput.textContent};path=/`;
    }

    function loadStateFromCookies() {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=').map(c => c.trim());
            acc[key] = value;
            return acc;
        }, {});

        if (cookies.firstValue) {
            firstValue = parseFloat(cookies.firstValue);
        }
        if (cookies.operator) {
            operator = cookies.operator;
        }
        if (cookies.display) {
            display.textContent = cookies.display;
        }
        if (cookies.recentInput) {
            recentInput.textContent = cookies.recentInput;
        } else {
            recentInput.textContent = '0';
        }
    }
});

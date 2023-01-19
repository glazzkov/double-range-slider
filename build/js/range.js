// DOM-элементы
let rangeWrapper;
let rangeBar;
let rangeScale;
let rangeToggleMin;
let rangeToggleMax;
let inputMin;
let inputMax;
// переменные для управления координатами ползунков
let cursorPositionX;
let currentToggle;
let scaleMarginLeft;
let scaleMarginRight;
let barWidth;
let deltaPositionX;
let deltaPositionPercent;

// переменные значений полей инпутов
let rangeMinValue;
let rangeMaxValue;

// булевые функции для проверки изменения координат
const isMarginLeftChangable = (deltaMargin) => {
  let maxMargin = 95 - scaleMarginRight;
  let minMargin = 0.1;
  let newMargin = scaleMarginLeft + deltaMargin;
  if ((newMargin <= minMargin) || (newMargin >= maxMargin)) {
    return false;
  }
  return true;
}

const isMarginRightChangable = (deltaMargin) => {
  let maxMargin = 95 - scaleMarginLeft;
  let minMargin = 0.1;
  let newMargin = scaleMarginRight - deltaMargin;
  if ((newMargin <= minMargin) || (newMargin >= maxMargin)) {
    return false;
  }
  return true;
}

const isCurrentToggleMin = () => {
  if (currentToggle.classList.contains('range__toggle--min')) {
    return true;
  }
  return false;
}

const isCurrentToggleMax = () => {
  if (currentToggle.classList.contains('range__toggle--max')) {
    return true;
  }
  return false;
}

const isInputsExist = () =>{
  if (inputMin && inputMax) {
    return true
  }
  return false;
}

// меняет минимальное значение в инпуте при изменении левого toggle
const changeMinValue = () => {
  let marginInPixelx = barWidth() / 100 * parseInt(scaleMarginLeft);
  let value = rangeMinValue + Math.round(marginInPixelx * (rangeMaxValue - rangeMinValue) / barWidth());
  inputMin.value = value;
}

// меняет максимальное значение в инпуте при изменении правого toggle
const changeMaxValue = () => {
  let marginInPixelx = barWidth() / 100 * parseInt(scaleMarginRight);
  let value = rangeMaxValue - Math.round(marginInPixelx * (rangeMaxValue - rangeMinValue) / barWidth());
  inputMax.value = value;
}
// перемещает левый toggle при изменении значения в инпуте
const changeMarginLeft = () => {
  let newMax = rangeMaxValue - rangeMinValue;
  let newValue = inputMin.value - rangeMinValue;
  let margin = (newValue / newMax) * 100;
  let maxMargin = 95 - scaleMarginRight;
  let minMargin = 0.1;
  if (margin < minMargin) {
    margin = minMargin;
  } else if (margin > maxMargin) {
    margin = maxMargin;
  }
  scaleMarginLeft = margin;
  rangeScale.style.marginLeft = margin + '%';
}

// перемещает правый toggle при изменении значения в инпуте
const changeMarginRight = () => {
  let newMax = rangeMaxValue - rangeMinValue;
  let newValue = (inputMax.value - rangeMinValue);
  let margin = ((newMax - newValue) / newMax) * 100;
  let maxMargin = 95 - scaleMarginLeft;
  let minMargin = 0.1;
  if (margin < minMargin) {
    margin = minMargin;
  } else if (margin > maxMargin) {
    margin = maxMargin;
  }
  scaleMarginRight = margin;
  rangeScale.style.marginRight = margin + '%';
}

//
const range = {
  // инициализация range
  init: (selector, minValue, maxValue, minDefault, maxDefault) => {
    rangeWrapper = () => document.querySelector(selector);
    rangeBar = rangeWrapper().querySelector('.range__bar');
    rangeScale = rangeWrapper().querySelector('.range__scale');
    rangeToggleMin = rangeWrapper().querySelector('.range__toggle--min');
    rangeToggleMax = rangeWrapper().querySelector('.range__toggle--max');
    inputMin = rangeWrapper().querySelector('.range__input--min');
    inputMax = rangeWrapper().querySelector('.range__input--max');
    scaleMarginLeft = parseInt(rangeScale.style.marginLeft);
    scaleMarginRight = parseInt(rangeScale.style.marginRight);

    barWidth = () => rangeBar.offsetWidth;
    deltaPositionX = (xStart, xEnd) => xStart - xEnd;
    deltaPositionPercent = (evt) => (deltaPositionX(evt.pageX, cursorPositionX) / barWidth() * 100);

    rangeMinValue = minValue;
    rangeMaxValue = maxValue;
    if (isInputsExist()) {
      inputMin.value = minDefault;
      inputMax.value = maxDefault;
      changeMarginLeft();
      changeMarginRight();
      inputMin.addEventListener('change', range.valueChanged);
      inputMax.addEventListener('change', range.valueChanged);
    }

    rangeToggleMin.addEventListener('mousedown', range.mouseDown);
    rangeToggleMax.addEventListener('mousedown', range.mouseDown);
  },

  // обработчик нажатия кнопки мыши
  mouseDown: (evt) => {
    cursorPositionX = evt.pageX;
    currentToggle = evt.target;
    window.addEventListener('mousemove', range.mouseMove);
    window.addEventListener('mouseup', range.mouseUp);
  },

  // обработчик движения мыши при зажатой кнопке
  mouseMove: (evt) => {
    let deltaX = deltaPositionPercent(evt);
    if (isCurrentToggleMin() && isMarginLeftChangable(deltaX)) {
      scaleMarginLeft += deltaX;
      rangeScale.style.marginLeft = (scaleMarginLeft) + '%';
      if (isInputsExist()) {
        changeMinValue();
      }
    } else if (isCurrentToggleMax() && isMarginRightChangable(deltaX)) {
      scaleMarginRight -= deltaX;
      rangeScale.style.marginRight = (scaleMarginRight) + '%';
      if (isInputsExist()) {
        changeMaxValue();
      }
    }
    cursorPositionX = evt.pageX;
  },

  // удаляет обработчик движения мыши после отжатия клика
  mouseUp: (evt) => {
    window.removeEventListener('mousemove', range.mouseMove);
  },
  // обработчик изменения в инпутах
  valueChanged: (evt) => {
    if (evt.target.classList.contains('range__input--min')) {
      changeMarginLeft();
    } else if (evt.target.classList.contains('range__input--max')) {
      changeMarginRight();
    }

  }
}

const initRange = (selector = '#range-wrapper', minValue = 0, maxValue = 1000, minDefault = minValue, maxDefault = maxValue) => {
  if (minValue > maxValue) {
    [minValue, maxValue] = [maxValue, minValue]
  }
  if (minDefault > maxDefault) {
    [minDefault, maxDefault] = [maxDefault, minDefault];
  }
  range.init(selector, minValue, maxValue, minDefault, maxDefault);
}

export { initRange };

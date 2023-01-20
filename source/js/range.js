export const range = (rangeSelector = '#range-wrapper', minValue = 100, maxValue = 1000, minDefault = minValue, maxDefault = maxValue) => {
  // объект слайдера, возвращаемый функцией
  const current = {
    // инициализация слайдера
    init: () => {
      // DOM-элементы
      current.wrapper = document.querySelector(rangeSelector);
      current.bar = current.wrapper.querySelector('.range__bar');
      current.scale = current.wrapper.querySelector('.range__scale');
      current.toggleRight = current.wrapper.querySelector('.range__toggle--min');
      current.toggleLeft = current.wrapper.querySelector('.range__toggle--max');
      current.inputMin = current.wrapper.querySelector('.range__input--min');
      current.inputMax = current.wrapper.querySelector('.range__input--max');
      current.currentToggle = null;
      // переменные для движения toggle
      current.scaleMarginLeft = parseInt(current.scale.style.marginLeft);
      current.scaleMarginRight = parseInt(current.scale.style.marginRight);
      current.mouseX = null;
      current.barWidth = current.bar.offsetWidth;
      // переменные инпутов
      current.rangeMinValue = minValue;
      current.rangeMaxValue = maxValue;
      current.rangeMinDefault = minDefault;
      current.rangeMaxDefault = maxDefault;
      current.setDefaultValues();

      current.toggleRight.addEventListener('mousedown', current.downEvent);
      current.toggleLeft.addEventListener('mousedown', current.downEvent);
      current.inputMin.addEventListener('change', current.changeEvent);
      current.inputMax.addEventListener('change', current.changeEvent);
    },

    // событие нажатия мыши
    downEvent: (evt) => {
      current.currentToggle = evt.target;
      current.mouseX = evt.pageX;
      current.barWidth = current.bar.offsetWidth;
      window.addEventListener('mousemove', current.moveEvent);
      window.addEventListener('mouseup', current.upEvent)
    },

    // событие движения мыши при зажатой кнопке
    moveEvent: (evt) => {
      current.barWidth = current.bar.offsetWidth;
      let deltaX = current.deltaX(current.mouseX, evt.pageX);
      let deltaXPercent = current.deltaXPercent(current.barWidth, deltaX);
      current.changeMargin(deltaXPercent);
      current.mouseX = evt.pageX;
    },

    // событие отжатия мыши, удаляет событие движения
    upEvent: (evt) => {
      window.removeEventListener('mousemove', current.moveEvent);
    },

    changeEvent: (evt) => {
      let input = evt.target;
      if (current.isInputMin(input)) {
        current.changeMarginLeft();
      } else if (current.isInputMax(input)) {
        current.changeMarginRight();
      }
    },

    // меняет margin scale, сдвигает toggle
    changeMargin: (deltaMargin) => {
      const toggle = current.currentToggle;
      const scale = current.scale;
      if (current.isToggleLeft(toggle) && current.isMarginChangable(deltaMargin)) {
        current.scaleMarginLeft += deltaMargin;
        scale.style.marginLeft = `${current.scaleMarginLeft}%`;
        current.changeMinValue();
      } else if (current.isToggleRight(toggle) && current.isMarginChangable(deltaMargin)) {
        current.scaleMarginRight -= deltaMargin;
        scale.style.marginRight = `${current.scaleMarginRight}%`;
        current.changeMaxValue();
      }
    },

    // перемещает toggle при изменении значений в левом инпуте
    changeMarginLeft: () => {
      let newMax = current.rangeMaxValue - current.rangeMinValue;
      let newValue = current.inputMin.value - current.rangeMinValue;
      let margin = (newValue / newMax) * 100;
      let maxMargin = 95 - current.scaleMarginRight;
      let minMargin = 0.1;
      if (margin < minMargin) {
        margin = minMargin;
      } else if (margin > maxMargin) {
        margin = maxMargin;
      }
      current.scaleMarginLeft = margin;
      current.scale.style.marginLeft = margin + '%';
    },

    // перемещает toggle при изменении значений в правом инпуте
    changeMarginRight: () => {
      let newMax = current.rangeMaxValue - current.rangeMinValue;
      let newValue = (current.inputMax.value - current.rangeMinValue);
      let margin = ((newMax - newValue) / newMax) * 100;
      let maxMargin = 95 - current.scaleMarginLeft;
      let minMargin = 0.1;
      if (margin < minMargin) {
        margin = minMargin;
      } else if (margin > maxMargin) {
        margin = maxMargin;
      }
      current.scaleMarginRight = margin;
      current.scale.style.marginRight = margin + '%';
    },

    // меняет минимальное значение range в инпуте
    changeMinValue: () => {
      if (current.isInputsExist()) {
        let marginInPixelx = current.barWidth / 100 * parseInt(current.scaleMarginLeft);
        let min = current.rangeMinValue;
        let max = current.rangeMaxValue
        let value = min + Math.round(marginInPixelx * (max - min) / current.barWidth);
        current.inputMin.value = value;
      }
    },

    // меняет максимальное значение range в инпуте
    changeMaxValue: () => {
      if (current.isInputsExist()) {
        let marginInPixelx = current.barWidth / 100 * parseInt(current.scaleMarginRight);
        let min = current.rangeMinValue;
        let max = current.rangeMaxValue
        let value = max - Math.round(marginInPixelx * (max - min) / current.barWidth);
        current.inputMax.value = value;
      }
    },

    // валидирует минимальные и максимальные значения
    validateValues: () => {
      if (current.rangeMinValue > current.rangeMaxValue) {
        [current.rangeMinValue, current.rangeMaxValue] = [current.rangeMaxValue, current.rangeMinValue];
      }
      if (current.rangeMinDefault > current.rangeMaxDefault) {
        [current.rangeMinDefault, current.rangeMaxDefault] = [current.rangeMaxDefault, current.rangeMinDefault];
      }
    },
    setDefaultValues: () => {
      if (current.isInputsExist()) {
        current.validateValues();
        current.inputMin.value = current.rangeMinDefault;
        current.inputMax.value = current.rangeMaxDefault;
        current.changeMarginLeft();
        current.changeMarginRight();
      }
    },


    //проверяет, может ли быть изменен margin
    isMarginChangable: (deltaMargin) => {
      let minMargin = 0.1;
      if (current.isToggleLeft(current.currentToggle)) {
        let maxMargin = 95 - current.scaleMarginRight;
        let newMargin = current.scaleMarginLeft + deltaMargin;
        return (newMargin >= minMargin) && (newMargin <= maxMargin);
      } else if (current.isToggleRight(current.currentToggle)) {
        let maxMargin = 95 - current.scaleMarginLeft;
        let newMargin = current.scaleMarginRight - deltaMargin;
        return (newMargin >= minMargin) && (newMargin <= maxMargin);
      }
    },

    isToggleLeft: (toggle) => toggle.classList.contains('range__toggle--min'),
    isToggleRight: (toggle) => toggle.classList.contains('range__toggle--max'),
    isInputMin: (input) => input.classList.contains('range__input--min'),
    isInputMax: (input) => input.classList.contains('range__input--max'),
    isInputsExist: () => (current.inputMin && current.inputMax) ? true : false,

    deltaX: (xBefore, xAfter) => xAfter - xBefore,
    deltaXPercent: (barWidth, deltaX) => (deltaX / barWidth) * 100,

  };
  return current;
}

export class Canvas {
  canvas = document.createElement('canvas');
  ctx = this.canvas.getContext('2d');
  #currentColor = '#000000'; // цвет линии
  #currentBg = 'white'; // цвет фона
  #currentSize = 2; // толщина линии
  canvasSize = 50; // размер поля
  #isMouseDown = false;
  vectors = []; // массив векторов (0 - пусто, 1 - закрашено)

  constructor() {
    this.createCanvas();
  }

  // Создание поля
  createCanvas() {
    this.canvas.id = 'canvas';
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;
    this.canvas.style.zIndex = '8';
    this.canvas.style.border = '1px solid';
    this.ctx.fillStyle = this.#currentBg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    document.getElementById('main').appendChild(this.canvas);
  }

  // Очистка поля
  clear() {
    this.ctx.fillStyle = this.#currentBg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getClearArray(canvasSize) {
    const length = canvasSize * canvasSize;
    return new Array(length).fill(0);
  }

  toImage(data, canvasSize) {
    const input = this.getClearArray(canvasSize);

    // Получение rgba одного пикселя
    function getPixel(imgData, index) {
      let i = index * 4;
      let d = imgData;
      let arr = new Array(4);

      for (let x = 0; x < arr.length; x++) {
        arr[x] = d[i + x];
      }

      return arr; // массив [R,G,B,A]
    }

    for (let x = 0, indexInput = 0; x < canvasSize; x++) {
      for (let y = 0; y < canvasSize; y++, indexInput++) {
        let rgba = getPixel(data, y * canvasSize + x);
        if (!rgba.every((e) => e === 255)) {
          input[indexInput] = 1;
        }
      }
    }

    return input;
  }

  // Получение векторов
  getVectors() {
    const data = this.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    const arr = Array.from(data.data);

    this.vectors = this.toImage(arr, this.canvasSize);

    return this.vectors;
  }

  // Перемешать массив
  shuffle(arr = []) {
    let newArr = [];

    for (let i = arr.length - 1; i >= 0; i--) {
      let id = Math.floor(Math.random() * arr.length);
      newArr.push(arr[id]);
      arr.splice(id, 1);
    }

    return newArr;
  }

  // Позиция мыши
  #getMousePos(evt) {
    let rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  // Кнопка мыши зажата
  mousedown(evt) {
    this.#isMouseDown = true;
    let currentPosition = this.#getMousePos(evt);
    this.ctx.moveTo(currentPosition.x, currentPosition.y);
    this.ctx.beginPath();
    this.ctx.lineWidth = this.#currentSize;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.#currentColor;
  }

  // Процесс рисования
  mousemove(evt) {
    if (this.#isMouseDown) {
      let currentPosition = this.#getMousePos(evt);
      this.ctx.lineTo(currentPosition.x, currentPosition.y);
      this.ctx.stroke();
    }
  }

  // Кнопку мыши отпустили
  mouseup() {
    this.#isMouseDown = false;
  }
}

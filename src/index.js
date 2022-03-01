import loader from '@assemblyscript/loader';
import './style.scss';

// Подключение модуля Wasm
loader.instantiate(fetch('./build/optimized.wasm')).then(({ exports }) => {
  // Функции Wasm
  const {
    Int32Array_ID,
    Int32Array_ID2,
    Float64Array_ID,
    InitWeight,
    Predict,
    Correct,
    toImage,
  } = exports;
  const { __newArray, __getArray, __pin, __unpin } = exports;

  // Константы и настройки
  let neuronSum = 0; // сумма нейрона
  let sigmoidRes = 0; // ответ сигмоиды

  class Canvas {
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

    // Получение векторов
    getVectors() {
      const data = this.ctx.getImageData(
        0,
        0,
        this.canvasSize,
        this.canvasSize
      );
      const arr = Array.from(data.data);

      const pixelArr = __pin(__newArray(Int32Array_ID, arr));

      const vectorArr = __getArray(__pin(toImage(pixelArr, this.canvasSize)));

      this.vectors = vectorArr;

      __unpin(pixelArr);
      __unpin(vectorArr);
    }

    // Перемешать массив
    #shuffle(arr = []) {
      let newArr = [];

      for (let i = arr.length - 1; i >= 0; i--) {
        let id = Math.floor(Math.random() * arr.length);
        newArr.push(arr[id]);
        arr.splice(id, 1);
      }

      return newArr;
    }

    // Загрузить датасет
    loadDataset(e) {
      let files = e.target.files;
      files = Object.values(files);

      files = this.#shuffle(files);

      files.forEach((file) => {
        const reader = new FileReader();
        let fileName = file.name;

        reader.onload = (e) => {
          let img = new Image();
          img.onload = () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
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

  class Weight {
    weights = []; // массив весов

    // Инициализация весов
    initWeights() {
      const arr = __getArray(__pin(InitWeight(canva.canvasSize)));
      this.weights = arr;

      console.log('Инициализированные веса:');
      console.log(this.weights);

      initBtn.disabled = true;

      __unpin(arr);
    }

    // Загрузка весов из файла
    load(e) {
      const file = e.target.files[0];

      let reader = new FileReader();

      reader.readAsText(file);

      reader.onload = function () {
        let res = reader.result;

        res = res.split(',');
        res = res.map((e) => Number(e));

        this.weights = res;

        console.log('Загруженные веса:');
        console.log(res);
      };

      reader.onerror = function () {
        console.log(reader.error);
      };

      initBtn.disabled = true;
    }

    // Сохранение весов в файл
    save() {
      const a = document.createElement('a');

      const file = new Blob([this.weights], { type: 'text/plain' });

      a.href = URL.createObjectURL(file);
      a.download = 'weights.txt';
      a.click();

      URL.revokeObjectURL(a.href);
    }
  }

  const canva = new Canvas();
  const weight = new Weight();

  // Кнопки
  const correct_cross = document.getElementById('correct_cross');
  const correct_other = document.getElementById('correct_other');
  const predictBtn = document.getElementById('predict');
  const initBtn = document.getElementById('init');

  // Рисование
  canva.canvas.addEventListener('mousedown', (event) => canva.mousedown(event));
  canva.canvas.addEventListener('mousemove', (event) => canva.mousemove(event));
  canva.canvas.addEventListener('mouseup', () => canva.mouseup());

  // Ивенты
  document
    .getElementById('clear')
    .addEventListener('click', () => canva.clear());

  document
    .getElementById('load')
    .addEventListener('change', (e) => weight.load(e));

  document
    .getElementById('save')
    .addEventListener('click', () => weight.save());

  initBtn.addEventListener('click', () => weight.initWeights());

  document
    .getElementById('dataset')
    .addEventListener('change', (e) => canva.loadDataset(e));

  //   correct_cross.addEventListener('click', () => reTrain(true));
  //   correct_other.addEventListener('click', () => reTrain(false));
  //   predictBtn.addEventListener('click', () => PredictFunc(false));
});

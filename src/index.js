import loader from '@assemblyscript/loader';
import './style.scss';

// Подключение модуля Wasm
loader.instantiate(fetch('./build/optimized.wasm')).then(({ exports }) => {
  // Функции Wasm
  const {
    Int32Array_ID,
    Int32Array_ID2,
    Float64Array_ID,
    Float32Array_ID,
    InitWeight,
    Predict,
    Correct,
    toImage,
  } = exports;
  const { __newArray, __getArray, __pin, __unpin } = exports;

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

    get get_vectors() {
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
      predictBtn.disabled = false;
    }
  }

  class Weight {
    weights = []; // массив весов

    // Инициализация весов
    initWeights() {
      for (let i = 0; i < 10; i++) {
        const arr = __getArray(__pin(InitWeight(canva.canvasSize)));
        this.weights.push(arr);
        __unpin(arr);
      }

      console.log('Инициализированные веса:');
      console.log(this.weights);

      initBtn.disabled = true;
    }

    set set_weigths(newWeights) {
      this.weights = newWeights;
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
        let result = [];
        let index = 0;
        let endIndex = canva.canvasSize * canva.canvasSize;

        for (let i = 0; i < 10; i++) {
          let substr = res.slice(index, endIndex);
          result.push(substr);

          index = endIndex;
          endIndex = endIndex + canva.canvasSize * canva.canvasSize;
        }

        this.weights = result;

        console.log('Загруженные веса:');
        console.log(result);
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

  class Neuron {
    neuronSum = [];
    answer = 0;
    correctAnswers = 0;
    images = 0;

    get get_neuronSum() {
      return this.neuronSum;
    }

    set set_neuronSum(newSum) {
      this.neuronSum = newSum;
    }

    get get_answer() {
      return this.answer;
    }

    set set_answer(newAnsw) {
      this.answer = newAnsw;
    }

    set set_correctAnswers(newAnsw) {
      this.correctAnswers = newAnsw;
    }

    get get_correctAnswers() {
      return this.correctAnswers;
    }

    set set_images(images) {
      this.images = images;
    }

    get get_images() {
      return this.images;
    }
  }

  const canva = new Canvas();
  const neuron = new Neuron();
  const weight = new Weight();

  function PredictFunc(auto) {
    canva.getVectors();
    const vectors = __pin(__newArray(Int32Array_ID, canva.get_vectors));
    let sumArr = [];

    for (let i = 0; i < 10; i++) {
      const weightsArr = __pin(__newArray(Float32Array_ID, weight.weights[i]));
      let sum = Predict(weightsArr, vectors);
      sumArr.push(sum);

      __unpin(weightsArr);
    }

    neuron.set_neuronSum = sumArr;
    let max = Math.max(...sumArr);
    neuron.set_answer = sumArr.indexOf(max);

    !auto && alert(sumArr.indexOf(max));

    __unpin(vectors);
  }

  // Загрузить датасет
  async function loadDataset(e) {
    predictBtn.disabled = false;

    let files = e.target.files;
    files = Object.values(files);
    neuron.set_images = files.length;

    files = canva.shuffle(files);

    const promise = new Promise((resolve, reject) => {
      resolve(
        files.forEach((file) => {
          const reader = new FileReader();
          let fileName = file.name;

          reader.onload = (e) => {
            let img = new Image();
            img.onload = () => {
              canva.canvas.width = img.width;
              canva.canvas.height = img.height;
              canva.ctx.drawImage(img, 0, 0);

              autoTrain(fileName[0]);
              console.log(neuron.get_correctAnswers);
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        })
      );
    });

    promise.then(() => console.log('awd'));
  }

  function autoTrain(fileName) {
    PredictFunc(true);

    const vectorsArr = __pin(__newArray(Int32Array_ID, canva.get_vectors));

    let newWeights = [];
    let correctNumber;

    if (Number(fileName) === neuron.get_answer) {
      correctNumber = true;
      neuron.set_correctAnswers = neuron.get_correctAnswers + 1;
    }

    for (let i = 0; i < 10; i++) {
      const weightArr = __pin(__newArray(Float32Array_ID, weight.weights[i]));

      let newWeight = __getArray(
        __pin(
          Correct(
            weightArr,
            vectorsArr,
            neuron.get_neuronSum[i],
            0.05,
            correctNumber
          )
        )
      );

      newWeights.push(newWeight);

      __unpin(weightArr);
      __unpin(newWeight);
    }

    weight.set_weigths = newWeights;

    __unpin(vectorsArr);
  }

  // Кнопки
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
    .addEventListener('change', (e) => loadDataset(e));

  predictBtn.addEventListener('click', () => PredictFunc(false));
});

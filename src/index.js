import { Neuron } from './neuron';
import { Canvas } from './canvas';
var _ = require('lodash');
import './style.scss';

const speedLearn = 0.3;

const imagesCount = 10;

const canvas = new Canvas();
const neuron = new Neuron(canvas.canvasSize, imagesCount, speedLearn);

// Загрузка датасета
async function loadDataset(e) {
  let time = performance.now();

  let files = e.target.files;
  files = Object.values(files);

  files = canvas.shuffle(files);

  let vectorsAndAnswer = [];

  const promise = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        let fileName = file.name;

        reader.onload = (e) => {
          let img = new Image();
          img.onload = () => {
            canvas.canvas.width = img.width;
            canvas.canvas.height = img.height;
            canvas.ctx.drawImage(img, 0, 0);

            const indexCorrect = Number(fileName[0]);
            let correctAnswers = Array(imagesCount).fill(0);

            correctAnswers[indexCorrect] = 1;
            vectorsAndAnswer.push({
              answer: correctAnswers,
              vector: canvas.getVectors(),
            });

            resolve();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      })
  );

  await Promise.all(promise);

  let percentCorrect = 0;
  let prevPercent = 0;
  let errorRepeat = 0;

  let epoch = 0;

  do {
    percentCorrect = neuron.TrainDataset(_.shuffle(vectorsAndAnswer));

    if (percentCorrect.toFixed(2) == prevPercent.toFixed(2)) {
      errorRepeat++;
    } else {
      errorRepeat = 0;
    }

    epoch++;

    console.log(percentCorrect);
    prevPercent = percentCorrect;
  } while (percentCorrect < 100);

  const getSeconds = () => {
    let res = (performance.now() - time) / 1000;
    return Number(res.toFixed(3));
  };

  console.log('finish');
  console.table([
    ['Прошло эпох', epoch],
    ['Всего образов', vectorsAndAnswer.length],
    ['Всего ошибок', neuron.errors],
    ['Прошло времени', getSeconds()],
  ]);
}

// Рисование
canvas.canvas.addEventListener('mousedown', (event) => canvas.mousedown(event));
canvas.canvas.addEventListener('mousemove', (event) => canvas.mousemove(event));
canvas.canvas.addEventListener('mouseup', () => canvas.mouseup());

// Кнопки
let predictBtn = document.getElementById('predict');
predictBtn.addEventListener('click', () => {
  const vectors = neuron.Predict(canvas.getVectors());
  const max = Math.max(...vectors);
  alert(vectors.indexOf(max));
});

let initWeightsBtn = document.getElementById('init');
initWeightsBtn.addEventListener('click', () => {
  neuron.Train(canvas.getVectors(), [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
});

let clearBtn = document.getElementById('clear');
clearBtn.addEventListener('click', () => canvas.clear());

let saveWeightsBtn = document.getElementById('save');
saveWeightsBtn.addEventListener('click', () => neuron.saveWeights());

let loadWeightsBtn = document.getElementById('load');
loadWeightsBtn.addEventListener('change', (e) => {
  neuron.loadWeights(e);
});

let loadDatasetBtn = document.getElementById('dataset');
loadDatasetBtn.addEventListener('change', (e) => loadDataset(e));

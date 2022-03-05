import { Neuron } from './neuron';
import { Canvas } from './canvas';
import './style.scss';

const imagesCount = 10;

const canvas = new Canvas();
const neuron = new Neuron(canvas.canvasSize, imagesCount, 0.01, 0.1);

// Загрузка датасета
async function loadDataset(e) {
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
  do {
    percentCorrect = neuron.TrainDataset(vectorsAndAnswer);
    if (percentCorrect.toFixed(2) == percentCorrect.toFixed(2)) {
      errorRepeat++;
    } else {
      errorRepeat = 0;
    }
    console.log(percentCorrect);
    prevPercent = percentCorrect;
  } while (percentCorrect < 90 && errorRepeat <= 500);
  console.log('finish');
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

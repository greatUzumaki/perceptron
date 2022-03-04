// The entry file of your WebAssembly module.

// Экспорт типа массива
export const Int32Array_ID = idof<Int32Array>();
export const Int32Array_ID2 = idof<Int32Array>();
export const Float64Array_ID = idof<Float64Array>();
export const Float32Array_ID = idof<Float32Array>();

// Создание пустого массива
export function getClearArray(canvasSize: i32): Int32Array {
  const length = canvasSize * canvasSize;
  return new Int32Array(length).fill(0);
}

// Преобразование в вектор
export function toImage(data: Int32Array, canvasSize: i32): Int32Array {
  const input = getClearArray(canvasSize);

  // Получение rgba одного пикселя
  function getPixel(imgData: Int32Array, index: i32): Int32Array {
    let i = index * 4;
    let d = imgData;
    let arr = new Int32Array(4);

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

// Инициализация весов
export function InitWeight(canvasSize: i32): Float32Array {
  const weights = new Float32Array(canvasSize * canvasSize);

  for (let i = 0, arrLen = weights.length; i < arrLen; i++) {
    weights[i] = (Math.round((Math.random() * (0.31 + 0.31) - 0.31) * 1000) /
      1000) as f32; // [-0.3; 0.3]
    if (weights[i] === -0) weights[i] = 0;
  }

  return weights;
}

// вычисление сигмоиды
function sigmoid(sum: f32): f64 {
  return 1 / (1 + Math.exp(-sum));
}

// Угадывание
export function Predict(weight: Float32Array, vectors: Int32Array): f64 {
  let sum: f32 = 0;
  for (let i = 0, arrLen = weight.length; i < arrLen; i++) {
    sum += (vectors[i] as f32) * weight[i];
  }

  return sigmoid(sum);
}

// производная сигмоиды
function sigmoid_derivative(sigmoid: f32): f32 {
  return sigmoid * (1 - sigmoid);
}

const positive: f32 = 0.95;
const negative: f32 = 0.1;

// Корректировка весов
export function Correct(
  weight: Float32Array,
  vectors: Int32Array,
  neuronSum: i32,
  speedLearn: f32,
  number: bool
): Float32Array {
  let res: Float32Array = weight.slice();

  let error: f32;

  if (number) error = 1;
  else error = -1;

  let sigmoidDer = sigmoid_derivative(neuronSum as f32);

  for (let i = 0, arrLen = weight.length; i < arrLen; i++) {
    if (vectors[i] === 1) res[i] = weight[i] + speedLearn * error;
  }

  return res;
}

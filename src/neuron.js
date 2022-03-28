export class Neuron {
  weights = [];
  thresholdError = 0;
  speedLearn = 0;
  errors = 0;

  constructor(imagesRes, neuronNumber, thresholdError, speedLearn) {
    for (let i = 0; i < neuronNumber; i++) {
      let weightNeuron = [];
      for (let j = 0; j < imagesRes * imagesRes; j++) {
        let randomNumber = Math.random() * (0.31 + 0.31) - 0.31;
        weightNeuron.push(randomNumber);
      }
      this.weights.push(weightNeuron);
    }

    this.thresholdError = thresholdError;
    this.speedLearn = speedLearn;
  }

  // вычисление сигмоиды
  $sigmoid(sum) {
    return 1 / (1 + Math.exp(-sum));
  }

  // производная сигмоиды
  $sigmoid_derivative(sigmoid) {
    return sigmoid * (1 - sigmoid);
  }

  Predict(vector) {
    let neuronSums = [];

    for (let i = 0, neuronLen = this.weights.length; i < neuronLen; i++) {
      let sum = 0;
      for (
        let j = 0, weightsLen = this.weights[i].length;
        j < weightsLen;
        j++
      ) {
        sum += vector[j] * this.weights[i][j];
      }

      neuronSums.push(this.$sigmoid(sum));
    }

    return neuronSums;
  }

  Train(vector, correctAnswers) {
    let answer = this.Predict(vector);

    for (let i = 0, neuronLen = this.weights.length; i < neuronLen; i++) {
      let weightsDelta = correctAnswers[i] - answer[i];

      for (
        let j = 0, weightsLen = this.weights[i].length;
        j < weightsLen;
        j++
      ) {
        if (vector[j] === 1) {
          this.weights[i][j] += this.speedLearn * weightsDelta * vector[j];
        }
      }
    }
  }

  TrainDataset(vectorsAndAnswers) {
    for (let i = 0, arrLen = vectorsAndAnswers.length; i < arrLen; i++) {
      this.Train(vectorsAndAnswers[i].vector, vectorsAndAnswers[i].answer);
    }

    let correctCount = 0;

    for (let i = 0, arrLen = vectorsAndAnswers.length; i < arrLen; i++) {
      let neuronOutput = this.Predict(vectorsAndAnswers[i].vector);

      let sumError = 0;
      for (let j = 0, outputLen = neuronOutput.length; j < outputLen; j++) {
        const error = Math.pow(
          neuronOutput[j] - vectorsAndAnswers[i].answer[j],
          2
        );
        sumError += error;
      }

      if (sumError < this.thresholdError) correctCount++;
    }

    console.log(vectorsAndAnswers.length - correctCount + ' ошибок');

    this.errors += vectorsAndAnswers.length - correctCount;

    let correctPercent = (correctCount / vectorsAndAnswers.length) * 100;

    return correctPercent;
  }

  saveWeights() {
    const a = document.createElement('a');

    let data = JSON.stringify(this.weights);

    const file = new Blob([data], { type: 'application/json' });

    a.href = URL.createObjectURL(file);
    a.download = 'weights.json';
    a.click();

    URL.revokeObjectURL(a.href);
  }

  loadWeights(e) {
    const file = e.target.files[0];

    let reader = new FileReader();

    reader.readAsText(file);
    const contextNeuron = this;

    reader.onload = function () {
      let res = reader.result;

      contextNeuron.weights = JSON.parse(res);

      console.log('Загруженные веса:');
      console.log(contextNeuron.weights);
    };

    reader.onerror = function () {
      console.log(reader.error);
      return;
    };
  }
}

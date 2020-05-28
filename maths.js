var answer;
var score = 0;
var backgroundImages = [];

function nextQuestion() {
    const n1 = Math.floor(Math.random() * 5);
    document.getElementById('n1').innerHTML = n1;

    const n2 = Math.ceil(Math.random() * 5);
    document.getElementById('n2').innerHTML = n2;

    answer = n1 + n2;

}

function checkAnswer() {
    const prediction = predictImage();

    console.log(`Answer ${answer}, Prediction ${prediction}`)

    if (prediction == answer) {
        score++;
        console.log(`Correct. Score: ${score}`);
        if (score <= 6) {
            backgroundImages.push(`url('images/background${score}.svg')`)
            document.body.style.backgroundImage = backgroundImages;
        } else {
            alert('Well done! Your garden looks amazing. Want to play again?');
            score = 0;
            backgroundImages = [];
            document.body.style.backgroundImage = backgroundImages;
        }


    } else {
        if (score >= 1) {
            score--;
            alert('Opps! Check your calculation and try writing your answer neater next time.');
            setTimeout(function () {
                backgroundImages.pop(`url('images/background${score}.svg')`)
                document.body.style.backgroundImage = backgroundImages;
            }, 1000)
        }
        console.log(`Incorrect. Score: ${score}`);

    }
}
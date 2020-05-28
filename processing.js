var model;

async function loadModel() {
    
    model = await tf.loadGraphModel('model/model.json')

}

function predictImage() {

    //('Processing image...');

    let image = cv.imread(canvas);
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let cnt = contours.get(0);
    let rect = cv.boundingRect(cnt);
    image = image.roi(rect)

    var height = image.rows;
    var width = image.cols;

    if (height > width) {
        height = 20;
        const scaleFactor = image.rows / 20;

        width = Math.round(image.cols / scaleFactor);
    } else {
        width = 20;
        const scaleFactor = image.cols / 20;
        height = Math.round(image.rows / scaleFactor);
    }

    let newSize = new cv.Size(width, height);
    cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);

    const LEFT = Math.ceil(4 + ((20 - width) / 2));
    const RIGHT = Math.floor(4 + ((20 - width) / 2));
    const TOP = Math.ceil(4 + ((20 - height) / 2));
    const BOTTOM = Math.floor(4 + ((20 - height) / 2));

    const BLACK = new cv.Scalar(0, 0, 0, 255);
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    //console.log(`top = ${TOP}, bottom = ${BOTTOM}, left =${LEFT}, right=${RIGHT}`);

    //center of mass
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);

    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;

    //console.log(`M00 = ${Moments.m00}, cx= ${cx}, cy=${cy}`);


    //shift

    const X_SHIFT = Math.round(image.cols / 2.0 - cx);
    const Y_SHIFT = Math.round(image.rows / 2.0 - cy);

    let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    newSize = new cv.Size(image.rows, image.cols);
    // You can try more different parameters
    cv.warpAffine(image, image, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    //console.log(`After shift: M00 = ${Moments.m00}, cx= ${cx}, cy=${cy}`);

    //normalize pixels
    let pixelValues = image.data;
    // console.log(`pixel values : ${pixelValues}`);

    pixelValues = Float32Array.from(pixelValues);

    pixelValues = pixelValues.map(function(item){
        return item/255.0;
    });

    // console.log(`Scaled array: ${pixelValues}`);

    X = tf.tensor([pixelValues]);

    // console.log(`Shape of tensor: ${X.shape}`);
    // console.log(`Data type of tensor ${X.dtype}`);


    const pred = model.predict(X);
    pred.print();

    output = pred.dataSync()[0];


    //console.log(tf.memory());
    


    // //testing
    // const outputCanvas = document.createElement('CANVAS');
    // cv.imshow(outputCanvas, image);
    // document.body.appendChild(outputCanvas);


    //cleanup
    image.delete();
    contours.delete();
    cnt.delete();
    hierarchy.delete();
    M.delete();

    X.dispose();
    pred.dispose();

    return output;


}
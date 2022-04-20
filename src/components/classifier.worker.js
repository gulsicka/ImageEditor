import * as R from "ramda";


const workerCode = () => {
    // eslint-disable-next-line no-restricted-globals
    onmessage = (e) => {
      console.log('inside worker')
      // const img = e.data;
      //   var canvas = document.createElement('canvas');
      //   canvas.width = img.width;
      //   canvas.height = img.height;
      //   const context = canvas.getContext('2d');
      //   context.drawImage(img, 0, 0, img.width, img.height);
      const ctxValues = e.data;
      debugger;
        //var pixelData = context.getImageData(200, 200, 1, 1).data;
        //console.log('pixelData: ', pixelData[0])
    
        const xPixels = 1, yPixels = 1;
    
        let classArray = new Array(540/yPixels);
    
        for (var i = 0; i < classArray.length; i++) {
          classArray[i] = new Array(510/xPixels);
        }
        console.log('classArray: ', classArray)
    
        let label = 0;
    
        const checkValue = (row, col) => ctxValues[row][col] > [0, 0, 0, 0]
        //const getValue = (row, col) => R.values(context.getImageData(col, row, xPixels, yPixels).data);
        
        let classArrayRow = 0, classArrayCol = 0;
        for (let row = 0; row < 540; row+=xPixels) {
          for (let col = 0; col < 510; col+=yPixels) {
            if(label > 1) label = 1
            // for first column of a new row (except row zero)
            // where the current pixel is compared with the one above it
            if (col == 0 && row != 0) {
              if (checkValue(row, col)
              && ctxValues[row][col] == ctxValues[row - 1][col]) {
                classArray[classArrayRow][classArrayCol] = classArray[classArrayRow-1][classArrayCol];
              }
              else if (checkValue(row, col)
              && ctxValues[row][col] != ctxValues[row-1][col]) {
                classArray[classArrayRow][classArrayCol] = ++label;
              }
            }
            // for first row only where current pixel is only compared with left pixel
            else if (row == 0) {
              if (checkValue(row, col)
              && ctxValues[row][col] == ctxValues[row][col-1] ) {
                classArray[classArrayRow][classArrayCol] = classArray[classArrayRow][classArrayCol-1];
              }
              else if (checkValue(row, col)
              && ctxValues[row][col] != ctxValues[row][col-1]) {
                classArray[classArrayRow][classArrayCol] = ++label;
              }
              
            }
            // for rest of the rows
            else {
              // current pixel is equal to its left
              if (ctxValues[row][col] == ctxValues[row][col-1]
              && ctxValues[row][col] != ctxValues[row-1][col]) {
                classArray[classArrayRow][classArrayCol] = classArray[classArrayRow][classArrayCol-1]
              }
              else if (ctxValues[row][col] != ctxValues[row][col-1]
              && ctxValues[row][col] == ctxValues[row-1][col]) {
                classArray[classArrayRow][classArrayCol] = classArray[classArrayRow-1][classArrayCol]
              }
              else if (ctxValues[row][col] == ctxValues[row][col-1]
              && ctxValues[row][col] == ctxValues[row-1][col]
              && classArray[row][col-1] == classArray[row-1][col]) {
                classArray[classArrayRow][classArrayCol] = classArray[classArrayRow-1][classArrayCol]
              }
              else if (ctxValues[row][col] == ctxValues[row][col-1]
              && ctxValues[row][col] == ctxValues[row-1][col]
              && classArray[row][col-1] != classArray[row-1][col]) {
                classArray[classArrayRow][classArrayCol] = R.min(classArray[classArrayRow-1][classArrayCol], classArray[classArrayRow][classArrayCol-1])
              }
                  else if (ctxValues[row][col] != ctxValues[row][col-1]
              && ctxValues[row][col] != ctxValues[row-1][col]) {            
                classArray[classArrayRow][classArrayCol] = ++label;
              }
            }
            classArrayCol++;
          }
          classArrayRow++;
          classArrayCol = 0;
        }
  
        const data = {
          type: 'img',
          result: classArray
        }
        debugger;
  
      postMessage(JSON.parse(JSON.stringify(data)));
    };
  };

  let code = workerCode.toString();
  code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"));
  const blob = new Blob([code], {type: 'application/javascript'});
  const workerScript = URL.createObjectURL(blob);
 export default workerScript;
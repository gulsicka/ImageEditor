import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import jimp from "jimp";
import * as R from "ramda";
import { saveAs } from 'file-saver'
// import { PNG } from 'pngjs/browser';
// import logo from './noimg.jpg';


import { storeImage } from '../actions';
import '../index.css';
import workerScript from './classifier.worker';

const ImageEditor = ({image}) => {
  const imageRef = useRef(null);
  const [editedImage, setEditedImage] = useState(image);
  const [classArray, setClassArray] = useState([]);
  const [imageBrightness, setBrightness] = useState(0);
  const [imageOpacity, setOpacity] = useState(0);
  const dispatch = useDispatch();

  const uploadOnChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        dispatch(storeImage(URL.createObjectURL(event.target.files[0])));
    }
  };

  useEffect(() => setEditedImage(image), [image]);

  const downloadImage = () => {
    saveAs(editedImage, 'image.jpg') // Put your image url here.
  }

  const subtract = (list1, list2) => list1.map((x, i) => x - list2[i]);
  const worker = new Worker(workerScript);

  useEffect(() => {
    
    worker.addEventListener('message' , e => {
      if(e.data.type === 'img'){
        console.log('worker reply: ', e.data);
        setClassArray(e.data.result);
        createNewCanvas(e.data.result)
      }
    });
  }, [worker]);

  const createNewCanvas = (classArray) => {
    let xPixels = 1, yPixels = 1;
    var classifiedimage = document.createElement('canvas');
    classifiedimage.width = 510;
    classifiedimage.height = 540;
    let imageContext = classifiedimage.getContext('2d');

    let classArrayRow = 0; 
    let classArrayCol = 0;
    for (let row = 0; row < classifiedimage.height; row+=xPixels) {
      for (let col = 0; col < classifiedimage.width; col+=yPixels) {
        //deciding color
        if(classArray[classArrayRow][classArrayCol] === 1) {
          imageContext.strokeStyle = '#ffffff';
          imageContext.fillStyle = '#ffffff';
        }
        else {
          imageContext.strokeStyle = '#000000';
          imageContext.fillStyle = '#000000';
      }
        debugger;

        imageContext.fillRect(col, row, xPixels, yPixels)
        classArrayCol++;
      }
      classArrayRow++;
      classArrayCol = 0;
    }

    let mainDiv = document.getElementById("main-body");
    mainDiv.appendChild(classifiedimage);
  }

  const findImageAreas = () => {
    var img = document.getElementById('myimg');
    
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');


    
    context.drawImage(img, 0, 0, img.width, img.height);
    const xPixels = 1, yPixels = 1;

    let ctxValues = new Array(540/yPixels);
    const getValue = (row, col) => R.values(context.getImageData(col, row, xPixels, yPixels).data);
    
   for (var i = 0; i < ctxValues.length; i++) {
    ctxValues[i] = new Array(510/xPixels);
    }
    for (let row = 0; row < 540; row+=xPixels) {
      for (let col = 0; col < 510; col+=yPixels) {
        ctxValues[row][col] = getValue(row, col);
      }
    }
    const j = JSON.parse(JSON.stringify(ctxValues))

    debugger
    worker.postMessage(j);


    // creating result canvas below
    console.table('classArray: ', classArray)

    //creating canvas with classified image
    
  }

  const applyFilter = async (filterName, value = '') => {
    if(!!image){
      let toEdit = await jimp.read(editedImage);
      
      switch (filterName) {
        case 'greyScale':
          toEdit.greyscale();
          break;
        case 'horFlip':
          toEdit.flip( true, false );  
          break;
        case 'verFlip':
          toEdit.flip( false, true );  
          break;
        case 'invert':
          toEdit.invert();  
          break;
        case 'normalize':
          toEdit.normalize();  
          break;
        case 'brighten':
          toEdit.brightness(value);
          break;
        case 'opacity':
          toEdit.opacity(value);
          break;
        case 'revert':
          toEdit = await jimp.read(image);
          break;
        default:
          break;
      }

      const base64Img = await toEdit.getBase64Async(jimp.AUTO);
      setEditedImage(base64Img);
    }
  }

  const onChangeRange = (e) => {
		e.preventDefault();
		const name = e.target.getAttribute('name');
		const value = Number(e.target.value);
    
    switch (name) {
      case 'brightness':
        setBrightness(value);
        applyFilter('brighten', value);
        break;
      case 'opacity':
        setOpacity(value);
        applyFilter('opacity', value);
        break;
      default:
        break;
    }
		
	}

  return (
    <div className="main-body" id="main-body">
      <h1 className='app-title'>Image Editor</h1>
      <div className="editor-body" id='editor-body'>
        {!!editedImage ? <img
          alt="to-edit"
          className='image-to-edit'
          src={editedImage}
          id="myimg"
          //pixelate="5"
          // mirror="true, false"
          // greyscale
          // color={[{apply: "hue", params: [-90]}]}
        //sloadBlur
        />
        : <div className="empty-image"/>
      }
        <div className='editing-panel'>
          <input
            className='upload-image' 
            ref={imageRef} 
            type="file" 
            name="upload-image" 
            onChange={uploadOnChange}/>
          <button className='basic-button' onClick={() => applyFilter('greyScale')}>Grey Scale</button>
          <button className='basic-button' onClick={() => applyFilter('horFlip')}>Horizontal Flip</button>
          <button className='basic-button' onClick={() => applyFilter('verFlip')}>Verticle Flip</button>
          <button className='basic-button' onClick={() => applyFilter('normalize')}>Normalize</button>
          <button className='basic-button' onClick={() => applyFilter('invert')}>Invert</button>
          <label>Brightness</label>
          <input id="brightness"
		    				name="brightness"
		    				onChange={onChangeRange}
		    				type="range"
		    				min="-1"
		    				step="0.01"
		    				max="1"
		    				value={imageBrightness} 
		    			/>
          <label>Opacity</label>
          <input id="opacity"
		    				name="opacity"
		    				onChange={onChangeRange}
		    				type="range"
		    				min="0"
		    				step="0.01"
		    				max="1"
		    				value={imageOpacity} 
		    			/>
          <button className='basic-button' onClick={() => applyFilter('revert')}>Revert Changes</button>
          <button className='basic-button' onClick={() => findImageAreas()}>Classify Image</button>
          <button className='basic-button' onClick={() => downloadImage()}>Download image</button>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    image: state.image,
  };
};

export default connect(mapStateToProps)(ImageEditor);

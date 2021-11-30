import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import jimp from "jimp";
import { Jimage } from "react-jimp";
import { saveAs } from 'file-saver'


import { storeImage } from '../actions';
import '../index.css';

const ImageEditor = ({image}) => {
  const imageRef = useRef(null);
  const [editedImage, setEditedImage] = useState(image);
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

  const applyFilter = async (filterName, value = '') => {
    if(!!image){
      const toEdit = await jimp.read(editedImage);
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
        default:
          break;
      }

      
      const a = await toEdit.getBase64Async(jimp.AUTO);

      // var byteString = atob(a.split(',')[1]);
      // var imageAb = new ArrayBuffer(byteString.length);
      // const imgBlob =  new Blob([imageAb], { type: 'image/jpeg' });;
      
      // const url = URL.createObjectURL(imgBlob);
      setEditedImage(a);
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
    <div className="main-body">
      <h1 className='app-title'>Image Editor</h1>
      <div className="editor-body">
        {!!editedImage ? <img
          alt="to-edit"
          className='image-to-edit'
          src={editedImage}
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

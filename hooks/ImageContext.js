import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ImageContext = createContext();

export const useImages = () => {
  return useContext(ImageContext);
};

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3001/photos');
      setImages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addImage = (newImage) => {
    setImages((prevImages) => [newImage, ...prevImages]);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <ImageContext.Provider value={{ images, fetchImages, addImage }}>
      {children}
    </ImageContext.Provider>
  );
};
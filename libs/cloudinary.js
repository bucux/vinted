

const cloudinary = require("cloudinary").v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const convertToBase64 = (file) => { //data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAACKCAYAAADi+rbsE2RQU
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
}

const callback = (error, result) => {
  if (error) { console.log("Erreur lors du téléchargement : ", error)} 
  else { console.log("Résultat du téléchargement : ", result)}
}

const cloudinaryUp = (picture, path) => {
  const options = { folder: path}
  return cloudinary.uploader.upload(convertToBase64(picture), options, callback);
}

module.exports = cloudinaryUp
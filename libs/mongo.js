

let mongooseInstance = null;

const mongoSingleton = () => {
  if (!mongooseInstance) {
    const mongoose = require('mongoose');
    mongoose.connect('mongodb://127.0.0.1/vinteddb').then(() => {
      console.log('Connexion à MongoDB réussie.');
    }).catch((err) => {
      console.error('Erreur de connexion à MongoDB:', err);
    });
    mongooseInstance = mongoose;
  }
  return mongooseInstance;
};

module.exports = mongoSingleton();
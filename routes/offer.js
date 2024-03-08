

const express = require('express')
const fileUpload = require("express-fileupload")
const Offer = require('../models/Offer')
const isAuthenticated = require('../middles/auth')
const cloudinaryUp = require('../libs/cloudinary')

const routerOffer = express.Router()

routerOffer.get('/offer', async (req, res) => {
  try {
    let {title, priceMin, priceMax, sort, page} = req.query;
    const limit = 20; // Nombre max d'articles par page
    title = title ? title : '.*'; // Regex permettant tous les matching si title est undefined
    priceMin = priceMin ? Number(priceMin) : 0; // Si priceMin est undefined, il sera égal à 0
    priceMax = priceMax ? Number(priceMax) : 1000000; // Si priceMax est undefined, il sera inatteignable
    page = page ? Number(page) : 0; // Si page non défini, afficher la première
    let query = Offer.find({ // on définit la requête, sans l'éxécuter
      product_name: new RegExp(title, "i"), 
      product_price: {$gte: priceMin, $lte: priceMax},
    });
    if (sort) { // on enrichit la requête d'un éventuel tri, mais toujours sans l'exécuter
      if (sort === 'price-desc') { query = query.sort({product_price: -1})} 
      else if (sort === 'price-asc') { query = query.sort({product_price: 1})}
    }
    query = query.skip(limit * page).limit(limit); // on enrichit la requête d'une pagination, toujours sans l'exécuter
    const offers = await query; // on éxécute enfin la requête
    if (offers.length > 0) { res.status(200).json({count: offers.length, offers})} 
    else { res.status(404).json({message: "Aucune offre trouvée"}) }
  } catch (error) { res.status(500).json({message: error.message}) }
})

routerOffer.post('/offer/publish', isAuthenticated, fileUpload(), async (req, res) => {
  try{
    const {title, description, price, condition, city, brand, size, color} = req.body
    if (!req.files || !req.files.picture) { // si l'image est manquante, retourner une erreur
      return res.status(400).json({ message: "L'image est requise" });
    }
    const picture = req.files.picture
    const avatarSecureUrl = req.user.avatar ? req.user.avatar.secure_url : ''
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {MARQUE: brand},
        {TAILLE: size},
        {ETAT: condition},
        {COULEUR: color},
        {EMPLACEMENT: city}
      ],
      owner: {
        _id: req.user._id,
        account: {
          username: req.user.username,
          avatar: { secure_url: avatarSecureUrl }
        }
      },
      product_image:{ secure_url: '' } // on ne connait pas encore le chemin de l'image
    })
    await newOffer.save() // on enregistre une première fois pour obtenir l'id de l'offre
    const cloudResponse = await cloudinaryUp(picture, 'vinted/offers/' + newOffer._id) // on sauvegarde l'image sur le cloud, dans un chemin qui inclus l'id de l'offre
    newOffer.product_image = cloudResponse // cloudResponse est un objet qui contient notamment la cle sécure_url qui nous interesse
    await newOffer.save() // on sauvegarde une seconde fois l'offre, qui inclut à présent l'url de l'image
    res.status(200).json(newOffer)
  }catch (error){res.status(500).json({message: error.message})}
})

routerOffer.get('/offer/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: 'owner',
      select: 'account.username account.avatar' 
    });
    if(offer){
      res.status(200).json(offer) 
    } else {res.status(400).json({error: "Aucune offre ne correspond à cet id."})}
  }catch (error){res.status(500).json({message: error.message})}
})

module.exports = routerOffer
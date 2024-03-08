
const express = require('express')
const cors = require('cors')
const app = express() // cette ligne doit être placée avant les requires des routes, car fileUpload dans offer.js ferait planter le serveur

const routerUser = require('./routes/user')
const routerOffer = require('./routes/offer')

app.use(cors())
app.use(express.json())
app.use(routerUser)
app.use(routerOffer)

app.all('*', (req, res)=>{
  res.status(404).json({message: 'page inexistante'})
})

app.listen(3000, ()=>{console.log('server ok sur port 3000')})

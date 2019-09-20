const keys = require('../config/keys')
const stripe = require('stripe')(keys.stripeSecretKey)
const requireLogin = require('../middlewares/requireLogin')
const db = require('../services/mongoUtil').getDB()
const user = require('../services/user');
const usersCollection = db.collection('users')

module.exports = app => {
  app.post('/api/stripe', async (req, res) => {
  // app.post('/api/stripe', requireLogin, async (req, res) => {
    const charge = await stripe.charges.create({
      amount: 500,
      currency: 'usd',
      description: '$5 for 5 credits',
      source: req.body.id
    })

    user.credits += 5;
    // req.user.credits += 5;

    usersCollection.updateOne(
      {googleId: req.user.googleId},
      {$set: {credits: req.user.credits}},
      (err, obj) => {
      if (err) console.error(err)
    })

    res.send(req.user)
  })
}
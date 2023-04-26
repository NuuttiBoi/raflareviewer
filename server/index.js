'use strict';

const express = require('express')
const app = express()
const Restaurant = require('./models/restaurant')
const Comment = require('./models/comment');
const User = require('./models/user')
const session = require('express-session')
const {request, response} = require("express");
const {requireAuth} = require('./models/authentication')

app.use(express.json())

// Tällä katotaan onko käyttäjä kirjautunut sisään
app.use(session ({
    secret: "7g1klpLLmAkdad031Sf", //Avain
    resave: false,
    saveUninitialized: false
}))

/* CORS ongelman korjaamiseen */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', (request, response) => {
    response.send('(^ _ ^)/')
})


// Ravintolat

// Hakee kaikki ravintolat
app.get('/restaurants', (request, response) => {
    Restaurant.find({}).then(restaurants => {
        response.json(restaurants)
    })
})

// Ravintolan tallennus
app.post('/restaurants', (request, response) => {
    const body = request.body

    /* if (body.name === undefined) {
        return response.status(400).json({ error: 'content missing' })
    } */

    // Tallennettavan rivin "konstruktori"
    const restaurant = new Restaurant({
        name: body.name,
        address: body.address,
        foodScore: body.foodScore,
        qualityPriceScore: body.qualityPriceScore,
        experienceScore: body.experienceScore,
        tags: body.tags
    })

    // Tallennus tietokantaan
    restaurant.save().then(savedRestaurant => {
        console.log('saved to db')
        response.json(savedRestaurant)
    })
})

// Hakee yksittäisen ravintolan
app.get('/restaurants/:id', (request, response) => {
    Restaurant.findById(request.params.id).then(restaurant => {
      response.json(restaurant)
    })
})

app.get('/restaurants/comment/:comment', (request, response) => {
    Restaurant.find({ comment: request.params.comment} ).then(restaurant => {
      response.json(restaurant)
    })
})


// Kommentit

// Hakee kaikki kommentit
app.get('/comments', (request, response) => {
    Comment.find({}).then(comments => {
        response.json(comments)
    })
})

app.post('/comments', (request, response) => {
    const body = request.body

    const comment = new Comment({
        restaurantId: body.restaurantId,
        userId: body.userId,
        content: body.content,
        date: new Date()
    })

    comment.save().then(savedComment => {
        console.log('comment saved to db')
        response.json(savedComment)
    })
})

// Hakee yksittäisen kommentin
app.get('/comments/:id', (request, response) => {
    Comment.findById(request.params.id).then(comment => {
      response.json(comment)
    })
})

// Hakee kaikki ravintolan kommentit
app.get('/comments/restaurantId/:restaurantId', (request, response) => {
    Comment.find({ restaurantId: request.params.restaurantId } ).then(comments => {
      response.json(comments)
    })
})

// Kommentin poistaminen
app.delete('/comments/:id', (request, response, next) => {
    Comment.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

// Käyttäjän rekisteröinti ja kirjautuminen
app.post('/users', async (request, response) => {
    try {
        const { username, firstname, lastname, password } = request.body
        const existingUser = await User.findOne({username})
        if (existingUser){
            return response.status(409).json({message: "Username taken"})
        }

        const user = new User({username, firstname, lastname, password})
        await user.save()
        request.session.user = user // Käyttäjä sessioon
        response.status(201).json({message: "User made successfully"})
    } catch (error) {
        response.status(500).json({message: error.message})
    }
})

app.post('/login', async (request, response) => {
    try {
        const { username, password} = request.body
        const user = await User.findOne({username})
        if (!user) {
            return response.status(401).json({message: "Wrong username or password"})
        }

        const passwordCorrect = await user.comparePassword(password)
        if (!passwordCorrect) {
            return response.status(401).json({message: "Wrong username or password"})
        }

        request.session.user = user
        response.status(200).json({message: "Login successful"})
    } catch (error) {
        response.status(500).json({message: error.message})
    }
})

app.get('/users', (request,response) => {
    User.find({}).then(users => {
        response.json(users)
    })
})

app.get('/login', (request,response) => {

    User.find({}).then(users => {
        response.json(users)
    })
})

app.get('/profile', requireAuth,async (request, response) => {
    try {
        const user = request.session.user
        const userData = await User.findOne({ _id: user._id }, { password: 0 })
        response.json(userData)
    } catch (error) {
        response.status(500).json({message: error.message})
    }
})

app.listen(3001)
console.log('Server running on port 3001')

// npm run server reviewer

// node index.js reviewer <- yhdistää vaan db:een
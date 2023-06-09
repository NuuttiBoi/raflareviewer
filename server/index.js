'use strict';
require('dotenv').config()
const express = require('express')
const app = express()
const Restaurant = require('./models/restaurant')
const Comment = require('./models/comment');
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const jwtSecret = "avain";
const {request, response} = require("express");
const {requireAuth} = require('./models/authentication')
const session = require('express-session')

app.use(express.json())

/**
 * Käyttäjän sessio.
 */
app.use(session ({
    secret: 'jkeakuj31jhJ2LHJ2jhk',
    resave: false,
    saveUninitialized: true
}))

/**
 * Middleware funktio, joka asetta HTTP-otsikot.
 */
/* CORS ongelman korjaamiseen */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

/**
 * GET - Hakee pääsivun.
 */
/* / ja /api vievät pääsivulle */
app.get('/', (request, response) => {
    response.render('index.ejs');
})

/**
 * GET - Hakee pääsivun.
 */
app.get('/api', (request, response) => {
    response.render('index.ejs');
})

/**
 * GET - Hakee ravintolat, käyttäjät ja kommentit.
 */
/* v1 (ravintolat, käyttäjät, kommentit) */
app.get('/api/v1', (request, response) => {
    response.render('api_v1.ejs');
})

// Ravintolat

/**
 * GET - Hakee kaikki ravintolat.
 */
// Hakee kaikki ravintolat
app.get('/api/v1/restaurants', (request, response) => {
    Restaurant.find({}).then(restaurants => {
        response.json(restaurants)
    })
})

/**
 * POST - Tallentaa ravintolan.
 */
// Ravintolan tallennus
app.post('/api/v1/restaurants', (request, response) => {
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
        tags: body.tags,
        thumbsUp: [],
        thumbsDown: [],
        image: body.image,
        userId: body.userId
    })

    // Tallennus tietokantaan
    restaurant.save().then(savedRestaurant => {
        console.log('saved to db')
        response.json(savedRestaurant)
    })
})

/**
 * GET - Hakee yksittäisen ravintolan sen ID:n avulla.
 */
// Hakee yksittäisen ravintolan
app.get('/api/v1/restaurants/:id', (request, response) => {
    Restaurant.findById(request.params.id).then(restaurant => {
      response.json(restaurant)
    })
})

/**
 * GET - Hakee ravintolan kommentit.
 */
// Hakee kaikki ravintolan kommentit
app.get('/api/v1/restaurants/comment/:comment', (request, response) => {
    Restaurant.find({ comment: request.params.comment} ).then(restaurant => {
      response.json(restaurant)
    })
})

// Ravintolan muokkaus

/**
 * PATCH - Muokkaa ravintolan tietoja sen ID:n avulla.
 */
app.patch('/api/v1/restaurants/:id', (request, response, next) => {
    const body = request.body
    const thumbs = {
      thumbsUp: body.thumbsUp,
      thumbsDown: body.thumbsDown
    }
  
    Restaurant.findByIdAndUpdate(request.params.id, thumbs)
      .then(updatedRes => {
        response.json(updatedRes)
      })
      .catch(error => next(error))
  })

/**
 * DELETE - Poistaa ravintolan sen ID:n avulla.
 */
  // Ravintolan poistaminen
app.delete('/api/v1/restaurants/:id', (request, response, next) => {
    Restaurant.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

// Kommentit

/**
 * GET - Hakee kaikki kommentit.
 */
// Hakee kaikki kommentit
app.get('/api/v1/comments', (request, response) => {
    Comment.find({}).then(comments => {
        response.json(comments)
    })
})

/**
 * POST - Luo kommentin.
 */
app.post('/api/v1/comments', (request, response) => {
    const body = request.body

    const comment = new Comment({
        restaurantId: body.restaurantId,
        userId: body.userId,
        username: body.username,
        content: body.content
    })

    comment.save().then(savedComment => {
        console.log('comment saved to db')
        response.json(savedComment)
    })
})

/**
 * GET - Hakee yksittäisen kommentin sen ID:n avulla.
 */
// Hakee yksittäisen kommentin
app.get('/api/v1/comments/:id', (request, response) => {
    Comment.findById(request.params.id).then(comment => {
      response.json(comment)
    })
})

/**
 * GET - Hakee ravintolan kommentit sen ID:llä.
 */
// Hakee kaikki ravintolan kommentit
app.get('/api/v1/comments/restaurant/:restaurantId', (request, response) => {
    Comment.find({ restaurantId: request.params.restaurantId } ).then(comments => {
      response.json(comments)
    })
})

/**
 * DELETE - Poistaa tietyn kommentin ID:llä.
 */
// Kommentin poistaminen
app.delete('/api/v1/comments/:id', (request, response, next) => {
    Comment.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

/**
 * DELETE - Poistaa ravintolan kommentit sen ID:en avulla.
 */
// Poistaa kaikki ravintolan kommentit
app.delete('/api/v1/comments/restaurant/:restaurantId', (request, response) => {
    Comment.deleteMany({ restaurantId: request.params.restaurantId } ).then(result => {
        response.status(204).end()
    })
})

// Käyttäjän rekisteröinti ja kirjautuminen
/**
 * POST - Tekee uuden käyttäjän.
 */
app.post('/users', async (request, response) => {
    try {
        const { username, password, firstname, lastname } = request.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return response.status(409).json({ message: "Username taken" });
        }

        const user = new User({ username, password, firstname, lastname });
        await user.save();
        const token = jwt.sign({ userId: user._id }, jwtSecret);

        response.status(201).json({ token: token});
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
})

/**
 * POST - Kirjaa käyttäjän sisään.
 */
app.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;
        const user = await User.findOne({ username });
        if (!user) {
            return response.status(401).json({ message: "Wrong username or password" });
        }

        const passwordCorrect = await user.comparePassword(password);
        if (!passwordCorrect) {
            return response.status(401).json({ message: "Wrong username or password" });
        }

        request.session.userId = user._id

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        response.json({token: token})
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
})

/**
 * PUT - Muuttaa käyttäjän tietoja ID:en avulla.
 */
app.put('/users/:id', requireAuth ,async (request, response) => {
    const userId = request.params.id
    const { firstname, lastname, oldPassword, newPassword} = request.body

    try {
        const user = await User.findById(userId)
        if (!user) {
            return response.status(404).json({ message: 'User not found' })
        }
        if (firstname) {
            user.firstname = firstname
        }

        if (lastname) {
            user.lastname = lastname
        }

        if (oldPassword && newPassword) {
            const passwordMatch = await user.comparePassword(oldPassword)

            if (!passwordMatch) {
                return response.status(401).json({ message: 'Old password is incorrect' })
            }

            user.password = newPassword;
        }

        await user.save()
        console.log(user)
        response.json({ message: 'User updated successfully' })
    } catch (error) {
        response.status(500).json({ message: error.message })
    }
})

/**
 * GET - Hakee käyttäjät.
 */
app.get('/users', async (request,response) => {
    try {
        const users = await User.find({});
        response.json(users);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
})

/**
 * GET - Hakee kirjautuneet.
 */
app.get('/login', (request,response) => {

    User.find({}).then(users => {
        response.json(users)
    })
})

/**
 * GET - Hakee käyttäjän tiedot, jos käyttäjä on todennettu.
 */
app.get('/profile',requireAuth, async (request, response) => {
    try {
        const user = request.user;
        const userData = await User.findOne({ username: user.username }, { password: 0 });

        response.json(userData);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
})

/**
 * POST - Kirjaa käyttäjän ulos.
 */
app.post('/logout', (request, response) => {
    request.session.destroy()
    response.json({ message: 'Logged out' });
})

/**
 * DELETE - Poistaa käyttäjän kirjautuneista ID:en avulla
 */
app.delete('/login/:id', async (request, response) => {
    User.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

/**
 * GET - Hakee tietyn käyttäjän ID:llä.
 */
app.get('/users/:id', (request, response) => {
    User.findById(request.params.id).then(user => {
      response.json(user)
    })
})

const PORT = process.env.DB_PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
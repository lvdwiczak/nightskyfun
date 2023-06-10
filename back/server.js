import express from 'express'
import cors from 'cors'
import { deleteStar, getStars, insertStar } from './dbHandler.js'
import settings from './settings.json' assert {type: 'json'}

const app = express()
const port = settings.serverPort;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Express API template' })
})

app.get('/stars', (req, res) => {
    getStars().then((starsList) => {
        res.status(200).json({ stars: starsList })
    }).catch(() => {
        res.status(500).json({ message: "I don't know what happened."})
    })
})

app.post('/stars', (req, res) => {
    console.log('insert star req', req.body)
    insertStar(req.body).then((insertRes) => {
        res.status(200).json({ id: JSON.stringify(insertRes.insertedId)})
    }).catch(()=>{
        res.status(500).json({ message: "I don't know what happened."})
    })
})

app.delete('/stars', (req, res) => {
    console.log('delete star req', req.query)
    deleteStar(req.query.id).then(() => {
        res.status(200).json({ star: req.query})
    }).catch(()=>{
        res.status(500).json({ message: "I don't know what happened."})
    })
})

app.listen(port, () => {
    console.log(`Server started on port: http://localhost:${port}`)
})

const express = require('express')

console.log('Creating express app')
const app = express()

app.get('/', (req, res) => {
    console.log('GET /')
    res.send('Hello World')
})

app.listen(3001)
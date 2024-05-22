

const redis = require('redis');
const express = require('express');
const cors = require('cors');

const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();
const app = express();
const port = 3001;

const options = {
    origin: 'http://localhost:3000'
};

app.use(cors(options));


// Handle errors (optional)
redisClient.on('error', err => {
    console.log('Redis Client Error', err);
});

async function main() {

let shoes = [
    { shoeId: 1, brand: 'Nike', model: 'Air Max 90', size: 10 },
    { shoeId: 2, brand: 'Adidas', model: 'Ultra Boost', size: 9 },
    { shoeId: 3, brand: 'New Balance', model: '990v5', size: 10 }
];
shoes.forEach(shoe => {
    redisClient.set(`shoe:${shoe.shoeId}`, JSON.stringify(shoe));
});
//redisClient.quit();
}

main().catch(console.error);

app.get('/', (req, res) => {
    res.send('Hello World!')
    });
  
app.get('/shoes', async (req, res) => {
    let shoey = await redisClient.get('shoe:1')
    //res.send(shoey)
    res.json(JSON.parse(shoey).model)
    });
    
app.post('/shoes', async (req, res) => {
    console.log('POST /shoes')
    const shoey = await redisClient.set('shoe:4', JSON.stringify({ shoeId: 4, brand: 'IDK', model: 'The Deep End', size: 12 }))
    res.send(shoey)
    });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });
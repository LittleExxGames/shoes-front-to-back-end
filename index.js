const redis = require('redis');
const host = process.env.REDIS_HOST || 'localhost';
const port = process.env.REDIS_PORT || 6379;
const redisClient = redis.createClient({
    url: `redis://${host}:${port}`
});
//const redisClient = redis.createClient();
const express = require('express');
const cors = require('cors');

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();
const app = express();

const options = {
    origin: 'http://localhost:3000'
};

app.use(cors(options));
app.use(express.json());

// Handle errors (optional) 
redisClient.on('error', err => {
    console.log('Redis Client Error', err);
});

app.get('/shoes/:shoeId', async (req, res) => {
    const shoeId = req.params.shoeId;
    try {
        const shoe = await redisClient.json.get(`shoe:${shoeId}`);
        if (shoe) {
            res.json({ success: true, data: shoe });
        } else {
            res.status(404).json({ success: false, message: 'Shoe not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error performing search' });
    }
});
app.get('/shoes', async (req, res) => {
    let shoes = [];
    try {
        let start = parseInt(req.query.start, 10) || 1;
        let limit = parseInt(req.query.limit, 10);
        start = Math.max(start, 1);
        if (!limit) 
        {
            let count = start;
            while (true)
            {
                const shoe = await redisClient.json.get(`shoe:${count}`);
                if (shoe) 
                {
                shoes.push(shoe);
                }
                else
                {
                    res.json({ success: true, data: shoes });
                    return;
                }
            count++;
            }
        }
        else
        {
            limit = Math.max(limit, 1);
            if (start)
            {
                for (let i = start - 1; i < start + limit - 1; i++)
                {
                    const shoe = await redisClient.json.get(`shoe:${i}`);
                    if (shoe) 
                    {
                        shoes.push(shoe);
                    }
                    else
                    {
                        res.json({ success: true, data: shoes });
                        return;
                    }
                }
                res.json({ success: true, data: shoes });
                return;
            }
            else
            {
                for (i = 0; i < limit - 1; i++) 
                {
                    const shoe = await redisClient.json.get(`shoe:${i}`);
                    if (shoe) 
                    {
                        shoes.push(shoe);
                    }
                    else
                    {
                        res.json({ success: true, data: shoes });
                        return;
                    }
                }
                res.json({ success: true, data: shoes });
                    return;
            }
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error performing search' });
    }
});

app.post('/shoes', async (req, res) => {
    console.log('POST /shoes')
    const shoeData = req.body;
    const shoeId = await redisClient.incr('lastShoeId');
    shoeData.shoeId = shoeId;
    const shoey = await redisClient.json.set(`shoe:${shoeId}`, '.', shoeData);
    res.json(shoey)
});



app.listen(3001, () => {
    console.log(`Example app listening on port ${3001}`);
});
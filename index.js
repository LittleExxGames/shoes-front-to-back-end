
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


async function createIndex() {
    try {
        //let response = await redisClient.flushAll();
            await redisClient.sendCommand(['FT.CREATE', 'idx:shoes', 'ON', 'JSON', 'SCHEMA', 
                '$.shoeId', 'AS', 'shoeId', 'NUMERIC', 
                '$.brand', 'AS', 'brand', 'TEXT', 
                '$.model', 'AS', 'model', 'TEXT', 
                '$.size', 'AS', 'size', 'NUMERIC']);
    } catch (e) {
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        } else {
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
            process.exit(1);
        }
    }
}

async function main() {

    let shoes = [
        { shoeId: 1, brand: 'Nike', model: 'Air Max 90', size: 10 },
        { shoeId: 2, brand: 'Adidas', model: 'Ultra Boost', size: 9 },
        { shoeId: 3, brand: 'New Balance', model: '990v5', size: 10 }
    ];
    for (let shoe of shoes) {
        try {
            await redisClient.json.set(`shoe:${shoe.shoeId}`, '.', shoe);
        } catch (e) {
            console.error(`Failed to set shoe ${shoe.shoeId}:`, e);
        }
    }
    createIndex();
    //redisClient.quit();
}

main().catch(console.error);

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/search', async (req, res) => {
    let searchQuery = '';
    for (const key in req.query) {
        if (isNaN(req.query[key])) 
        {
            searchQuery += `@${key}:${req.query[key]} `;
        }
        else
        {
            searchQuery += `@${key}:[${req.query[key]}, ${req.query[key]}] `;
        }
    }
    try {
        console.log(searchQuery);
        let result = await redisClient.sendCommand(['FT.SEARCH', 'idx:shoes', searchQuery.trim(), 'LIMIT', '0', '100']);
        if (result[0] === 0)
        {
            res.json({ success: false, message: 'No results found' });
        }
        else
        {
            let searchResults = [];
            for (let i = 1; i <= result[0]; i++)
            {
                searchResults.push(result[i*2][1]);
                console.log(result[i*2][1]);
            }
                res.json({ success: true, data: searchResults });
        }
        //console.log(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error performing search' });
    }

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
            let count = start - 1;
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
                let to = limit - 1 + start - 1;
                for (let i = start - 1; i <= to; i++)
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
                for (i = 0; i <= limit - 1; i++) 
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
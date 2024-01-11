const redis = require('redis');

// Require the framework and instantiate it

// CommonJs
const fastify = require('fastify')({
    logger: true
});
const cors = require('@fastify/cors');

fastify.register(cors, {
    origin: '*'
})

fastify.register(require('@fastify/mysql'), {
    connectionString: 'mysql://root:root@localhost:3306/ynov_app'
});

const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
    password: 'root'
});

redisClient.connect().then(() => {
    console.log("redis conencted")
}).catch(err => console.log(err));

const listener = async (message, channel) => {
    try {
        await redisClient.set('articles', message);
    }
    catch (err) {
        console.log(err)
    }
};

redisClient.subscribe('c-articles', listener);

// Declare a route
fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' })
})


fastify.get('/api/search', function (req, reply) {
    fastify.mysql.query(
        'SELECT * FROM Articles WHERE title LIKE ?', [`%${req.query.string}%`],
        function onResult(err, result) {
            reply.send(err || result)
        }
    )
})

// Run the server!
fastify.listen({ port: 3131, host: '0.0.0.0' }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})
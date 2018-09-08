'use strict'

require('pino-pretty')

const fastify = require('fastify')({
  https: true,
  logger: {
    prettyPrint: true,
    level: 'trace'
  }
})

const fjwt = require('fastify-jwt-webapp')
const aclFactory = require('fastify-acl-auth')

const config = require('./config')

async function main() {
  // just local TLS
  await fastify.register(require('fastify-tls-keygen'))

  //register fastify-jwt-webapp for authentication
  await fastify.register(fjwt, config.fjwt)

  // a homepage with a login link
  fastify.get('/', async function (req, reply) {
    reply
      .type('text/html')
      .send('<a href="/login">Click here to log-in</a>')
  })

  // a protected route that will simply display one's credentials, note that there is no _authorization_ on this route,
  // anybody who is "logged-in" can access it
  fastify.get('/credentials', async function (req, reply) {
    reply.send({
      credentials: req.credentials
    })
  })

  // create an acl that represents some arbitrary grouping, here it's "admins"
  const adminAcl = aclFactory({
    allowedRoles: async function(req) {
      // this method will have full access to req.credentials, so you can look up roles here!
      return req.credentials.sub
    },
    actualRoles: async function (req) {
      // this method will have full access to req.credentials, so you can look up roles here TOO!
      // this setup, allowedRoles returning the same thing as actualRoles, basically
      // means "you are the only one that is allowed, whoever you are", not practical, but illustrative
      return req.credentials.sub
    }
  })

  // register fastify-acl-auth in a fastify scope, so only routes in that scope will use the created acl (adminAcl)
  fastify.register(function (fastifyScope, opts, next) {
    fastifyScope.register(adminAcl)
    // an admin route
    fastifyScope.get('/admin', async function (req, reply) {
      reply.send({
        credentials: req.credentials
      })
    })
    next()
  })

  await fastify.listen(8443, 'localhost')
}

main()
  .catch(function (err) {
    console.error(err.message)
  })
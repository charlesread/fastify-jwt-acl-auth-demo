# About

This is a demonstration of a "full-blown" stateless [_fastify_]()-based web application using  [_fastify-jwt-webapp_]() (used for authentication), and [_fastify-acl-auth_]() (used for authorization).

Here we use auth0 as our IdP, and by setting the return values of _fastify-acl-auth_'s `allowedRoles` and `actualRoles` equal to one another we achieve a very impractical setup that whoever is logged-in is able to access an "admin" route.

```bash
npm i
node index.js
```

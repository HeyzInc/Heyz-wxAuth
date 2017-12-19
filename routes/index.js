const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/MP_verify_sEH8kHKww7ewzYAl.txt', async (ctx, next) => {
  ctx.body = 'sEH8kHKww7ewzYAl'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router

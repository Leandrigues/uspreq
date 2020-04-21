import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
// import {} from 'koa-cors';

import { db } from './db';

const app: Koa = new Koa();

app.context.db = db;

app.use(bodyparser());
app.use(logger());
app.use(json());

const router: Router = new Router();

router.get('/', (ctx) => {
  ctx.body = { msg: 'Hello, world!' };
});

router.get('/cars', async (ctx) => {
  const { db }: any = ctx;

  try {
    const cars = await db.from('cars').select('*');

    ctx.body = { cars };
  } catch (error) {
    ctx.body = { error };
  }
});

router.post('/cars', async (ctx) => {
  const {
    db,
    request: {
      body: { car },
    },
  }: any = ctx;

  try {
    const ret = await db('cars').insert(car);

    ctx.body = { returned: ret };
  } catch (error) {
    ctx.body = { error };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('server running');
});

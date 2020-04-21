import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
// import {} from 'koa-cors';

const app: Koa = new Koa();

app.use(bodyparser());
app.use(logger());
app.use(json());

const router: Router = new Router();

router.get('/', ctx => {
    ctx.body = { msg: 'Hello, world!' };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log('server running');
});

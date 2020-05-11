import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
import { Client } from 'pg';

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

async function initializeDB() {
  try {
    await client.connect();
    console.log('Database is running');
  } catch(e) {
    console.log(e);
  }
}

const app: Koa = new Koa();

app.use(bodyparser());
app.use(logger());
app.use(json());

const router: Router = new Router();

// const subject1 = {
  //   cod: 'ED2',
  //   pre: 'ED1',
  // };
  
  // const subject2 = {
//   cod: 'ED1',
//   pre: 'Intro',
// };

// const subjects = [subject1, subject2];

// const f = (subjectCod: any, a: any) => {
  //   let i: number = 0;
  //   while (i < 2 && subjects[i].cod != subjectCod) {
    //     i++;
    //   }
    //   if (i != 2) {
      //     a.push(subjects[i].pre);
//     f(subjects[i].pre, a); // arrumar pra varios pre requesitos
//   }
// };

router.get('/requisitos', ctx => {
  const { db } : any = ctx;
  const term = ctx.query.term;
  ctx.body = { db };
  // let a: any = [];
  // f(term, a);
  // ctx.body = { msg: `Materia: ${ctx.query.term}, pre: ${a}` };
  // ctx.body = res;
  
});

router.get('/materias/:id', ctx => {
  ctx.body = { msg: `Matéria: ${ctx.params.id}` };
});

router.post('/materias', ctx => {
  ctx.body = { msg: `Materias inseridas` };
});

router.put('/materias/:id', ctx => {
  ctx.body = { msg: `Materia editada` };
});
  
app.use(router.routes()).use(router.allowedMethods());

async function bootstrap() {
  await initializeDB();
  app.context.db = client;

  app.listen(3000, () => {
    console.log('server running');
  });
}

bootstrap();


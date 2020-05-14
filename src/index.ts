import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
import { client } from './client';
import { createTables } from './createTables';
import { runInNewContext } from 'vm';

async function initializeDB() {
  try {
    await client.connect();
    console.log('Database is running');
  } catch (e) {
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
//   while (i < 2 || subjects[i].cod != subjectCod) {
//     i++;
//   }
//   if (i != 2) {
//     a.push(subjects[i].pre);
//     f(subjects[i].pre, a); // arrumar pra varios pre requesitos
//   }
// };

// router.get('/', async (ctx) => {
  // const { db }: any = ctx;
  // await db.query(`insert into disciplinas(codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link)
  // values ('MAC0323', 'Blabla', 0, 0, '0', '')
  // `);
  // const response = await db.query(`select * from disciplinas`);
  // ctx.body = { rows: response.rows };
// });

function isValid(materia : any, ctx : Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>> ) : boolean {
  const response = {
    error: ''
  }

  if(!materia.codigo || !materia.nome || !materia.creditos_aula || !materia.creditos_trab || !materia.periodo_ideal || !materia.link) {
    response.error = "Matéria deve seguir o formato: {codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link}";
    return false;
  }

  if(materia.nome.length > 255) {
    response.error = "Nome de matéria inválido";
    return false;
  }

  if(materia.codigo.length != 7) {
    response.error = "Código de código inválido";
    return false;
  }

  if(typeof(materia.creditos_aula) != "number") {
    response.error = "Créditos aula inválido";
    return false;
  }  

  if(typeof(materia.creditos_trabalho) != "number") {
    response.error = "Créditos trabalho inválido";
    return false;
  }  

  if(typeof(materia.periodo_ideal) != "string" || materia.periodo_ideal.length > 255) {
    response.error = "Perído ideal inválido";
    return false;
  }

  if(typeof(materia.link) != "string" || materia.link.length > 255) {
    response.error = "Link ideal inválido";
  }

  ctx.body = response;

  return true;
}

router.get('/requisitos', (ctx) => {
  const { db }: any = ctx;
  const term = ctx.query.term;
  ctx.body = { db };
});

router.get('/materias/:id', (ctx) => {
  ctx.body = { msg: `Matéria: ${ctx.params.id}` };
});

router.post('/materias', async (ctx) => {
  const { db }: any = ctx;
  const materia = ctx.request.body;

  if(isValid(materia, ctx)) {
    const codigo = materia.codigo;
    const nome = materia.nome;
    const creditos_aula = materia.creditos_aula;
    const creditos_trab = materia.creditos_trab;
    const periodo_ideal = materia.periodo_ideal;
    const link = materia.link;
    
    await db.query(`insert into disciplinas(codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link)`);
  }
});

router.put('/materias/:id', (ctx) => {
  ctx.body = { msg: `Materia editada` };
});

app.use(router.routes()).use(router.allowedMethods());

async function bootstrap() {
  await initializeDB();
  await createTables();
  app.context.db = client;

  app.listen(3000, () => {
    console.log('server running');
  });
}

bootstrap();

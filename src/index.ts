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

function verifySubject(materia: any): any {
  const response = {
    message: 'Matéria inserida com sucesso',
    valid: true,
  };

  if (Object.keys(materia).length != 6) {
    response.message =
      'Matéria deve seguir o formato: {codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link}';
    response.valid = false;
  }

  Object.values(materia).forEach((item: any) => {
    if (item === undefined) {
      response.message =
        'Matéria deve seguir o formato: {codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link}';
      response.valid = false;
    }
  });

  if (!response.valid) {
    return response;
  }

  if (materia.nome.length > 255) {
    response.message = 'Nome de matéria inválido';
    response.valid = false;
  }

  if (materia.codigo.length != 7) {
    response.message = 'Código de código inválido';
    response.valid = false;
  }

  if (typeof materia.creditos_aula != 'number') {
    response.message = 'Créditos aula inválido';
    response.valid = false;
  }

  if (typeof materia.creditos_trab != 'number') {
    response.message = 'Créditos trabalho inválido';
    response.valid = false;
  }

  if (typeof materia.periodo_ideal != 'string' || materia.periodo_ideal.length > 255) {
    response.message = 'Perído ideal inválido';
    response.valid = false;
  }

  if (typeof materia.link != 'string' || materia.link.length > 255) {
    response.message = 'Link ideal inválido';
  }

  return response;
}

router.get('/requisitos', (ctx) => {
  const { db }: any = ctx;
  const term = ctx.query.term;
  ctx.body = { db };
});

router.get('/materias/:id', async (ctx) => {
  const { db }: any = ctx;
  const response = await db.query(`select * from disciplinas where id = ${ctx.params.id}`);
  ctx.body = response.rows[0];
});

router.post('/materias', async (ctx) => {
  const { db }: any = ctx;
  const materia = ctx.request.body;
  const response = verifySubject(materia);
  if (response.valid) {
    const codigo = materia.codigo;
    const nome = materia.nome;
    const creditos_aula = materia.creditos_aula;
    const creditos_trab = materia.creditos_trab;
    const periodo_ideal = materia.periodo_ideal;
    const link = materia.link;

    try {
      await db.query(
        `insert into disciplinas(codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link) values ('${codigo}', '${nome}', ${creditos_aula}, ${creditos_trab}, '${periodo_ideal}', '${link}')`,
      );
    } catch (e) {
      response.message = e;
    }
  }
  ctx.body = { msg: response.message };
});

router.put('/materias/:id', (ctx) => {
  ctx.body = { msg: `Materia editada` };
});

app.use(router.routes()).use(router.allowedMethods());

async function insertTests() {
  try {
    // await client.query(
    //   "insert into disciplinas(codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link) values ('MAC0110', 'Intro a Comp', 4, 0, '1', 'link teste')",
    // );
    // await client.query(
    //   "insert into disciplinas(codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link) values ('MAC0121', 'Estrutura de Dados 1', 4, 0, '2', 'link teste 2')",
    // );
    // await client.query("insert into prerequisitos(forca, codigo_curso) values (1, '710')");
    // await client.query('insert into distemprereq(disciplina_id, prerequisito_id) values (1, 1)');
    await client.query('insert into prereqcompdis(disciplina_id, prerequisito_id) values (2, 1)');
  } catch (e) {
    console.log(e);
  }
}

router.get('/test', async (ctx) => {
  const { db }: any = ctx;
  const subjects = await db.query('select * from disciplinas');
  const prereq = await db.query('select * from prerequisitos');
  const distemprereq = await db.query('select * from distemprereq');
  const prereqcompdis = await db.query('select * from prereqcompdis');
  ctx.body = {
    subjects: subjects.rows,
    prereq: prereq.rows,
    distemprereq: distemprereq.rows,
    prereqcompdis: prereqcompdis.rows,
  };
});

async function bootstrap() {
  await initializeDB();
  await createTables();
  await insertTests();
  app.context.db = client;

  app.listen(3000, () => {
    console.log('server running');
  });
}

bootstrap();

import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
import * as cors from '@koa/cors';
import { client } from './client';
import { createTables } from './createTables';
import { Disciplina } from './Disciplina';
// import { suggestionCrawler } from './suggestionsCrawler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeNeo4j, neo4jRouter } from './neo4j';

async function initializeDB() {
  try {
    await client.connect();
    console.log('Database is running');
  } catch (e) {
    console.log(e);
  }
}

async function insertSeeds(db: any) {
  const insertionDisc =
    'INSERT into disciplinas(codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link) values ($1, $2, $3, $4, $5, $6)';
  const insertionPre = 'INSERT into prerequisitos(forca, codigo_curso) values ($1, $2)';
  const insertionDisTem = 'INSERT into distemprereq(disciplina_id, prerequisito_id) values ($1, $2)';
  const insertionPreDis = 'INSERT into prereqcompdis(disciplina_id, prerequisito_id) values ($1, $2)';
  let response = await db.query('SELECT * FROM disciplinas');

  if (response.rows.length === 0) {
    try {
      await db.query(insertionDisc, ['AAA1234', 'Matéria A', 1, 1, '5', 'link']);
      await db.query(insertionDisc, ['BBB1234', 'Matéria B', 1, 1, '5', 'link']);
      await db.query(insertionDisc, ['CCC1234', 'Matéria C', 1, 1, '5', 'link']);
      await db.query(insertionDisc, ['DDD1234', 'Matéria D', 1, 1, '5', 'link']);
      await db.query(insertionDisc, ['EEE1234', 'Matéria E', 1, 1, '5', 'link']);
      await db.query(insertionDisc, ['FFF1234', 'Matéria F', 1, 1, '5', 'link']);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }

  response = await db.query('SELECT * FROM prerequisitos');

  if (response.rows.length === 0) {
    try {
      await db.query(insertionPre, [1, '710']);
      await db.query(insertionPre, [2, '711']);
      await db.query(insertionPre, [3, '712']);
      await db.query(insertionPre, [4, '713']);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }

  response = await db.query('SELECT * FROM DisTemPreReq');

  if (response.rows.length === 0) {
    try {
      await db.query(insertionDisTem, [1, 1]);
      await db.query(insertionDisTem, [2, 2]);
      await db.query(insertionDisTem, [5, 3]);
      await db.query(insertionDisTem, [6, 4]);
      2;
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }

  response = await db.query('SELECT * FROM PreReqCompDis');

  if (response.rows.length === 0) {
    try {
      await db.query(insertionPreDis, [1, 3]);
      await db.query(insertionPreDis, [1, 4]);
      await db.query(insertionPreDis, [2, 1]);
      await db.query(insertionPreDis, [3, 1]);
      await db.query(insertionPreDis, [4, 2]);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }
}

const app: Koa = new Koa();

app.use(bodyparser());
app.use(logger());
app.use(json());
app.use(cors());

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

router.get('/requisitos', async (ctx) => {
  const { db }: any = ctx;
  const term = ctx.query.termo.toUpperCase();
  let depth = ctx.query.profundidade;
  if (depth == 0) {
    depth = 10;
  }
  let subjects = await db.query(
    `
    SELECT *
    FROM disciplinas
    WHERE codigo ILIKE $1
    OR nome ILIKE $1`,
    ['%' + term + '%'],
  );
  let result: Disciplina[] = [];

  for (let subject of subjects.rows) {
    const subjectObject: Disciplina = new Disciplina(subject);
    await subjectObject.getAncestors(db, depth);
    await subjectObject.getSuccessors(db, depth);
    result.push(subjectObject);
  }

  ctx.body = result;
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

router.post('/sugestoes', async (ctx) => {
  const { db }: any = ctx;
  const suggestion = ctx.request.body;
  const code = suggestion.codigo;
  const course = suggestion.curso;
});

app.use(router.routes()).use(router.allowedMethods());

async function insertData(neo4j: any) {
  const query: string = readFileSync(resolve('.', 'src', 'db.cypher')).toString();

  await neo4j.run('MATCH (n) DETACH DELETE n');
  await neo4j.run(query);
}

app.use(neo4jRouter.routes()).use(neo4jRouter.allowedMethods());

async function bootstrap() {
  await initializeDB();
  await createTables();

  const neo4j = initializeNeo4j();

  app.context.neo4j = neo4j;
  await insertData(neo4j);

  app.context.db = client;

  // await insertSeeds(client);

  app.listen(3000, () => {
    console.log('server running');
  });
}

bootstrap();

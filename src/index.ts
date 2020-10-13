import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as json from 'koa-json';
import * as cors from '@koa/cors';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeNeo4j, neo4jRouter } from './neo4j';

const app: Koa = new Koa();

app.use(bodyparser());
app.use(logger());
app.use(json());
app.use(cors());

const router: Router = new Router();

app.use(router.routes()).use(router.allowedMethods());
app.use(neo4jRouter.routes()).use(neo4jRouter.allowedMethods());

async function insertData(neo4j: any) {
  const query: string = readFileSync(resolve('.', 'src', 'db.cypher')).toString();

  await neo4j.run('MATCH (n) DETACH DELETE n');
  await neo4j.run(query);
}

async function bootstrap() {
  const neo4j = initializeNeo4j();

  app.context.neo4j = neo4j;
  await insertData(neo4j);

  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap();

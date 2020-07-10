import { driver, session, Driver, Session } from 'neo4j-driver';
import * as Router from 'koa-router';
import { Context, Next } from 'koa';

export function initializeNeo4j(): Session {
  const conn: Driver = driver('bolt://neo4j');
  return conn.session({
    database: 'neo4j',
    defaultAccessMode: session.WRITE,
  });
}

type RouteCallback = (context: Context, next: Next) => Promise<void>;

interface Validation {
  isValid: boolean;
  payload: any;
}

export const neo4jRouter: Router = new Router({ prefix: '/neo4j' });

function validateQuerystring(query: any): Validation {
  const { profundidade, termo, curso }: any = query;

  if (profundidade === undefined) {
    return {
      isValid: false,
      payload: 'profundidade tem que ser número',
    };
  }

  let depth: string;

  if (profundidade === undefined || profundidade <= 1) {
    depth = '';
  } else {
    depth = `*1..${profundidade}`;
  }

  return {
    isValid: true,
    payload: {
      depth,
      term: `"${termo}"`,
      course: curso,
    },
  };
}

const getRequisitos: RouteCallback = async (ctx: Context): Promise<void> => {
  const { neo4j, query }: Context = ctx;

  const { isValid, payload } = validateQuerystring(query);

  if (!isValid) {
    ctx.body = { error: payload };
    ctx.status = 401;
    return;
  }

  const { term, depth }: any = payload;

  const cypherQuery: string = `
    MATCH (center:Discipline)
    WHERE toLower(center.code) contains toLower(${term})
    OR toLower(center.name) contains toLower(${term})
    OPTIONAL MATCH backwards = (center)-[:DEPENDS_ON${depth}]->(parent:Discipline)
    OPTIONAL MATCH forward = (children:Discipline)-[:DEPENDS_ON${depth}]->(center)
    return center, backwards, forward
  `;

  const { records }: any = await neo4j.run(cypherQuery);

  const results: any = [];
  for (let i = 0; i < records.length; i++) {
    results.push({
      center: records[i].get('center'),
      backwards: records[i].get('backwards'),
      forward: records[i].get('forward'),
    });
  }

  ctx.body = { results: gather(results) };
};

function gatherNodes(results: any): any[] {
  const codes: string[] = [];
  const nodes: any[] = [];

  results.forEach(({ center, backwards, forward }: any): void => {
    if (!codes.includes(center.properties.code)) {
      codes.push(center.properties.code);
      nodes.push(center.properties);
    }

    backwards?.segments.forEach(({ start, end }: any): void => {
      if (!codes.includes(start.properties.code)) {
        codes.push(start.properties.code);
        nodes.push(start.properties);
      }

      if (!codes.includes(end.properties.code)) {
        codes.push(end.properties.code);
        nodes.push(end.properties);
      }
    });

    forward?.segments.forEach(({ start, end }: any): void => {
      if (!codes.includes(start.properties.code)) {
        codes.push(start.properties.code);
        nodes.push(start.properties);
      }

      if (!codes.includes(end.properties.code)) {
        codes.push(end.properties.code);
        nodes.push(end.properties);
      }
    });
  });

  return nodes;
}

function gatherLinks(results: any): any[] {
  const links: any[] = [];
  const control: any = {};

  results.forEach(({ backwards, forward }: any): void => {
    const paths: any[] = [];

    if (backwards) paths.push(backwards);
    if (forward) paths.push(forward);

    paths.forEach(({ segments }: any): void => {
      segments.forEach(({ start, end, relationship }: any): void => {
        const startCode = start.properties.code;
        const endCode = end.properties.code;

        if (!control[startCode]) {
          control[startCode] = [];
        }

        if (!control[startCode].includes(endCode)) {
          control[startCode] = [endCode];
          links.push({
            source: startCode,
            target: endCode,
            properties: relationship.properties,
          });
        }
      });
    });
  });

  return links;
}

function gatherCenters(results: any): any[] {
  const centers: any[] = [];
  const codes: any[] = [];

  results.forEach(({ center }: any): void => {
    const centerCode: string = center.properties.code;
    if (!codes.includes(centerCode)) {
      codes.push(centerCode);
      centers.push(center.properties);
    }
  });

  return centers;
}

function gather(results: any[]): any {
  const nodes: any[] = gatherNodes(results);
  const links: any[] = gatherLinks(results);
  const centers: any[] = gatherCenters(results);

  return { nodes, links, centers };
}

neo4jRouter.get('/requisitos', getRequisitos);

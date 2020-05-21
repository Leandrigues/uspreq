import { client } from './client';

const createTableDisciplina = `
create table if not exists disciplinas(
    id serial primary key,
    codigo varchar(7) unique,
    nome varchar(255),
    creditos_aula integer,
    creditos_trab integer,
    periodo_ideal varchar(255),
    link varchar(255)
)`;

const createTablePreRequisitos = `
create table if not exists prerequisitos(
    id serial primary key,
    forca integer,
    codigo_curso varchar(15)
)`;

const createTableDisTemPreReq = `
create table if not exists distemprereq(
    id serial primary key,
    disciplina_id integer references disciplinas(id),
    prerequisito_id integer references prerequisitos(id)
)`;

const createTablePreReqCompDis = `
create table if not exists prereqcompdis(
    id serial primary key,
    disciplina_id integer references disciplinas(id),
    prerequisito_id integer references prerequisitos(id)
)`;

export async function createTables() {
  await client.query(createTableDisciplina);
  await client.query(createTablePreRequisitos);
  await client.query(createTableDisTemPreReq);
  await client.query(createTablePreReqCompDis);
}

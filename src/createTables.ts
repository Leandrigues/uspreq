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

const createTablePreRequesitos = `
create table if not exists prerequesitos(
    id serial primary key,
    forca integer,
    codigo_curso varchar(15)
)`;

const createTableDisTemPreReq = `
create table if not exists distemprereq(
    id serial primary key,
    disciplina_id integer references disciplinas(id),
    prerequesito_id integer references prerequesitos(id)
)`;

const createTablePreReqCompDis = `
create table if not exists prereqcompdis(
    id serial primary key,
    disciplina_id integer references disciplinas(id),
    prerequesito_id integer references prerequesitos(id)
)`;

export async function createTables() {
  await client.query(createTableDisciplina);
  await client.query(createTablePreRequesitos);
  await client.query(createTableDisTemPreReq);
  await client.query(createTablePreReqCompDis);
}
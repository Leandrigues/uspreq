import { Client } from 'pg';

export class Disciplina {
  id: number;
  codigo: string;
  nome: string;
  creditos_aula: number;
  creditos_trab: number;
  link: string;
  periodo_ideal: string;
  pais: Disciplina[];
  filhos: Disciplina[];

  constructor({ id, codigo, nome, creditos_aula, creditos_trab, link, periodo_ideal} : any) {
    this.id = id;
    this.codigo = codigo;
    this.nome = nome;
    this.creditos_aula = creditos_aula;
    this.creditos_trab = creditos_trab.
    this.link = link;
    this.periodo_ideal = periodo_ideal;
    this.pais = [];
    this.filhos = [];
  }

  async getAncestors(db: Client, depth: number) {
    const response = await db.query(`select prerequesito_id from distemprereq where disciplina_id = ${this.id}`);
  }

  getDescendents(depth: number) {}
}

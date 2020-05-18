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

  constructor(db: Client) {
    this.codigo = codigo;
    this.pais = [];
    this.filhos = [];
  }

  async getAncestors(db: Client, depth: number) {
    const response = await db.query(`select prerequesito_id from distemprereq where disciplina_id = ${this.id}`);
    response.rows.forEach((subject) => {
    })

    };
  }

  getDescendents(depth: number) {}
}

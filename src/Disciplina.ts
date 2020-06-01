import { Client } from 'pg';

export class Disciplina {
  id: number;
  codigo: string;
  nome: string;
  creditos_aula: number;
  creditos_trab: number;
  link: string;
  periodo_ideal: string;
  pais: any[];
  filhos: Disciplina[];
  _forca: number|undefined;
  _codigo_curso: string|undefined;
  _pr_id: number|undefined; 

  constructor({ id, codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link }: any) {
    this._forca = undefined;
    this._codigo_curso = undefined;
    this._pr_id = undefined;
    this.id = id;
    this.codigo = codigo;
    this.nome = nome;
    this.creditos_aula = creditos_aula;
    this.creditos_trab = creditos_trab;
    this.link = link;
    this.periodo_ideal = periodo_ideal;
    this.pais = [];
    this.filhos = [];
  }

  set forca(forca : number) {
    this._forca = forca;
  }

  set codigo_curso(codigo_curso : string) {
    this._codigo_curso = codigo_curso;
  }

  set pr_id(pr_id : number) {
    this._pr_id = pr_id;
  }

  async getAncestors(db: Client, depth: number = 1) {
    if (depth <= 0) {
      return;
    }
    const subjects : Disciplina[] = []
    const { rows } : any = await db.query(`SELECT dis.*, pr.forca, pr.codigo_curso, pr.id as pr_id
    FROM distemprereq AS dtpr 
    INNER JOIN prerequisitos AS pr ON dtpr.prerequisito_id = pr.id 
    INNER JOIN prereqcompdis AS prcd ON prcd.prerequisito_id = pr.id 
    INNER JOIN disciplinas as dis ON dis.id = prcd.disciplina_id 
    WHERE dtpr.disciplina_id = $1`, [this.id]);

    
    this.filhos = rows.map((subject : any) => {
      const discipline = new Disciplina(subject);
      discipline.pr_id = subject.pr_id; 
      discipline.forca = subject.forca; 
      discipline.codigo_curso = subject.codigo_curso; 
      return discipline;
    })
  }
}
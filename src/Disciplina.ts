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
  filhos: any[];

  constructor({ id, codigo, nome, creditos_aula, creditos_trab, periodo_ideal, link }: any) {
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

  async getAncestors(db: Client, depth: number) {
    if (depth > 0) {
      let preReqIdList = await db.query(`select prerequisito_id from distemprereq where disciplina_id = ${1}`);
      let subIdList: any[] = [];
      console.log(`response.rows = ${JSON.stringify(preReqIdList.rows)}`);
      
      preReqIdList.rows.forEach(async (preReq) => {
        let subId = await db.query(`select disciplina_id from prereqcompdis where prerequisito_id = ${preReq.prerequisito_id}`)
        console.log(`response2.rows = ${JSON.stringify(subId.rows)}`);
        subIdList.push(subId.rows);
        console.log(`subIds = ${JSON.stringify(subIdList)}`);
        subIdList.forEach((subjectsIds: any) => {
          let dispList: Disciplina[] = [];

          subjectsIds.forEach(async (subject: any) => {
            let subjects = await db.query(`select * from disciplinas where id = ${subject.disciplina_id}`)
            console.log(`response3.rows = ${JSON.stringify(subjects.rows)}`);
            let disp: Disciplina = new Disciplina(subjects.rows[0]);
            dispList.push(disp);
            console.log(JSON.stringify(this.filhos));
          });
          this.filhos.push(dispList);
        });
      });
    }
  }
}

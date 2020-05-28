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

  getAncestors(db: Client, depth: number) {
    if (depth > 0) {
      console.log(this.id);

      db.query(`select prerequisito_id from distemprereq where disciplina_id = ${this.id}`).then((response) => {
        console.log(`response.rows = ${JSON.stringify(response.rows)}`);

        let subIds: any[] = [];

        response.rows.forEach((preReq) => {
          db.query(`select disciplina_id from prereqcompdis where prerequisito_id = ${preReq.prerequisito_id}`).then(
            (response2) => {
              console.log(`response2.rows = ${JSON.stringify(response2.rows)}`);
              subIds.push(response2.rows);
              console.log(`subIds = ${JSON.stringify(subIds)}`);
              subIds.forEach((subjectsIds: any) => {
                let dispList: Disciplina[] = [];

                subjectsIds.forEach((subject: any) => {
                  db.query(`select * from disciplinas where id = ${subject.disciplina_id}`)
                    .then((response3) => {
                      console.log(`response3.rows = ${JSON.stringify(response3.rows)}`);
                      let disp: Disciplina = new Disciplina(response3.rows[0]);
                      dispList.push(disp);
                    })
                    .then(() => {
                      this.filhos.push(dispList);
                      console.log(JSON.stringify(this.filhos));
                    });
                });
              });
            },
          );
        });
      });
    }
  }

  // getDescendents(depth: number) {}
}

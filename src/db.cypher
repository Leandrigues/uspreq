CREATE (palestrinha:Discipline {code: "MAC0101", name: "Integração na Universidade e na Profissão", aula: "2", trab: "0"})
CREATE (fumac:Discipline {code: "MAC0105", name: "Fundamentos de Matemática para Computação", aula: "4", trab: "0"})
CREATE (mac110:Discipline {code: "MAC0110", name: "Introdução à Computação", aula: "4", trab: "0"})
CREATE (booleana:Discipline {code: "MAC0329", name: "Álgebra Booleana e Aplicações no Projeto de Arquitetura de Computadores", aula: "4", trab: "0"})


CREATE (ed1:Discipline {code: "MAC0121", name: "Algoritmos e Estrutura de Dados I",  aula: "4", trab: "0"})
CREATE (tecprog1:Discipline {code: "MAC0216", name: "Técnicas de Programação I",  aula: "4", trab: "2"})
CREATE (logica:Discipline {code: "MAC0239", name: "Introdução à Lógica e Verificação de Programas",  aula: "4", trab: "0"})
CREATE (ed1)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(mac110)
CREATE (tecprog1)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(mac110)
CREATE (logica)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(mac110)


CREATE (palestrona:Discipline {code: "MAC0102", name: "Caminhos no Bacharelado em Ciência da Computação",  aula: "2", trab: "0"})
CREATE (modelagem:Discipline {code: "MAC0209", name: "Modelagem e Simulação",  aula: "4", trab: "0"})
CREATE (labnum:Discipline {code: "MAC0210", name: "Laboratório de Métodos Numéricos",  aula: "4", trab: "0"})
CREATE (ed2:Discipline {code: "MAC0323", name: "Algoritmos e Estrutura de Dados II",  aula: "4", trab: "2"})
CREATE (palestrona)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(ed1)
CREATE (modelagem)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(mac110)
CREATE (labnum)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(mac110)
CREATE (ed2)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(ed1)
CREATE (ed2)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(tecprog1)


CREATE (conceitos:Discipline {code: "MAC0316", name: "Conceitos Fundamentais de Linguagens de Programação",  aula: "4", trab: "0"})
CREATE (analise:Discipline {code: "MAC0338", name: "Análise de Algoritmos",  aula: "4", trab: "0"})
CREATE (conceitos)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(ed1)
CREATE (analise)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(ed2)


CREATE (sisteminhas:Discipline {code: "MAC0350", name: "Introdução ao Desenvolvimento de Sistemas de Software",  aula: "4", trab: "2"})
CREATE (so:Discipline {code: "MAC0422", name: "Sistemas Operacionais",  aula: "4", trab: "2"})
CREATE (sisteminhas)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(ed1)
CREATE (sisteminhas)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(tecprog1)
CREATE (so)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(ed1)


CREATE (tcc:Discipline {code: "MAC0499", name: "Trabalho de Formatura Supervisionado",  aula: "0", trab: "16"})
CREATE (tcc)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(analise)
CREATE (tcc)-[:DEPENDS_ON {strength: "hard", course: "45052"}]->(so)

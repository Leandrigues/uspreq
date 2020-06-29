import JSSoup from 'jssoup';
import axios from 'axios';

async function suggestionCrawler() {
  const p = await axios.get('https://uspdigital.usp.br/jupiterweb/obterDisciplina?nomdis=&sgldis=PCS3544');
  //   console.log(p);
  let soup = new JSSoup(p.data, false);
  const a = soup.find('div');
}

suggestionCrawler();

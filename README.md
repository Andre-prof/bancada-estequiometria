# Bancada de Estequiometria

Laboratório virtual aberto para alunos do ensino médio aprenderem estequiometria por investigação: balancear, pesar, medir, prever, misturar, observar e explicar.

**Aplicativo:** https://andre-prof.github.io/bancada-estequiometria/

Não exige conta da OpenAI, chave de API, servidor de aplicação ou banco remoto. Os cálculos e o armazenamento acontecem no navegador. Após a primeira visita com conexão e o cache concluído, o aplicativo pode funcionar offline.

## Experiências de aprendizagem

- **Explorar:** mudar quantidades e condições, comparar ensaios e investigar o fenômeno.
- **Aprender:** sete passos com conferência e dicas: escrever a equação; balancear; identificar dada e pedida; interpretar a proporção em mol; registrar dado e pergunta; converter unidades; relacionar as quantidades e explicar.
- **Desafios:** três missões sobre gás, metal remanescente e precipitação. Sem cronômetro, ranking de velocidade ou incentivo à memorização de respostas.

A equação começa sem coeficientes ajustados. O aluno balanceia e acompanha a contagem de átomos. O professor pode habilitar a resposta automática como ajuda; ela começa desligada.

Na balança, faça a tara do recipiente vazio e adicione a amostra. Na proveta, ajuste o nível e leia o menisco. A medida registrada alimenta a conta; alterar os dados do reagente exige registrar a medida novamente. No modo Aprender e nos Desafios, registre também uma previsão antes da mistura.

## Química

Inclui zinco + HCl, carbonato de cálcio + HCl e precipitação de AgCl. O professor pode cadastrar outras reações únicas compatíveis, revisar estados e condições e usar o balanceador de fórmulas neutras com grupos e hidratos.

- Reagente limitante por menor n/coeficiente; excesso e produtos calculados pelo avanço da reação.
- Amostras com pureza, soluções em mol/L e soluções comerciais com % m/m e densidade. A massa do solvente entra no sistema.
- Corpo de fundo separado em reagente sólido remanescente, precipitado e impurezas insolúveis.
- Conversão e recuperação separadas. Perder produto na coleta não faz os reagentes reaparecerem.
- Gás ideal seco por PV = nRT, com temperatura em °C convertida para K e pressão em kPa.
- Sistema pesado considera o béquer e, se ativo, o gás recolhido. Gás não recolhido sai desse sistema. A tara das vidrarias é excluída.

O balanceador conserva átomos, mas não comprova que uma reação ocorra. O modelo não calcula pH, equilíbrio, solubilidade residual, calor, velocidade, evaporação ou gás dissolvido. Reagentes gasosos exigem outro aparato e não são simulados nesta versão. A animação, as alturas de líquido e o tamanho dos sólidos são esquemáticos. Não é um roteiro para realizar experimentos reais.

## Professor: biblioteca, planilha e impressão

Os cadastros ficam no armazenamento local do navegador. Exporte a biblioteca JSON para fazer cópias, compartilhar ou mudar de computador. Limpar os dados do navegador também apaga a biblioteca local.

1. Na área do professor, baixe o modelo CSV.
2. Abra no Excel, LibreOffice ou Google Sheets. Cada linha configura uma atividade com dois reagentes.
3. Escolha a coluna `determinar`: limitante, corpo_fundo, gas_formado, gas_recolhido, massa_produto, excesso ou rendimento.
4. Indique a substância e a unidade quando aplicáveis. Use os identificadores de reações listados no próprio aplicativo. Para uma nova reação, cadastre-a e revise-a antes.
5. Salve como CSV UTF-8 e importe. A prévia apresenta perguntas e gabaritos; só depois da revisão eles entram na biblioteca.
6. Na aba Questões, imprima a lista dos alunos ou a lista com gabarito comentado em página separada. O diálogo do navegador também permite salvar em PDF.

O aplicativo aceita separadores ponto e vírgula ou vírgula e números com vírgula decimal em campos citados ou CSV com ponto e vírgula. Use 37 para 37%, não 0,37. Campos em branco usam os valores-padrão; zeros são preservados. O template cobre atividades de duas entradas, não todos os tipos de problemas de vestibular. O objetivo é investigar e compreender.

## Executar e contribuir

Node.js >=22.13:

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

O build estático sai em `docs/`, com caminhos relativos compatíveis com subdiretórios do GitHub Pages. Nenhum segredo deve entrar no código.

Para publicar pelo GitHub Pages: Settings → Pages → Deploy from a branch → branch `main`, pasta `/docs`. A publicação não depende de servidor Cloudflare ou Sites. Quando mudar o código, rode `npm run build` e inclua `docs/` no commit. O cache offline recebe uma versão baseada nos arquivos do build.

## Organização

- `src/lab.tsx`: bancada e autoria.
- `src/instruments.tsx`: balança e proveta interativas.
- `src/learning.tsx`: roteiro dos sete passos.
- `src/teacher-tools.tsx`: CSV, biblioteca e lista imprimível.
- `lib/chemistry.mjs`: modelo químico.
- `lib/balance.mjs`: balanceamento com frações exatas.
- `lib/activities.mjs`: perguntas parametrizadas e CSV.
- `lib/pedagogy.mjs`: objetivos, roteiro e diagnóstico.
- `lib/library.mjs`: armazenamento e validação local.

Leia [CONTRIBUTING.md](CONTRIBUTING.md) para colaborar. Código sob licença [MIT](LICENSE). Bibliotecas de terceiros mantêm suas próprias licenças.


## Investigar e comparar

O balanceamento no modo Aprender acontece dentro da segunda etapa, com tabela de átomos em tempo real. A primeira etapa pede identificar um reagente e um produto. A barra Seu experimento contém apenas o seletor de reação.

Antes de misturar, é possível registrar estimativas de volume de gás formado em L, massa de sólidos no fundo em g e uma justificativa. Depois do ensaio, o aplicativo apresenta previsão e simulação lado a lado. As estimativas são opcionais e não recebem nota. Ao mudar as condições, revise sua previsão antes do novo ensaio.

A seção Comparar ensaios permite selecionar duas execuções da mesma reação e comparar entradas, temperatura, pressão, conversão, recuperação, limitante, gás e sólidos. O relatório JSON inclui os ensaios da sessão, coeficientes aplicados e previsões; não inclui identidade do aluno nem todas as tentativas de coeficientes. O histórico de até oito ensaios fica somente na sessão atual e pode ser exportado antes de fechar a página.

O glossário explica os conceitos sem exigir sair da bancada. A simulação não inclui dissolução de precipitados ao adicionar água nem coleta sobre água; o coletor é uma representação esquemática de gás ideal seco.

O botão **Novo ensaio** reinicia toda a sessão, como recarregar a página: retorna ao modo Aprender e à escolha da reação, restaura as condições e quantidades iniciais, reinicia o roteiro e limpa resultados, medições, previsões, questões não salvas e histórico. A biblioteca e as preferências salvas no navegador são preservadas. Para comparar tentativas sem apagar o histórico, altere as medidas ou condições do ensaio atual.

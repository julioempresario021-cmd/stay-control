# STAYCONTROL — pesquisa de referências e estrutura da landing page

Data: 17/10/2026.

## Escopo

Benchmark qualitativo de comunicação e arquitetura de informação de cinco empresas de automação residencial e hospitalidade. Não é uma pesquisa quantitativa com clientes; não estima tamanho de mercado, conversão ou economia de energia.

## Referências consultadas

| Referência oficial | Observação | Aplicação ao STAYCONTROL |
| --- | --- | --- |
| [Control4](https://www.control4.com/) | Explica a experiência integrada, separa uso residencial e comercial e apresenta aplicações concretas. | Separar Residência e Hotel; apresentar iluminação, clima e entretenimento em linguagem cotidiana. |
| [Savant — Smart Home Living](https://www.savant.com/what-is-savant/) | Organiza a apresentação em torno da vida em casa e do controle em um aplicativo. | Abrir com conforto e situações reconhecíveis; mostrar uma prévia ilustrativa de interface. |
| [Lutron — Hospitality](https://www.lutron.com/us/en/controls/systems/hospitality-systems) | Destaca conforto do hóspede, privacidade e aplicações diferentes dentro do hotel. | Reservar um caminho próprio para Hotel e distinguir experiência do hóspede de operação da equipe. |
| [Loxone — Hospitality](https://www.loxone.com/enus/commercial/hospitality/) | Conecta experiência dos hóspedes, controles simples e necessidades operacionais. | Explicar controles no quarto e fluxo de recepção/camareira, disponíveis na versão Hotel Premium já existente. |
| [Intelbras — Casa inteligente do seu jeito](https://www.intelbras.com/pt-br/blog/casa-inteligente-do-seu-jeito/) | Relaciona automação à rotina e a situações domésticas. | Textos curtos sobre o dia a dia, sem exigir entendimento técnico. |

## Decisão de estrutura

1. Cabeçalho com marca, atalhos internos e chamada para conhecer o aplicativo.
2. Abertura: “Mais conforto. Menos complicação. Em um só lugar.” Imagem de ambiente e prévia de interface explicitamente ilustrativa.
3. Faixa de recursos: iluminação, climatização, entretenimento e controle integrado.
4. Escolha de ambiente com imagens e dois caminhos: Residência e Hotel. Cada um abre sua seleção Essencial/Premium.
5. Explicação dos benefícios: reunir controles, respeitar rotinas de cada ambiente e permitir explorar as versões.
6. Três passos para experimentar, sem cadastro comercial ou formulário sem destino.
7. Dúvidas frequentes sobre soluções, versões e caráter simulado da demonstração.
8. Chamada final para escolher o ambiente.

## Conteúdo e limites

A pesquisa orienta a apresentação. Recursos de concorrentes não se tornam capacidades do STAYCONTROL. Não foram adicionados números de economia, depoimentos, marcas de clientes, integração com PMS, assistente de voz ou certificações. O aplicativo continua sendo uma demonstração com equipamentos simulados.

O administrador permanece na tela de seleção Essencial/Premium de cada ambiente. Os links da documentação continuam dentro da área administrativa. O controle por PIN já existente é uma barreira de interface da demonstração, não autenticação de servidor dos HTMLs estáticos.

## Imagens

Imagens ilustrativas de ambientes do Unsplash; não representam instalações executadas pela STAYCONTROL:

- Residência: https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85
- Hotel: https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85

Imagens servidas diretamente pelo CDN images.unsplash.com, com tamanho e qualidade definidos. Alt text, dimensões explícitas e carregamento adiado nas imagens abaixo da abertura. A imagem principal tem prioridade de carregamento. O restante do aplicativo e sua documentação continuam locais; as fotos dependem de conexão com o CDN.

## Verificação

JavaScript validado por compilação e execução com DOM simulado: renderização da landing page, os três destinos de navegação, foco no título da seção, preferência por movimento reduzido, dois caminhos de ambiente, quatro versões por URL, retorno para a landing, entrada no administrador, PIN correto/incorreto e documentos isolados por ambiente.

Não houve verificação visual em navegador neste turno: o ambiente de execução local ficou indisponível e o navegador de QA previsto pela habilidade Sites não estava disponível.

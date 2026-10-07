[README (1).md](https://github.com/user-attachments/files/32837237/README.1.md)
# SGF Resíduos

Aplicação web responsiva para **rastreio e descarte de caçambas por transportadora**.

## O que foi feito

Um MVP frontend em um separados nos seguintes arquivos HTML, CSS e JavaScript puro, sem backend nem dependências. Os dados ficam salvos no navegador (`localStorage`).

- **Painel:** indicadores de caçambas ativas, descartadas, em transporte, transporte concluído e total descartado (kg).
- **Caçambas:** cadastro, busca, filtros e acompanhamento do fluxo **Disponível → Em operação → Em transporte → Descartada**, com histórico de datas.
- **Descarte:** registro do peso total (kg) e do destino final (reciclagem, reuso, aterro ou coprocessamento).
- **Transportadoras:** resumo por empresa e cadastro de novas transportadoras.

## Limitações

Por ser um MVP, os dados não são compartilhados entre usuários, não há login e ainda não é possível editar ou excluir registros.

## Acesse

Em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

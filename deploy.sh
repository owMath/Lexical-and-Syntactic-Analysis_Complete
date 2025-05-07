#!/bin/bash

echo "Iniciando processo de implantação do Analisador Léxico no Railway"

echo "Instalando dependências..."
npm install

echo "Criando build otimizada para produção..."
npm run build

echo "Instalando serve para executar a aplicação..."
npm install -g serve

echo "Para implantar no Railway, siga as instruções em README_DEPLOY.md"
echo "Para testar localmente, execute: serve -s build"

echo "Processo concluído com sucesso!" 
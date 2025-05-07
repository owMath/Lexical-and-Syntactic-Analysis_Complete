@echo off
echo Iniciando processo de implantacao do Analisador Lexico no Railway

echo Instalando dependencias...
call npm install

echo Criando build otimizada para producao...
call npm run build

echo Instalando serve para executar a aplicacao...
call npm install -g serve

echo Para implantar no Railway, siga as instrucoes em README_DEPLOY.md
echo Para testar localmente, execute: serve -s build

echo Processo concluido com sucesso!
pause 
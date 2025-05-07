# Implantação no Railway

Este guia detalha como implantar o Simulador de Autômato Finito - Analisador Léxico no Railway.

## Pré-requisitos

- Conta no [Railway](https://railway.app/)
- Git instalado em sua máquina
- Node.js instalado em sua máquina

## Passos para Implantação

### 1. Preparando o projeto

Primeiro, certifique-se de que o projeto está funcionando localmente:

```bash
# Instalar dependências
npm install

# Criar build otimizada para produção
npm run build
```

### 2. Criar repositório Git

Se o projeto ainda não está em um repositório Git:

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Versão inicial para implantação"
```

### 3. Implantar no Railway

#### Opção 1: Via Dashboard do Railway

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte sua conta GitHub (se ainda não estiver conectada)
5. Selecione o repositório do projeto
6. Na seção de configuração:
   - Adicione a variável de ambiente `NODE_ENV=production`
   - Defina o comando de build: `npm run build`
   - Defina o comando de start: `npx serve -s build`

#### Opção 2: Via CLI do Railway

1. Instale a CLI do Railway
```bash
npm i -g @railway/cli
```

2. Faça login
```bash
railway login
```

3. Inicialize o projeto
```bash
railway init
```

4. Implante o projeto
```bash
railway up
```

## Verificando a implantação

Após a implantação, o Railway fornecerá um URL onde seu aplicativo estará disponível.

## Configurações adicionais

### Domínio personalizado

1. No dashboard do Railway, vá para as configurações do projeto
2. Clique em "Settings" > "Domains"
3. Siga as instruções para configurar seu domínio personalizado

### Configuração de cache

Para melhorar o desempenho, configure os cabeçalhos de cache:

1. Crie um arquivo `_headers` na pasta `public` com o seguinte conteúdo:
```
/*
  Cache-Control: public, max-age=3600
```

### Logs e monitoramento

O Railway oferece logs integrados que podem ser acessados pelo dashboard.

## Resolução de problemas

- **Erro 503**: Verifique se o comando de start está configurado corretamente
- **Erro de build**: Verifique os logs de build no Railway Dashboard
- **Problemas com recursos estáticos**: Certifique-se de que todos os caminhos usam URLs relativas

## Recursos adicionais

- [Documentação oficial do Railway](https://docs.railway.app/)
- [Guia de otimização React](https://create-react-app.dev/docs/production-build/) 
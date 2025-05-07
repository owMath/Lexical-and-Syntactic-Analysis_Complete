import React, { useState } from 'react';

const AutomatoSimulador = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState([]);
  const [currentState, setCurrentState] = useState('q0');
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [tokensDetected, setTokensDetected] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  const estados = {
    'q0': 'Estado inicial',
    'LPAREN': 'Parêntese esquerdo',
    'RPAREN': 'Parêntese direito',
    'OPERATOR_SIMPLES': 'Operador simples (+,-,*,/,^)',
    'OP_RELACIONAL': 'Operador relacional (<,>,=,!)',
    'OP_COMPOSTO': 'Operador composto (==,<=,>=,!=)',
    'IDENTIFIER': 'Identificador comum',
    'SPECIAL_ID': 'Identificador especial (MEM, RES)',
    'KEYWORD': 'Palavra-chave (if, then, else, for)',
    'INT': 'Número inteiro',
    'REAL': 'Número real',
    'q8': 'Estado para ponto-e-vírgula',
    'q10': 'Estado para expoente após e/E em números reais',
    'q11': 'Estado para dígitos após expoente em números reais'
  };

  // Lista de palavras-chave da linguagem
  const keywords = ['if', 'else', 'then', 'for', 'while', 'int', 'float', 'return'];
  
  // Lista de identificadores especiais
  const specialIdentifiers = ['MEM', 'RES'];

  const isLetter = (char) => /[a-zA-Z]/.test(char);
  const isDigit = (char) => /[0-9]/.test(char);
  const isSpace = (char) => /\s/.test(char);
  
  // Função de transição do autômato, seguindo exatamente o diagrama
  const processChar = (char, currentState, position) => {
    switch(currentState) {
      case 'q0':
        if (char === '(') return 'LPAREN';
        if (char === ')') return 'RPAREN';
        if (char === '+' || char === '-' || char === '*' || char === '/' || char === '%') 
          return 'OPERATOR_SIMPLES';
        if (char === '<' || char === '>' || char === '=' || char === '!') 
          return 'OP_RELACIONAL';
        if (isLetter(char)) return 'IDENTIFIER';
        if (isDigit(char)) return 'INT';
        if (isSpace(char)) return 'q0';
        if (char === ';') return 'q8';
        return 'ERROR';
      
      case 'IDENTIFIER':
        // Identificadores podem ter letras e dígitos
        if (isLetter(char) || isDigit(char)) return 'IDENTIFIER';
        // Se encontrar outro caractere, retorna ao estado inicial
        return 'q0';
      
      case 'OP_RELACIONAL':
        // Tratamento para operadores compostos como ==, >=, <=, !=
        if (char === '=') return 'OP_COMPOSTO';
        return 'q0';
      
      case 'INT':
        // Se for dígito, continua sendo inteiro
        if (isDigit(char)) return 'INT';
        // Se encontrar ponto decimal, torna-se real
        if (char === '.') return 'REAL';
        // Se encontrar 'e' ou 'E', vai para tratamento de notação científica
        if (char === 'e' || char === 'E') return 'q10';
        return 'q0';
      
      case 'REAL':
        // Se for dígito, continua sendo real
        if (isDigit(char)) return 'REAL';
        // Se encontrar 'e' ou 'E', vai para tratamento de notação científica
        if (char === 'e' || char === 'E') return 'q10';
        return 'q0';
      
      case 'q10':
        // Se encontrar um dígito após 'e' ou 'E', vai para o próximo estado
        if (isDigit(char)) return 'q11';
        // Se encontrar '+' ou '-' após 'e' ou 'E', permanece em q10
        if (char === '+' || char === '-') return 'q10';
        return 'ERROR';
      
      case 'q11':
        // Se for dígito, continua tratando o expoente
        if (isDigit(char)) return 'q11';
        // Se encontrar outro caractere, retorna ao estado inicial
        return 'q0';
      
      case 'LPAREN':
      case 'RPAREN':
      case 'OPERATOR_SIMPLES':
      case 'OP_COMPOSTO':
      case 'q8':
        // Estados finais que retornam imediatamente ao estado inicial
        return 'q0';
      
      default:
        return 'q0';
    }
  };

  const detectToken = (text, start, currentState) => {
    let end = start;
    let tokenState = currentState;
    let tempState = currentState;
    
    while (end < text.length) {
      tempState = processChar(text[end], tokenState, end);
      
      // Se voltou para o estado inicial ou encontrou erro, termina o token atual
      if (tempState === 'q0' || tempState === 'ERROR') {
        break;
      }
      
      tokenState = tempState;
      end++;
    }
    
    // Verifica se é uma palavra-chave ou identificador
    if (tokenState === 'IDENTIFIER') {
      const token = text.substring(start, end);
      if (keywords.includes(token.toLowerCase())) {
        return { type: 'KEYWORD', value: token, end: end - 1 };
      }
      if (specialIdentifiers.includes(token)) {
        return { type: 'SPECIAL_ID', value: token, end: end - 1 };
      }
    }
    
    return {
      type: tokenState,
      value: text.substring(start, end),
      end: end - 1
    };
  };

  const analiseLexica = () => {
    setResult([]);
    setTokensDetected([]);
    setCurrentState('q0');
    setStep(0);
    setFinished(false);
    setCurrentPosition(0);
    
    if (!input) return;
    
    let position = 0;
    const detectedTokens = [];
    
    while (position < input.length) {
      // Ignora espaços em branco
      if (isSpace(input[position])) {
        position++;
        continue;
      }
      
      const token = detectToken(input, position, 'q0');
      
      if (token.type !== 'ERROR') {
        detectedTokens.push(token);
        position = token.end + 1;
      } else {
        detectedTokens.push({ type: 'ERROR', value: input[position], end: position });
        position++;
      }
    }
    
    setTokensDetected(detectedTokens);
    setFinished(true);
  };

  const processStep = () => {
    if (currentPosition >= input.length) {
      setFinished(true);
      return;
    }
    
    // Ignora espaços em branco
    if (isSpace(input[currentPosition])) {
      setCurrentPosition(currentPosition + 1);
      setStep(step + 1);
      return;
    }
    
    const token = detectToken(input, currentPosition, 'q0');
    
    setResult([...result, {
      step,
      position: currentPosition,
      char: input[currentPosition],
      token
    }]);
    
    setCurrentPosition(token.end + 1);
    setCurrentState('q0');
    setStep(step + 1);
    
    if (currentPosition + 1 >= input.length) {
      setFinished(true);
    }
  };

  const resetSimulation = () => {
    setResult([]);
    setCurrentState('q0');
    setStep(0);
    setFinished(false);
    setTokensDetected([]);
    setCurrentPosition(0);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Simulação do Autômato Finito - Analisador Léxico</h1>
      
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Alunos:</h2>
        <ul className="list-none">
          <li>Gabriel Martins Vicente</li>
          <li>Javier Agustin Aranibar González</li>
          <li>Matheus Paul Lopuch</li>
          <li>Rafael Bonfim Zacco</li>
        </ul>
        <p className="mt-2 font-bold">Grupo 04</p>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Entrada</h2>
        <textarea 
          className="w-full p-2 border border-gray-300 rounded" 
          rows="3" 
          value={input} 
          onChange={(e) => {
            setInput(e.target.value);
            resetSimulation();
          }}
        />
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={analiseLexica}
        >
          Analisar Texto Completo
        </button>
        
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={processStep}
          disabled={finished}
        >
          Passo a Passo
        </button>
        
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={resetSimulation}
        >
          Limpar Resultados
        </button>
      </div>
      
      {tokensDetected.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Tokens Detectados</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Tipo</th>
                <th className="border border-gray-300 p-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {tokensDetected.map((token, index) => (
                <tr key={index} className={token.type === 'ERROR' ? 'bg-red-100' : ''}>
                  <td className="border border-gray-300 p-2">{token.type}</td>
                  <td className="border border-gray-300 p-2">{token.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {result.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Passos da Análise</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Passo</th>
                <th className="border border-gray-300 p-2">Posição</th>
                <th className="border border-gray-300 p-2">Caractere</th>
                <th className="border border-gray-300 p-2">Token</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{item.step}</td>
                  <td className="border border-gray-300 p-2">{item.position}</td>
                  <td className="border border-gray-300 p-2">{item.char}</td>
                  <td className="border border-gray-300 p-2">{item.token.type} ({item.token.value})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Estados do Autômato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(estados).map(([key, value]) => (
            <div key={key} className="border border-gray-300 p-2 rounded">
              <strong>{key}</strong>: {value}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-2">Instruções de Uso</h2>
        <p>1. Digite uma expressão no campo de entrada</p>
        <p>2. Clique em "Analisar Texto Completo" para ver todos os tokens detectados</p>
        <p>3. Ou clique em "Passo a Passo" para ver cada etapa da análise</p>
        <p>4. Use "Limpar Resultados" para reiniciar a simulação</p>
        
        <h3 className="text-lg font-bold mt-3 mb-2">Exemplos para testar:</h3>
        <pre className="bg-white p-2 rounded text-sm overflow-auto">
(3 4 +)
(10 2 /)
(5.5 2.0 ^)
((3 2 +) (2 3 *) +)
(2 RES)
(10.5 MEM)
(MEM)
(2 4 +)
(if (1 1 -) then (5 6 *) else (1 2 +))
(for 3 (1 2 +))
        </pre>
      </div>
    </div>
  );
};

export default AutomatoSimulador; 
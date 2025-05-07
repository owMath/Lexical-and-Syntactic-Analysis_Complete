"""
Projeto Fase 2 - Grupo 04
Lexical and Syntactic Analysis

Alunos: 
- Gabriel Martins Vicente
- Javier Agustin Aranibar González
- Matheus Paul Lopuch
- Rafael Bonfim Zacco

Grupo 04
"""

import sys
import numpy as np
from collections import namedtuple

Token = namedtuple('Token', ['value', 'type', 'line', 'col'])

# Operadores válidos
OPERATORS = {'+', '-', '*', '/', '%', '^', '|', '<', '>', '==', '!=', '<=', '>='}
KEYWORDS = {'RES', 'MEM', 'if', 'then', 'else', 'for', 'V'}

history = []
memory = np.float16(0.0)

def dfa_lexer(line, line_num):
    tokens = []
    i = 0
    while i < len(line):
        ch = line[i]
        if ch.isspace():
            i += 1
            continue
        elif ch == '(':
            tokens.append(Token('(', 'LPAREN', line_num, i))
            i += 1
        elif ch == ')':
            tokens.append(Token(')', 'RPAREN', line_num, i))
            i += 1
        elif ch in ['<', '>', '!', '=']:
            start = i
            i += 1
            if i < len(line) and line[i] == '=':
                i += 1
            op = line[start:i]
            if op in OPERATORS:
                tokens.append(Token(op, 'OPERATOR', line_num, start))
            else:
                raise SyntaxError(f"Unrecognized operator '{op}' at line {line_num}, col {start}")
        elif ch in OPERATORS:
            tokens.append(Token(ch, 'OPERATOR', line_num, i))
            i += 1
        elif ch.isdigit() or ch == '.':
            start = i
            has_dot = False
            while i < len(line) and (line[i].isdigit() or line[i] == '.' or line[i] in ['e', 'E', '+', '-']):
                if line[i] == '.':
                    has_dot = True
                i += 1
            num = line[start:i]
            try:
                float(num)  # testa se é válido
                if has_dot or 'e' in num or 'E' in num:
                    tokens.append(Token(num, 'REAL', line_num, start))
                else:
                    tokens.append(Token(num, 'INT', line_num, start))
            except:
                raise SyntaxError(f"Número mal formado '{num}' na linha {line_num}")
        elif ch.isalpha():
            start = i
            while i < len(line) and line[i].isalnum():
                i += 1
            word = line[start:i]
            if word in KEYWORDS:
                tokens.append(Token(word, 'KEYWORD', line_num, start))
            else:
                tokens.append(Token(word, 'IDENTIFIER', line_num, start))
        else:
            raise SyntaxError(f"Unrecognized character '{ch}' at line {line_num}, col {i}")
    return tokens

def parse_expr(tokens):
    global memory
    if not tokens or tokens[0].value != '(':
        raise SyntaxError("Expected '(' at beginning of expression")
    tokens.pop(0)
    if tokens[0].type == 'KEYWORD' and tokens[0].value == 'if':
        tokens.pop(0)
        cond = parse_expr(tokens)
        if tokens.pop(0).value != 'then':
            raise SyntaxError("Expected 'then'")
        then_branch = parse_expr(tokens)
        if tokens.pop(0).value != 'else':
            raise SyntaxError("Expected 'else'")
        else_branch = parse_expr(tokens)
        if tokens.pop(0).value != ')':
            raise SyntaxError("Expected ')' after if-then-else")
        return then_branch if cond else else_branch

    elif tokens[0].type == 'KEYWORD' and tokens[0].value == 'for':
        tokens.pop(0)  # consumir 'for'
        count_token = tokens.pop(0)
        try:
            count = int(count_token.value)
        except:
            raise SyntaxError(f"Esperado número inteiro após 'for', encontrado '{count_token.value}'")
        
        body_expr = parse_expr(tokens)
        
        if tokens and tokens[0].value == ')':
            tokens.pop(0)  # consumir ')'
        else:
            raise SyntaxError("Expected ')' after for loop body")
            
        result = np.float16(0.0)
        for _ in range(count):
            result = body_expr
        return result

    elif tokens[0].type == 'INT' and tokens[1].value == 'RES':
        index = int(tokens.pop(0).value)
        tokens.pop(0)  # RES
        if tokens.pop(0).value != ')':
            raise SyntaxError("Expected ')' after RES")
        return history[-(index + 1)] if index < len(history) else np.float16(0.0)

    elif tokens[0].type in ['REAL', 'INT'] and tokens[1].value == 'MEM':
        val = np.float16(float(tokens.pop(0).value))
        tokens.pop(0)  # MEM
        memory = val
        if tokens.pop(0).value != ')':
            raise SyntaxError("Expected ')' after V MEM")
        return val

    elif tokens[0].value == 'MEM':
        tokens.pop(0)
        if tokens.pop(0).value != ')':
            raise SyntaxError("Expected ')' after MEM")
        return memory

    # Operações RPN
    left = parse_expr(tokens) if tokens[0].value == '(' else eval_token(tokens.pop(0))
    right = parse_expr(tokens) if tokens[0].value == '(' else eval_token(tokens.pop(0))
    op = tokens.pop(0).value
    if tokens.pop(0).value != ')':
        raise SyntaxError("Expected ')' after operation")

    return apply_operator(left, right, op)

def eval_token(token):
    if token.type == 'REAL':
        return np.float16(float(token.value))
    elif token.type == 'INT':
        return int(token.value)
    else:
        raise SyntaxError(f"Unexpected token {token.value}")

def apply_operator(a, b, op):
    try:
        if op == '+': return np.float16(a + b)
        if op == '-': return np.float16(a - b)
        if op == '*': return np.float16(a * b)
        if op == '/': 
            if b == 0:
                raise ZeroDivisionError("Divisão por zero não é permitida")
            return np.float16(a / b) if isinstance(a, float) or isinstance(b, float) else int(a) // int(b)
        if op == '%': 
            if b == 0:
                raise ZeroDivisionError("Módulo por zero não é permitido")
            return int(a) % int(b)  # Inteiro
        if op == '^': return np.float16(a ** int(b))  # Expoente inteiro
        if op == '|': 
            if b == 0:
                raise ZeroDivisionError("Divisão por zero não é permitida")
            return np.float16(a / b)
        if op == '<': return a < b
        if op == '>': return a > b
        if op == '==': return a == b
        if op == '!=': return a != b
        if op == '<=': return a <= b
        if op == '>=': return a >= b
    except OverflowError:
        raise ValueError(f"Overflow ao calcular {a} {op} {b}")
    except:
        raise ValueError(f"Erro ao calcular {a} {op} {b}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python rpn_analyzer.py input.txt")
        sys.exit(1)

    filename = sys.argv[1]
    with open(filename, 'r') as f:
        lines = f.readlines()

    for idx, line in enumerate(lines):
        print(f"\nLinha {idx+1}: {line.strip()}")
        try:
            tokens = dfa_lexer(line.strip(), idx+1)
            for i, t in enumerate(tokens):
                print(f"  Token[{i}] => valor: '{t.value}', classe: {t.type}, posição: ({t.line}, {t.col})")
            
            # Verifica se os parênteses estão balanceados
            stack = []
            for t in tokens:
                if t.value == '(':
                    stack.append(t)
                elif t.value == ')':
                    if not stack:
                        raise SyntaxError(f"Parênteses não balanceados. ')' extra na linha {idx+1}, coluna {t.col}")
                    stack.pop()
            if stack:
                raise SyntaxError(f"Parênteses não balanceados. Falta ')' na linha {idx+1}")
            
            token_copy = tokens.copy()
            result = parse_expr(token_copy)
            
            # Verifica se todos os tokens foram consumidos
            if token_copy:
                raise SyntaxError(f"Tokens extras após final da expressão: {token_copy[0].value}")
                
            history.append(result)
            print(f"✅ Resultado: {result}")
        except Exception as e:
            print(f"❌ ERRO: {str(e)}")

if __name__ == '__main__':
    main()

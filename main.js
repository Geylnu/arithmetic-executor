const AST_TYPE = {
  'MULTIPLICATIVEEXPRESSION': 'MultiplicativeExpression',
  'ADDITIVEEXPRESSION': 'AdditiveExpression',
  'NUMBER': 'Number',
  'EXPRESSION': 'Expression',
}

const LEX_TYPE = {
  'NUMBER': 'Number',
  'OPERATOR': 'Operator',
  'EOF': Symbol.for('EOF'),
}

const complexCase = '2 + 32 * 44 + 4 / 54 * 4 - 654\n'
const MUTCase = '4 / 3 * 34 * 2 /33 * 4 * 3 \n'
const errCase = '2  + 3 -\n'

const tokens = []
const emitTokens = (type, value, index) => {
  tokens.push({
    type, value, index
  })
}

const inNumber = (() => {
  let token = []
  return (char, index) => {
    if (/^[0-9]$/.test(char)) {
      token.push(char)
      return inNumber
    } else {
      emitTokens(LEX_TYPE.NUMBER, token.join(''), index )
      token = []
      return start(char)
    }
  }
})()

const token = []
const start = (char, index) => {
  if (/^[0-9]$/.test(char)) {
    return inNumber(char)
  }

  if (/^\+$/.test(char)) {
    emitTokens(LEX_TYPE.OPERATOR, char, index)
    return start
  }

  if (/^-$/.test(char)) {
    emitTokens(LEX_TYPE.OPERATOR, char, index)
    return start
  }

  if (/^\*$/.test(char)) {
    emitTokens(LEX_TYPE.OPERATOR, char, index)
    return start
  }

  if (/^\/$/.test(char)) {
    emitTokens(LEX_TYPE.OPERATOR, char, index)
    return start
  }

  if (/^\n$/.test(char)) {
    emitTokens(LEX_TYPE.EOF, LEX_TYPE.EOF, index)
  }

  return start
}


/**
 * BSL Define
 * <Expression> ::=
 *    <AdditiveExpression><EOF> 
 * 
 * <AdditiveExpression> ::=
 *    <MultiplicativeExpression> | <AdditiveExpression><+><MultiplicativeExpression> | <AdditiveExpression><-><MultiplicativeExpression> 
 * 
 * <MultiplicativeExpression> ::=
 *    <Number> | <MultiplicativeExpression><*><Number> | <MultiplicativeExpression></><Number>
 */
const Expression = source => {
  if (source[0].type === AST_TYPE.ADDITIVEEXPRESSION && source[1].type === Symbol.for('EOF')) {
    const node = {
      type: AST_TYPE.EXPRESSION,
      children: [
        source.shift(),
        source.shift(),
      ]
    }

    source.unshift()
    return node
  }

  AdditiveExpression(source)
  return Expression(source)
}

const AdditiveExpression = source => {
  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION) {
    const node = {
      type: AST_TYPE.ADDITIVEEXPRESSION,
      children: [source[0]]
    }

    source[0] = node
    return AdditiveExpression(source)
  }

  if (source[0].type === AST_TYPE.ADDITIVEEXPRESSION && source[1] && source[1].type === LEX_TYPE.OPERATOR && (source[1].value === '+' || source[1].value === '-')) {
    const node = {
      type: AST_TYPE.ADDITIVEEXPRESSION,
      operator: source[1].value,
      children: [
        source.shift(),
        source.shift(),
      ]
    }

    MultiplicativeExpression(source)

    if (source[0].type !== AST_TYPE.MULTIPLICATIVEEXPRESSION) {
      throw new TypeError(`Unexpected token '${source[0].value === LEX_TYPE.EOF ? 'EOF' : source[0].value}' at the ${source[0].index}st character, it should be a Number or other expressions`)
    }
    node.children.push(source.shift())
    source.unshift(node)
    return AdditiveExpression(source)
  }

  if (source[0].type === AST_TYPE.ADDITIVEEXPRESSION) {
    return source[0]
  }

  MultiplicativeExpression(source)
  return AdditiveExpression(source)
}

const MultiplicativeExpression = source => {
  if (source[0].type === AST_TYPE.NUMBER) {
    const node = {
      type: AST_TYPE.MULTIPLICATIVEEXPRESSION,
      children: [source[0]]
    }
    source[0] = node
    return MultiplicativeExpression(source)
  }

  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION && source[1] && source[1].type === LEX_TYPE.OPERATOR && (source[1].value === '*' || source[1].value === '/')) {
    if (source[2].type !== LEX_TYPE.NUMBER) {
      throw new TypeError(`Unexpected token '${source[2].value}' at the ${source[2].index}st character, it should be a Number`)
    }

    const node = {
      type: AST_TYPE.MULTIPLICATIVEEXPRESSION,
      operator: source[1].value,
      children: [
        source.shift(),
        source.shift(),
        source.shift()
      ]
    }

    source.unshift(node)
    return MultiplicativeExpression(source)
  }

  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION) {
    return source[0]
  }
}


const evaluate = node => {
  switch (node.type) {
    case AST_TYPE.EXPRESSION:
      return evaluate(node.children[0])

    case AST_TYPE.ADDITIVEEXPRESSION:
      if (node.operator === '+') {
        return evaluate(node.children[0]) + evaluate(node.children[2])
      }

      if (node.operator === '-') {
        return evaluate(node.children[0]) - evaluate(node.children[2])
      }

      return evaluate(node.children[0])

    case AST_TYPE.MULTIPLICATIVEEXPRESSION:
      if (node.operator === '*') {
        return evaluate(node.children[0]) * evaluate(node.children[2])
      }

      if (node.operator === '/') {
        return evaluate(node.children[0]) / evaluate(node.children[2])
      }

      return evaluate(node.children[0])

    case AST_TYPE.NUMBER:
      return Number(node.value)

    default:
      throw new Error(`Unhandled AST type: ${node && node.type}`)
  }
}
const testCase = errCase

for (let state = start, index = 0; index < testCase.length; index++) {
  const char = testCase[index];
  state = state(char, index)
}

const ast = Expression(tokens)
console.log(evaluate(ast))


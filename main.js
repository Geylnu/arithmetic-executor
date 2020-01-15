const AST_TYPE = {
  'MULTIPLICATIVEEXPRESSION': 'MultiplicativeExpression',
  'ADDITIVEEXPRESSION': 'AdditiveExpression',
  'NUMBER': 'Number',
  'EXPRESSION': 'Expression',
}

const complexCase = '2 + 32 * 44 + 4 / 54 * 4 - 654\n'
const MUTCase = '4 / 3 * 34 * 2 /33 * 4 * 3 \n'
const errCase = '2  + 3'

const tokens = []
const emitTokens = (type, value) => {
  tokens.push({
    type, value
  })
}

const inNumber = (() => {
  let token = []
  return (char) => {
    if (/^[0-9]$/.test(char)) {
      token.push(char)
      return inNumber
    } else {
      emitTokens('Number', token.join(''))
      token = []
      return start(char)
    }
  }
})()

const token = []
const start = char => {
  if (/^[0-9]$/.test(char)) {
    return inNumber(char)
  }

  if (/^\+$/.test(char)) {
    emitTokens(char, char)
    return start
  }

  if (/^-$/.test(char)) {
    emitTokens(char, char)
    return start
  }

  if (/^\*$/.test(char)) {
    emitTokens(char, char)
    return start
  }

  if (/^\/$/.test(char)) {
    emitTokens(char, char)
    return start
  }

  if (/^\n$/.test(char)) {
    emitTokens(Symbol.for('EOF'), Symbol.for('EOF'))
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

  if (source[0].type === AST_TYPE.ADDITIVEEXPRESSION && source[1].type === '+') {
    const node = {
      type: AST_TYPE.ADDITIVEEXPRESSION,
      operator: '+',
      children: [
        source.shift(),
        source.shift(),
      ]
    }

    MultiplicativeExpression(source)
    node.children.push(source.shift())
    source.unshift(node)
    return AdditiveExpression(source)
  }

  if (source[0].type === AST_TYPE.ADDITIVEEXPRESSION && source[1].type === '-') {
    const node = {
      type: AST_TYPE.ADDITIVEEXPRESSION,
      operator: '-',
      children: [
        source.shift(),
        source.shift(),
      ]
    }

    MultiplicativeExpression(source)
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

  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION && source[1] && source[1].type === '*' && source[2].type === AST_TYPE.NUMBER) {
    const node = {
      type: AST_TYPE.MULTIPLICATIVEEXPRESSION,
      operator: "*",
      children: [
        source.shift(),
        source.shift(),
        source.shift()
      ]
    }

    source.unshift(node)
    return MultiplicativeExpression(source)
  }

  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION && source[1] && source[1].type === '/' && source[2].type === AST_TYPE.NUMBER) {
    const node = {
      type: AST_TYPE.MULTIPLICATIVEEXPRESSION,
      operator: "/",
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
  state = state(char)
}

const ast = Expression(tokens)
console.log(evaluate(ast))


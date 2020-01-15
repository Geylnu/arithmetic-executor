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

const AST_TYPE = {
  'MULTIPLICATIVEEXPRESSION': 'MultiplicativeExpression',
  'ADDITIVEEXPRESSION': 'AdditiveExpression',
  'NUMBER': 'Number',
}

const complexCase = '2 + 32 * 454 + 244 / 544 * 344 - 654\n'
const MUTCase = '4 / 3 * 34 * 2 * 4 * 3\n'

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

  return start
}

const testCase = MUTCase

for (let state = start, index = 0; index < testCase.length; index++) {
  const char = testCase[index];
  state = state(char)
}

const Expression = source => {

}

const AdditiveExpression = source => {
  

}

const MultiplicativeExpression = source => {
  if (source[0].type === AST_TYPE.NUMBER) {
    const node = {
      type: AST_TYPE.MULTIPLICATIVEEXPRESSION,
      children: [source[0]]
    }
    source[0] = node
    return  MultiplicativeExpression(source)
  }

  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION && source[1] && source[1].type === '*' && source[2].type === AST_TYPE.NUMBER) {
    const node = {
      type: AST_TYPE.MULTIPLICATIVEEXPRESSION,
      operator:"*",
      children: [
        source.shift(),
        source.shift(),
        source.shift()
      ]
    }

    source.unshift(node)
    return MultiplicativeExpression(source)
  }

  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION && source[1] && source[1].type === '/' && source[2].type === AST_TYPE.NUMBER ) {
    const node = {
      type: AST_TYPE.MULTIPLICATIVEEXPRESSION,
      operator:"/",
      children: [
        source.shift(),
        source.shift(),
        source.shift()
      ]
    }

    source.unshift(node)
    return MultiplicativeExpression(source)
  }

  if (source[0].type === AST_TYPE.MULTIPLICATIVEEXPRESSION){
    return source[0]
  }
}


const evaluate = node =>{
  switch (node.type){
    case AST_TYPE.MULTIPLICATIVEEXPRESSION:
      if (node.operator === '*'){
        return evaluate(node.children[0]) * evaluate(node.children[2])
      }

      if(node.operator === '/'){
        return evaluate(node.children[0]) / evaluate(node.children[2]) 
      }

      return evaluate(node.children[0])
    
    case AST_TYPE.NUMBER:
      return Number(node.value)

    default:
      throw new Error(`Unhandled AST type: ${ node && node.type }`)
  }
}

const ast = MultiplicativeExpression(tokens)
console.log(evaluate(ast))


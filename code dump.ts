type ProblemSpace = [Map<string, string>, number]


function calc(expression: string): number {
  const initialProblemSpace: ProblemSpace = [new Map(), 0]
  const [newString, newProblemSpace] = removeNegs(expression, initialProblemSpace)
  const [newString2, newProblemSpace2] = removeParenthesis(newString, newProblemSpace)
  const [newString3, newProblemSpace3] = removeNegs(newString2, newProblemSpace2)
  console.log(newProblemSpace3)
  return evalWithProblemSpace(newString3, newProblemSpace3)
}

function evalWithProblemSpace(str: string, problemSpace: ProblemSpace): number {
  const expression = str.trim()
  const [addSubIndex, divMulIndex] = expression.split("").reduce((acc, char, idx) => {
    if (char === '+' || char === '-') return [idx, acc[1]]
    else if (char === '/' || char === '*') return [acc[0], idx]
    else return acc
  }, [-1, -1])

  const splitAt = (idx: number) => {
    return [expression.slice(0, idx), expression.slice(idx + 1)]
  }

  if (addSubIndex !== -1) {
    const [leftExp, rightExp] = splitAt(addSubIndex)
    switch (expression[addSubIndex]) {
      case '+':
        return evalWithProblemSpace(leftExp, problemSpace) + evalWithProblemSpace(rightExp, problemSpace)
      default:
        return evalWithProblemSpace(leftExp, problemSpace) - evalWithProblemSpace(rightExp, problemSpace)
    }
  }
  else if (divMulIndex !== -1) {
    const [leftExp, rightExp] = splitAt(divMulIndex)
    switch (expression[divMulIndex]) {
      case '/':
        return evalWithProblemSpace(leftExp, problemSpace) / evalWithProblemSpace(rightExp, problemSpace)
      default:
        return evalWithProblemSpace(leftExp, problemSpace) * evalWithProblemSpace(rightExp, problemSpace)
    }
  }
  else if (!isNaN(Number(expression))) {
    // the expression is a number
    return Number(expression)
  }
  else if (/[pn]\d+/.test(expression)) {
    // the expression is a variable
    const map = problemSpace[0]
    const subExpr: string | undefined = map.get(expression)
    if (subExpr && expression.startsWith("n")) {
      return -(evalWithProblemSpace(subExpr, problemSpace))
    } else if (subExpr && expression.startsWith("p")) {
      return evalWithProblemSpace(subExpr, problemSpace)
    } else {
      throw new Error(`Could not resolve variable "${expression}" against problemSpace`)
    }
  }
  else {
    // shouldn't happen, now we're in an unknown expression
    throw new Error("Invalid Expression!");
  }
}


function removeNegs(expression: string, problemSpace: [Map<string, string>, number]): [string, ProblemSpace] {
  let newExpWithoutNegs = expression
  const regex = /(?<=[\/*(+-]|^)\s*-\w+(\.\d+){0,1}/
  while (regex.test(newExpWithoutNegs)) {
    newExpWithoutNegs = newExpWithoutNegs.replace(regex, (match) => {

      console.log("match", match)
      const substring = match.trim().substring(1)
      const newVarName = "n" + problemSpace[1]

      //mutate problemSpace
      problemSpace[0].set(newVarName, substring)
      problemSpace[1] = problemSpace[1] + 1

      
      return newVarName
    })
  }

  return [newExpWithoutNegs, problemSpace]
  // const shouldBeObserved = (indx: number) => {
  //   return (/.*[+-\/\*]\s*$|^$/.test(expression.substring(0, indx)) &&
  //     /^(\d.*|[a-z].*)/.test(expression.substring(indx + 1)))
  // }

  // const getTokenEndIdx: (i: number) => number = (i: number) => {
  //   let it = i + 1
  //   for (; it < expression.length; ++it)
  //     if (!/\d|[a-z]/.test(expression[it])) return it

  //   return it
  // }

  // const lastIndexOfNeg = expression.lastIndexOf("-")
  // if (lastIndexOfNeg != -1 && shouldBeObserved(lastIndexOfNeg)) {
  //   const tokenEndIdx: number = getTokenEndIdx(lastIndexOfNeg)
  //   const newVariable = "n" + problemSpace[1].toString()
  //   const subString = expression.substring(lastIndexOfNeg + 1, tokenEndIdx)
  //   const newProblemSpace: ProblemSpace = [problemSpace[0].set(newVariable, subString), problemSpace[1] + 1]

  //   // 2 + -3 + 7 becomes 2 + n0 + 7
  //   const newString = expression.substring(0, lastIndexOfNeg) + newVariable + expression.substring(tokenEndIdx)
  //   return removeNegs(newString, newProblemSpace)
  // }
  // else return [expression, problemSpace]

}



function removeParenthesis(expression: string, problemSpace: ProblemSpace): [string, ProblemSpace] {
  const getClosingIndex: (index: number) => number = (index: number) => {
    for (let i = index; i < expression.length; ++i) {
      if (expression[i] == ')') return i
    }
    return -1
  }

  const lastOpenedParen = expression.lastIndexOf("(")
  if (lastOpenedParen !== -1) {
    const matchingClosingParen = getClosingIndex(lastOpenedParen + 1)

    const subString = expression.substring(lastOpenedParen + 1, matchingClosingParen)
    const newVariable = "p" + problemSpace[1].toString()
    const newProblemSpace: ProblemSpace = [problemSpace[0].set(newVariable, subString), problemSpace[1] + 1]

    // 2 + (1 + 3) + 7 becomes 2 + p0 + 7
    const newString = expression.substring(0, lastOpenedParen) + newVariable + expression.substring(matchingClosingParen + 1)
    return removeParenthesis(newString, newProblemSpace)
  }
  else return [expression, problemSpace]
}


console.log(calc("(123.45*(678.90 / (-2.5+ 11.5)-(((80 -(19))) *33.25)) / 20) - (123.45*(678.90 / (-2.5+ 11.5)-(((80 -(19))) *33.25)) / 20) + (13 - 2)/ -(-11)"))
console.log(calc('123.45*(678.90 / (-2.5+ 11.5)-(80 -19) *33.25) / 20 + 11'))

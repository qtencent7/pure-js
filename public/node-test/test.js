

const template = 
`<div>
    <div class var="container">
        <input placeholder type var="input"/>
        <input type value onclick var="button"/>
    </div>
    <div>
        <div for="videos">
            <h1>#title#</h1>
            <video src controls></video>
        </div>       
    </div>
</div>`

import html2any, { parse, transform } from 'html2any'

const html = `<div>123</div>`

const ast = parse(template)[0]

function rule(node, children) {
  return node
}

const vdom = transform(ast, rule)
console.log(vdom)
// JSX vdom form of html
// { type: 'div', props: {...}, children: '...' }

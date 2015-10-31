(function() {
	"use strict"

	let esprima = require('esprima')
	let _ = require('lodash')

	let check_func_call = (param,body) => {
		let shadowed = false
		return _.any(body,(expr) => {
			if (shadowed) return

			if (expr.type == "ExpressionStatement") {
				if (expr.expression.type == "CallExpression") {
					let callee = expr.expression.callee
					if (callee.type == "Identifier" && callee.name == param) {
						return true
					}
				}
			}
			else if (expr.type == "BlockStatement") {
				return check_func_call(param,expr.body)
			}
			else if (expr.type == "VariableDeclaration" && _.any(expr.declarations,(decl) => decl.type == "VariableDeclarator" && decl.id.type == "Identifier" && decl.id.name == param)) {
				shadowed = true
			}
		})
	}

	let test = (func) => {
		let ast = esprima.parse(String(func))	
		let body = ast.body[0]

		let main = (body) => {
			let fns = _.filter(body.params,(p) => p.type == "Identifier" && check_func_call(p.name,body.body.body))

			let find_modules = (body) => {
				if (body.type == "BlockStatement") {
					return _.compact(_.flatten(body.body.map((b) => find_modules(b))))
				} else if (body.type == "VariableDeclaration") {
					return _.compact(_.flatten(body.declarations.map((decl) => {
						let init = decl.init
						if (init && init.type == "CallExpression" && init.callee.type == "Identifier" && init.callee.name == "require") {
							return init.arguments[0].value
						}
					})))
				}
			}

			let meta = {
				fns : fns.map((fn) => fn.name),
				modules : find_modules(body.body)
			}
			console.log(meta)
		}
		if (body.type == "ExpressionStatement") {
			if (body.expression.type == "ArrowFunctionExpression") {
				main(body.expression)
			}		
		} else if (body.type == "FunctionDeclaration") {
			main(body)
		}
		// console.log(JSON.stringify(ast,null,2))
	}

	let target = (next) => {
		let _ = require('lodash')
		_.any()
		next()
	}

	test(target)

	function hello(a,b,next) {
		let _ = require('lodash')
		_.any()
		next()
	}
	test(hello)
})()

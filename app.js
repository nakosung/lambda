(function() {
	"use strict"

	let _ = require('lodash')
	let dnode = require('dnode')
 
	let lambda = (path) => {
		let m = require(path) 

		let AdmZip = require('adm-zip')  

		let zip = new AdmZip()

		zip.addLocalFolder(path)

		let buf = zip.toBuffer()

		let wrap = (k,fn) => {
			return function () {
				let array = Array.prototype.slice.call(arguments)
				
				return new Promise((resolve,reject) => {
					let d = dnode.connect(3030)
					d.on('remote',(remote) => { 
						remote.buf(buf.toString('base64'),() => {
							remote.hello(path,k,array,(err,result) => {
								if (err) {
									reject(err)
								} else {
									resolve(result)
								}
							})	
						})
					})
					d.on('error',(err) => {
						reject(err)
					})
				})
			} 	
		}
		let o = {}
		_.each(m,(v,k) => o[k] = wrap(k,v))
		return o
	}
		
	let remote_mul = lambda('./lambda')

	let kick = () => {
		remote_mul.mul(2,3).then((result) => {
			console.log(result)
			return remote_mul.add(3,4)
		}).then((result) => {
			console.log(result)
		}).catch((err) => {
			console.error(err)
		}).then(() => {
			setTimeout(kick,3000)
		})
	}

	kick()

})()

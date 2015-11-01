(function () {
	"use strict"

	let path = require('path')
	let dnode = require('dnode')
	let AdmZip = require('adm-zip')
	let rimraf = require('rimraf')
	let mkdirp = require('mkdirp')
	let _ = require('lodash')
	let org = null
	let server = dnode({
		buf:(buf,next) => { 
			let zip = new AdmZip(new Buffer(buf,'base64'))
			
			rimraf.sync("./tmp",{})
			mkdirp.sync("./tmp")
			zip.extractAllTo("./tmp",true)
			next()
		},
		hello:(m,k,args,next) => {
			try {
				let keys = _.keys(require.cache)
				org = org || keys
				_.difference(keys,org).forEach((key) => delete require.cache[key])
				let M = require('./tmp')
				let result = M[k].apply(null,args)
				next(null,result)	
			} 
			catch (E) {
				next(E)
			}
		}
	})
	server.listen(3030)
})()
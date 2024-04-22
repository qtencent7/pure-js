const fs = require('fs')
const path = require('path')

const filePath = path.resolve(__dirname, "public")
fs.watch(filePath, (event, filename)=>{
    console.log(`${path.resolve(filePath, filename)}文件发生更新`)
})

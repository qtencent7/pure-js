const fs = require('fs');
const path = require('path');
const videos = [{
    name: "搞笑",
    title: "视频一",
    src: "1.mp4"
},{
    name: "娱乐",
    title: "视频二",
    src: "2.mp4"
}]
const templatePath = path.join(__dirname, 'public', 'template_try', 'video.tp');
function renderToHtml(template) {
    const reg1 = /(div)\sfor=\"([a-z]*)\"/
    template.replace(reg1, function(p0, p1, p2) {
        console.log(p2)
        
    })
}
fs.readFile(templatePath, 'utf8', (err, data) => {
    const template = data.toString()
    renderToHtml(template)
})


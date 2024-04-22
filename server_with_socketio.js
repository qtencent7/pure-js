const { Server } = require('http')
const path = require('path')
const fs = require('node:fs');
const crypto = require('crypto');
const { Buffer } = require('node:buffer');
const { Server: ServerIO } = require('socket.io');

// 获取public文件夹的坐标
const publicDir = path.join(__dirname, 'public')

const server = new Server()

const io = new ServerIO(server);

io.on('connection', (socket) => {
    console.log('a user connected');
});
server.on('request', (req, res) => {
    const url = req.url
    filename = url.split('/').pop()

    // 读取public文件夹下的文件
    const file = path.join(publicDir, filename)

    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' })
            res.end('404 Not Found')
            return

        }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        let str = data.toString()
        str = str.replace('<section></section>', `<script type="module">
            import { io } from "socket.io-client";
            const socket = io('ws://localhost:3000');
            socket.on("reload", (...args) => {
                window.location.reload()
            });
            </script>`
        )
        res.end(str)
    })
})
server.listen(3000, async () => {

    // 监听filename这个文件的变化
    const filePath = path.resolve(__dirname, "public")
    fs.watch(filePath, (event, filename) => {
        console.log(`${path.resolve(filePath, filename)}文件发生更新`)
        io.emit("hello");
    })
    console.log('Server is running on http://localhost:3000')
})


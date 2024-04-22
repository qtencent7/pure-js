const { Server } = require('http')
const path = require('path')
const fs = require('node:fs');
const crypto = require('crypto');
const { Buffer } = require('node:buffer');

const window = {
    changeFile: false
}

// 获取public文件夹的坐标
const publicDir = path.join(__dirname, 'public')
let ws = null
const server = new Server()
server.on('upgrade', (req, socket, head) => {
    // 检查是否是 WebSocket 握手
    if (req.headers['upgrade'] !== 'websocket') {
        socket.destroy();
        return;
    }

    // 解析 WebSocket 握手请求的键
    const key = req.headers['sec-websocket-key'];
    const accept = crypto.createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
        .digest('base64');

    // 设置 WebSocket 握手响应头
    const responseHeaders = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${accept}`
    ];

    // 发送握手响应
    socket.write(responseHeaders.concat('\r\n').join('\r\n'));
    // socket.pipe(socket); // Echo back

    // 这里可以添加更多的逻辑来处理 WebSocket 消息
    ws = socket
    socket.on('error', function(error) {
        console.log("WebSocket error: " + error);
    })
    // socket.on('data', (data) => {
    //     console.log('Received WebSocket message:', data);
    //     while (true) {
    //         if (window.changeFile) {
    //             socket.write('reload')
    //             window.changeFile = false
    //         }
    //     }
    // })
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
        str = str.replace('<section></section>', `<script>
            address = 'ws://localhost:3000'
            socket = new WebSocket(address)
            socket.onopen = function () {
                socket.send("Hello server!")
                console.log('WebSocket connection established.');
            };
            socket.onmessage = function(msg) { 
                console.log("Message from server ", msg)
                msg.data === 'reload' && window.location.reload() 
            }
            console.log('Live reload enabled.')
            </script>`
        )
        res.end(str)
    })
})
server.listen(3000, async () => {

    // 监听filename这个文件的变化
    const filePath = path.resolve(__dirname, "public")
    fs.watch(filePath, (event, filename) => {
        window.changeFile = true
        console.log(`${path.resolve(filePath, filename)}文件发生更新`)
        const message = Buffer.from('reload')
        ws && ws.write(frameMessage(message))
    })
    console.log('Server is running on http://localhost:3000')
})

function frameMessage(message) {
    const frame = Buffer.alloc(message.length + 2);
    frame[0] = 0x81; // Text frame, FIN set
    frame[1] = message.length;
    message.copy(frame, 2);
    return frame;
}
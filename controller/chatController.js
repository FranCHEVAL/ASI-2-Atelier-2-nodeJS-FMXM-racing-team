import { getIO } from "../socketServer";

class ChatController {

    init(socket) {

        const io = getIO()

        socket.on('join',(roomPayload) => {
            socket.join(roomPayload.sender);
            console.log("User " + roomPayload.sender+ "is listening for new messages ")
            const chat = chatHistory.filter(
              x=>(x.sender==roomPayload.sender
              &&x.receiver==roomPayload.receiver)||
              (x.sender==roomPayload.receiver
                &&x.receiver==roomPayload.sender)
            )
            io.to(roomPayload.sender).emit('loadChatHistory', chat)
        })
        
        socket.on('sendMessage', (data) => {
            chatHistory.push(data)
            
            io.to(data.receiver).emit('receiveMessage', data);
        });
    }
    
}

export default new ChatController()
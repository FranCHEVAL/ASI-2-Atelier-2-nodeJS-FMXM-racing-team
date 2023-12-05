import chatService from "../service/chatService.js";
import userService from "../service/userService.js";

class ChatController {

    init(socket ,user) {

        socket.on('join',() => {
            chatService.joinRoom(socket, user.id)
            userService.loadOnlineUser(user.id)
        }) 

        socket.on('askChatHistory', (distantUserId) =>{
            chatService.loadChatHistory(user.id, distantUserId)
        })
        
        socket.on('sendMessage', (data) => {
            chatService.sendMessage(data)
        });
    }
    
}

export default new ChatController()
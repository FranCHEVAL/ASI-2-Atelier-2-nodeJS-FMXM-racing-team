import chatService from "../service/chatService";
import userService from "../service/userService";

class ChatController {

    init(socket ,user) {

        socket.on('join',() => {
            chatService.joinRoom(user.id)
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
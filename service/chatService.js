import {getIO} from "../socketServer.js";

//TO DO : Relier le Chat Manager au Backend Spring Boot pour sauvegarder les messages en BDD

class ChatService {
    
    constructor() {
        this.chatHistory = []; // Stocke l'intégralité des messages
    }

    joinRoom(socket, userId){
        socket.join(userId);
        console.log("User " + userId+ "is listening for new messages ");
    }

    loadChatHistory(sender, receiver){
        const chat = this.chatHistory.filter(
            x=>(x.sender==sender
            &&x.receiver==receiver)||
            (x.sender==receiver
              &&x.receiver==sender)
        );
        getIO().to(sender).emit('loadChatHistory', chat);
    }

    sendMessage(data){
        this.chatHistory.push(data)
        getIO().to(data.receiver).emit('receiveMessage', data);
        console.log("User " + data.sender+ "send a message to " + data.receiver + " : " + data.content);
    }
}

export default new ChatService();
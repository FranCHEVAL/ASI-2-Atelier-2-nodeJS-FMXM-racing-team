import { uuid } from 'uuidv4';
import {getIO} from "../socketServer.js";

//TO DO : Relier le Chat Manager au Backend Spring Boot pour sauvegarder les messages en BDD

class ChatService {
    
    constructor() {
        this.chatHistory = new Map(); // Stocke l'intégralité des messages
    }

    joinRoom(roomPayload, socket){
        return '1'
    }

    sendMessage(data, socket){
        return '2'
    }
}

export default new ChatService();
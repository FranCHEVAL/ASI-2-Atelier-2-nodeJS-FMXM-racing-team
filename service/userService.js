import { getIO } from "../socketServer.js";
import apiCallService from "./ApiCallService.js";

class UserService {

    constructor() {
        this.onlineUsers = []
    }

    async getUser(id) {
        const user = await apiCallService.getUser(id)
        if (user) {
            this.onlineUsers.push(user)
            return user
        }
    }

    loadOnlineUser(user){
        const onlineUsers = this.onlineUsers.filter(x=>x!==user)
        getIO().to(user.id).emit('onLoadOnlineUser', onlineUsers)
    }

    authenticate(idUser) {
        //TO DO : check if user exist
        return undefined;
    }
}

const userService = new UserService();

export default userService;
import { getIO } from "../socketServer.js";
import apiCallService from "./ApiCallService.js";

class UserService {

    constructor() {
        this.onlineUsers = []
    }

    async getUser(id) {
        try {
            const user = await apiCallService.getUser(id)
            if (user) {
                this.onlineUsers.push(user)
                return user
            }
        } catch (error) {
            console.error(`Error fetching user with id ${id}:`, error);
            return null
        }
    }

    loadOnlineUser(user){
        const onlineUsers = this.onlineUsers.filter(x=>x!==user)
        getIO().to(user.id).emit('onLoadOnlineUser', onlineUsers)
    }

    async authenticate(idUser) {
        return await this.getUser(idUser);
    }
}

const userService = new UserService();

export default userService;
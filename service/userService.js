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

}

const userService = new UserService();

export default userService;
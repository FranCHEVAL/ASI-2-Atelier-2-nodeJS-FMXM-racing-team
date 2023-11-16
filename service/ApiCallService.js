import axios from "axios";
import { PROXYLINK, CARD } from "../public/constants.js";

class ApiCallService {
    constructor() {
        this.baseUrl = PROXYLINK + '/' + CARD;
        this.client = axios.create({ baseURL: this.baseUrl });
    }

    async getUser(id) {
        try {
            const response = await this.client.get(`/user/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user with id ${id}:`, error);
            throw error;
        }
    }

    async getCard(id) {
        try {
            const response = await this.client.get(`/card/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching card with id ${id}:`, error);
            throw error;
        }
    }
}

export default new ApiCallService();
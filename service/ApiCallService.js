import axios from "axios";
import { BACKLINK, CARD } from "../public/constants";

class ApiCallService {
    constructor() {
        this.baseUrl = BACKLINK + '/' + CARD;
        this.client = axios.create({ baseURL: this.baseUrl });
    }

    async getAllCards() {
        try {
            const response = await this.client.get('/cards');
            return response.data;
        } catch (error) {
            console.error('Error fetching all cards:', error);
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

export default ApiCallService;
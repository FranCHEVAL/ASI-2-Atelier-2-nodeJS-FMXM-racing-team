import axios from "axios";
import {CARD, PROXYLINK, USER} from "../public/constants.js";

class ApiCallService {
    constructor() {
        this.baseUrl = PROXYLINK + '/';
        this.client = axios.create({ baseURL: this.baseUrl });
    }

    async getUser(id) {
        try {
            const url = this.baseUrl + USER + `/user/${id}`;
            console.log(`Requesting: ${url}`);
            const response = await fetch(url);

            if (!response.ok) {
                console.log(response);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching user with id ${id}:`, error);
            return null;
        }
    }

    async getCard(id) {
        try {
            const response = await this.client.get(CARD + `/cards/user_id/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching card with id ${id}:`, error);
            throw error;
        }
    }
}

export default new ApiCallService();
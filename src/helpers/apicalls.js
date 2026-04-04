import axios from "axios"
import {constants} from "./constants"

const apiHelper = async ({ url, method = 'GET', data = null, headers = {} }) => {
    console.log({API_URL: constants.API_URL})
    const token = localStorage.getItem('it_token')
    try {
        const config = {
            url: constants.API_URL + url, // Full URL
            method: method.toUpperCase(), // Ensure method is uppercase
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.data = data; // Axios expects the payload in the 'data' property
        }

        console.log("CALLING API WITH CONFIG :: ", config);

        const response = await axios(config);

        console.log("API RESPONSE :: ", response);

        return response.data;

    } catch (error) {
        console.error('Error in API call:', url, error);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Response Status:', error.response.status);
            console.error('Error Response Headers:', error.response.headers);

            throw {
                message: `HTTP error! Status: ${error.response.status}`,
                status: error.response.status,
                data: error.response.data,
            };
        } else if (error.request) {
            console.error('Error Request:', error.request);
            throw new Error('Network error: No response received from server.');
        } else {
            console.error('Error Message:', error.message);
            throw new Error(`API setup error: ${error.message}`);
        }
    }
};

export default { apiHelper }
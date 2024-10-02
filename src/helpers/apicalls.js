import axios from "axios"
import constants from "./constants"


const apiHelper = async ({url, method = 'GET', data = null, headers = {}}) => {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        if (data) {
            options.body = JSON.stringify(data); // Stringify the data for POST/PUT requests
        }

        const response = await axios(url, options);
        console.log("url : ", url ,", response  ::: ", response )
        if (!response.ok) {
            // If response is not OK, throw an error
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json(); // Assuming API returns JSON
        return result;
    } catch (error) {
        console.error('Error in API call:', error);
        throw error; // Optionally rethrow to handle it in the component
    }
}

let toExport = {
    apiHelper
}
export default toExport
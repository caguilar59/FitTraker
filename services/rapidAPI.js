const axios = require("axios");

const getExercises = async () => {
    try {
        const response = await axios.get(
            "rapidapi.com",
            {
                headers: {
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "RapidAPI Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

module.exports = {
    getExercises
};
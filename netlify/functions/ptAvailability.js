// netlify/functions/ptAvailability.js

import fetch from "node-fetch";

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);

        const response = await fetch(
            "https://rails-cbe.goibibo.com/v1/search/refreshAvailabilty?flavour=dweb",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Pokus-State": '{"24HOUR":true}',
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "*/*"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ success: true, response: data })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: err.message })
        };
    }
};

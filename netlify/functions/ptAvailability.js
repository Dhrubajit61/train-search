export async function handler(event) {
    try {
        const body = JSON.parse(event.body);

        const res = await fetch(
            "https://rails-cbe.goibibo.com/v1/search/refreshAvailability?flavour=dweb",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        const data = await res.json();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify(data)
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}

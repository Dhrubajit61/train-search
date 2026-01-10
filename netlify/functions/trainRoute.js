export async function handler(event) {
    const trainNo = event.queryStringParameters.trainNo;

    if (!trainNo) {
        return {
            statusCode: 400,
            body: "trainNo required"
        };
    }

    const res = await fetch(
        `https://www.confirmtkt.com/train-schedule/${trainNo}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        }
    );

    const html = await res.text();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/html"
        },
        body: html
    };
}

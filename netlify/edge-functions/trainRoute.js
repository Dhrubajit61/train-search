export default async (request) => {
    // 👇 ADD IT HERE (top of the function)
    console.log("Edge function hit");
    const url = new URL(request.url);
    const trainNo = url.searchParams.get("trainNo");

    if (!trainNo) {
        return new Response("trainNo required", { status: 400 });
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

    return new Response(html, {
        headers: { "Content-Type": "text/html" }
    });
};

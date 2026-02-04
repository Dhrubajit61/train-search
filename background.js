chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.action === "fetchPT") {
        try {
            const res = await fetch(
                "https://rails-cbe.goibibo.com/v1/search/refreshAvailabilty?flavour=dweb",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Pokus-State": '{"24HOUR":true}',
                        "Accept": "*/*",
                        "Cookie": msg.cookies
                    },
                    body: JSON.stringify(msg.payload),
                    credentials: "include"
                }
            );

            const json = await res.json();
            sendResponse(json);
        } catch (err) {
            sendResponse({ error: err.toString() });
        }
    }
    return true; // keep channel open
});

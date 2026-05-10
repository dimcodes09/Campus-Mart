const WEBHOOK_URL =
  "https://divyanshu09.app.n8n.cloud/webhook-test/product-alert";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Forwarding product request to n8n:", body);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = {
      ok: response.ok,
      status: response.status,
      message: response.ok
        ? "Product request sent"
        : "n8n test webhook is not listening",
    };

    return Response.json(data, {
      status: response.ok ? 200 : response.status,
    });
  } catch (error) {
    console.error("Product request webhook error:", error);
    return Response.json(
      { message: "Failed to send product request" },
      { status: 500 }
    );
  }
}

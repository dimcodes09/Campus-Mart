const WEBHOOK_URL = "https://divyanshu09.app.n8n.cloud/webhook-test/product-alert";

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = {
      name: body.name,
      email: body.email,
      product: body.product,
      category: body.category,
      budget: body.budget,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message =
        response.status === 404
          ? "n8n webhook not found. Activate the n8n workflow or use the webhook-test URL while listening for a test event."
          : `Product request failed with status ${response.status}`;

      return Response.json(
        { message },
        { status: response.status }
      );
    }

    return Response.json({ message: "Product request sent" });
  } catch (error) {
    console.error("Product request webhook error:", error);
    return Response.json(
      { message: "Failed to send product request" },
      { status: 500 }
    );
  }
}

export const generateEmbeddings = async (
  text: string
): Promise<number[] | null> => {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    console.error("VOYAGE_API_KEY environment variable not set.");
    return null;
  }

  const url = "https://api.voyageai.com/v1/embeddings";
  const model = "voyage-3-large";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: model,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `Voyage API error: ${response.status} ${response.statusText}`,
        errorData
      );
      return null; // Or throw an error
    }

    const data = await response.json();
    console.log(data);
    if (data.data && data.data.length > 0 && data.data[0].embedding) {
      return data.data[0].embedding;
    } else {
      console.error("Voyage API response format unexpected:", data);
      return null;
    }
  } catch (error) {
    console.error("Error calling Voyage API:", error);
    return null; // Or throw the error
  }
};

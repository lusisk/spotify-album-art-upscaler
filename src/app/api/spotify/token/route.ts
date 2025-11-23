import axios from "axios";
import { SPOTIFY_API } from "@/config/constants";
import { ApiResponse } from "@/utils/api-response";

export async function GET() {
  try {
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const { data } = await axios.post(
      SPOTIFY_API.TOKEN,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return ApiResponse.success({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("Token fetch error:", error);
    return ApiResponse.serverError("Failed to get access token");
  }
}

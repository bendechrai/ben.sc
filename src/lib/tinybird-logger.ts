interface IPGeolocationSuccess {
  ip: string;
  continent_code: string;
  continent_name: string;
  country_code2: string;
  country_code3: string;
  country_name: string;
  state_prov: string;
  city: string;
  latitude: string;
  longitude: string;
  isp: string;
  organization: string;
  time_zone: {
    name: string;
    offset: number;
  };
}

interface IPGeolocationError {
  message: string;
}

type IPGeolocationResponse = IPGeolocationSuccess | IPGeolocationError;

interface TinyBirdEvent {
  // Base data
  shortcode: string;
  destination: string;
  referrer: string | null;
  useragent: string | null;
  ipaddress: string;
  timestamp: string;

  // Geolocation data
  ip: string;
  continent_code: string | null;
  continent_name: string | null;
  country_code2: string | null;
  country_code3: string | null;
  country_name: string | null;
  state_prov: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  isp: string | null;
  organization: string | null;
  timezone_name: string | null;
  timezone_offset: number | null;
}

function isGeolocationError(
  data: IPGeolocationResponse
): data is IPGeolocationError {
  return "message" in data;
}

async function sendToTinybird(
  eventData: TinyBirdEvent,
  apiKey: string
): Promise<void> {
  const response = await fetch(
    "https://api.us-east.aws.tinybird.co/v0/events?name=url_redirect_click_with_geolocation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(eventData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `TinyBird API error (${response.status}): ${response.statusText}. Details: ${errorText}`
    );
  }
}

export async function logClickToTinybird(
  shortcode: string,
  destination: string,
  request?: Request
) {
  const tinybirdAPIKey = process.env.TINYBIRD_API_KEY;
  const ipgeolocationAPIKey = process.env.IPGEOLOCATION_API_KEY;

  if (!tinybirdAPIKey || !ipgeolocationAPIKey) {
    console.error("Missing required API keys");
    return;
  }

  try {
    // Get client information from request
    const ipAddress =
      request?.headers.get("x-forwarded-for")?.split(",")[0] ||
      request?.headers.get("x-real-ip") ||
      "0.0.0.0";
    const userAgent = request?.headers.get("user-agent") ?? null;
    const referrer = request?.headers.get("referer") ?? null;

    // Prepare base event data
    const baseEventData = {
      shortcode,
      destination,
      referrer,
      useragent: userAgent,
      ipaddress: ipAddress,
      timestamp: new Date().toISOString(),
    } as const;

    // Only attempt geolocation for non-local IPs
    if (
      ipAddress === "0.0.0.0" ||
      ipAddress === "127.0.0.1" ||
      ipAddress === "::1" ||
      ipAddress.startsWith("169.254.") ||
      ipAddress.startsWith("fc00:") ||
      ipAddress.startsWith("fe80:")
    ) {
      console.log(`Skipping geolocation for local/bogon IP: ${ipAddress}`);

      // Log event with just the base data and null geo fields
      const eventData: TinyBirdEvent = {
        ...baseEventData,
        ip: ipAddress,
        continent_code: null,
        continent_name: null,
        country_code2: null,
        country_code3: null,
        country_name: null,
        state_prov: null,
        city: null,
        latitude: null,
        longitude: null,
        isp: null,
        organization: null,
        timezone_name: null,
        timezone_offset: null,
      };

      await sendToTinybird(eventData, tinybirdAPIKey);
      return;
    }

    // Fetch geolocation data for non-local IPs
    const geoResponse = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${ipgeolocationAPIKey}&ip=${ipAddress}`
    );

    const geoData = (await geoResponse.json()) as IPGeolocationResponse;

    if (!geoResponse.ok || isGeolocationError(geoData)) {
      console.warn(
        `Geolocation API warning for IP ${ipAddress}:`,
        isGeolocationError(geoData) ? geoData.message : geoResponse.statusText
      );

      // Log event with just the base data and null geo fields
      const eventData: TinyBirdEvent = {
        ...baseEventData,
        ip: ipAddress,
        continent_code: null,
        continent_name: null,
        country_code2: null,
        country_code3: null,
        country_name: null,
        state_prov: null,
        city: null,
        latitude: null,
        longitude: null,
        isp: null,
        organization: null,
        timezone_name: null,
        timezone_offset: null,
      };

      await sendToTinybird(eventData, tinybirdAPIKey);
      return;
    }

    // If we got here, we have valid geolocation data
    const eventData: TinyBirdEvent = {
      ...baseEventData,
      ip: geoData.ip,
      continent_code: geoData.continent_code,
      continent_name: geoData.continent_name,
      country_code2: geoData.country_code2,
      country_code3: geoData.country_code3,
      country_name: geoData.country_name,
      state_prov: geoData.state_prov,
      city: geoData.city,
      latitude: Number.isNaN(parseFloat(geoData.latitude)) ? null : parseFloat(geoData.latitude),
      longitude: Number.isNaN(parseFloat(geoData.longitude)) ? null : parseFloat(geoData.longitude),
      isp: geoData.isp,
      organization: geoData.organization,
      timezone_name: geoData.time_zone?.name ?? null,
      timezone_offset: geoData.time_zone?.offset ?? null,
    };

    await sendToTinybird(eventData, tinybirdAPIKey);
    console.log("Click logged to TinyBird successfully with geolocation data");
  } catch (error) {
    console.error(
      "Error logging click to TinyBird:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

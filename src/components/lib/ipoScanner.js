import { base44 } from '@/api/base44Client';

const COMMON_SCHEMA = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    value: { type: 'string' },
    value_hkd: { type: 'number' },
    url: { type: 'string' },
    date: { type: 'string' }
  }
};

export async function fetchHKEXListings() {
  const response = await base44.integrations.Core.InvokeLLM({
    add_context_from_internet: true,
    prompt: `You are a financial data analyst specialising in Hong Kong IPOs. Search the HKEXnews website (www1.hkexnews.hk) and related financial news for the most recent Hong Kong Stock Exchange listing applications (Application Proofs, OC Announcements) filed in the last 6 months. Focus on ACTIVE and LISTED applications on the Main Board and GEM board.

For each filing found, extract:
- filing_date: the posting date in YYYY-MM-DD format
- issuer_name_en: issuer name in English
- issuer_name_chi: issuer name in Chinese (if available, else empty string)
- stock_code: stock code if assigned (digits only, else empty string)
- board: "main_board" or "gem"
- status: "active", "inactive", "listed", or "returned"
- sponsor_oc_names: array of ALL sponsor and overall coordinator (OC) names mentioned
- source_url: URL to the filing on hkexnews.hk
- prospectus_url: direct URL to the application proof document if available

Find as many as possible (aim for 15-25). Return ONLY valid JSON.`,
    response_json_schema: {
      type: 'object',
      properties: {
        ipos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filing_date: { type: 'string' },
              issuer_name_en: { type: 'string' },
              issuer_name_chi: { type: 'string' },
              stock_code: { type: 'string' },
              board: { type: 'string' },
              status: { type: 'string' },
              sponsor_oc_names: { type: 'array', items: { type: 'string' } },
              source_url: { type: 'string' },
              prospectus_url: { type: 'string' }
            }
          }
        }
      }
    }
  });
  return response.ipos || [];
}

export async function crossCheckIPOSize(issuerName, stockCode) {
  const response = await base44.integrations.Core.InvokeLLM({
    add_context_from_internet: true,
    prompt: `You are a financial data analyst cross-checking IPO offering sizes from multiple independent sources.

Company: ${issuerName}
Hong Kong Stock Code: ${stockCode || 'Not yet assigned'}

Search multiple financial news and data sources for the IPO offering size (total amount to be raised, including over-allotment if stated). Check AT LEAST 3 of these sources:
1. The company's prospectus / application proof on HKEXnews (hkexnews.hk)
2. Reuters
3. Bloomberg
4. Financial Times
5. Dealogic / Refinitiv
6. Major financial news outlets (AAStocks, ETNet, SCMP, The Standard)

For each source that reports the IPO size, extract: source name, the reported value in original currency, converted value in HKD (use exchange rate ~7.8 HKD/USD if needed), the source URL, and the publication date.

Determine: best_estimate_hkd (your best estimate in HKD) and confidence: "high" if 3+ sources agree within 10%, "medium" if 2 sources, "low" if 1 source, "unverified" if none found.`,
    response_json_schema: {
      type: 'object',
      properties: {
        sources: { type: 'array', items: COMMON_SCHEMA },
        best_estimate_hkd: { type: 'number' },
        confidence: { type: 'string' }
      }
    }
  });
  return response;
}

export async function crossCheckMarketCap(issuerName, stockCode) {
  const response = await base44.integrations.Core.InvokeLLM({
    add_context_from_internet: true,
    prompt: `You are a financial data analyst cross-checking market capitalisation from multiple independent sources.

Company: ${issuerName}
Hong Kong Stock Code: ${stockCode || 'Not yet assigned'}

Search multiple financial data sources for the existing market capitalisation of this company. Check AT LEAST 3 of these sources:
1. Yahoo Finance
2. Google Finance
3. Reuters
4. Bloomberg
5. AAStocks / ETNet (Hong Kong financial portals)
6. The company's prospectus or recent financial reports on HKEXnews

For each source, extract: source name, the reported market cap value in original currency, converted value in HKD, the source URL, and the date of the data.

Determine: best_estimate_hkd (your best estimate in HKD) and confidence: "high" if 3+ sources agree within 10%, "medium" if 2 sources, "low" if 1 source, "unverified" if none found.

If the company is not yet listed (pre-IPO), search for the estimated post-listing market cap or implied valuation from the prospectus and news sources.`,
    response_json_schema: {
      type: 'object',
      properties: {
        sources: { type: 'array', items: COMMON_SCHEMA },
        best_estimate_hkd: { type: 'number' },
        confidence: { type: 'string' }
      }
    }
  });
  return response;
}

export async function crossCheckIPO(ipo) {
  const [sizeData, capData] = await Promise.all([
    crossCheckIPOSize(ipo.issuer_name_en, ipo.stock_code),
    crossCheckMarketCap(ipo.issuer_name_en, ipo.stock_code)
  ]);
  return {
    ipo_size_hkd: sizeData.best_estimate_hkd ?? null,
    ipo_size_confidence: sizeData.confidence || 'unverified',
    ipo_size_sources: sizeData.sources || [],
    existing_market_cap_hkd: capData.best_estimate_hkd ?? null,
    market_cap_confidence: capData.confidence || 'unverified',
    market_cap_sources: capData.sources || [],
    last_scanned: new Date().toISOString()
  };
}

const axios = require("axios");

const ok = (data, code = 200) => ({ statusCode: code, data });
const fail = (message, code = 502) => ({ statusCode: code, message });
const { normIsbn, isIsbn10, isIsbn13, toIsbn13, detectIsbnInText } = require("../utils/isbnConvertions");

// ---------- Helpers  ----------

// ---------- Google Books call ----------
const parseItem = (v) => {
  const vi = v.volumeInfo || {};
  const industryIdentifiers = (vi.industryIdentifiers || []).map((ii) => ({
    type: ii.type,
    identifier: normIsbn(ii.identifier),
  }));
  return {
    id: v.id,
    title: vi.title || null,
    authors: vi.authors || [],
    publishedDate: vi.publishedDate || null,
    industryIdentifiers,
    thumbnail: vi.imageLinks?.thumbnail || null,
  };
};


const searchBooksGoogleService = async ({ q, isbn, maxResults }) => {
  try {
    const base =
      process.env.GOOGLE_BOOKS_API || "https://www.googleapis.com/books/v1";

    // 1) Resolver ISBN si corresponde
    let resolvedIsbn = null;
    if (isbn) {
      const n = normIsbn(isbn);
      if (isIsbn13(n)) resolvedIsbn = n;
      else if (isIsbn10(n)) resolvedIsbn = toIsbn13(n);
      else return fail("ISBN inválido", 400);
    } else {
      // intenta detectar en q
      const found = detectIsbnInText(q);
      if (found) resolvedIsbn = found;
    }

    // 2) Construir query final
    const query = resolvedIsbn ? `isbn:${resolvedIsbn}` : q;
    const url = `${base}/volumes?q=${encodeURIComponent(query)}&maxResults=${
      Number(maxResults) || 25
    }`;

    const { data } = await axios.get(url, { timeout: 8000 });
    const items = (data.items || []).map(parseItem);

    return ok(
      {
        query,
        resolvedIsbn, // null si fue keyword
        total: data.totalItems ?? items.length,
        viendo: (maxResults),
        items,
      },
      200
    );
  } catch (e) {
    const code = e.response?.status || 502;
    const info =
      e.response?.data?.error?.message || e.message || "External error";
    return fail(`Error consultando Google Books: ${info}`, code);
  }
};

module.exports = {
  searchBooksGoogleService
};

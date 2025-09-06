const { Book } = require("../models/book.model");
const { searchBooksGoogleService } = require("./googleBooks.services.js");
const {
  normIsbn,
  isIsbn10,
  isIsbn13,
  toIsbn13,
  detectIsbnInText,
} = require("../utils/isbnConvertions");

//helpers
const ok = (data, code = 200) => ({ statusCode: code, data });
const fail = (message, code = 500) => ({ statusCode: code, message });
const toNormalized13 = (raw) => {
  let v = normIsbn(raw);
  if (isIsbn10(v)) v = toIsbn13(v);
  return v;
};

// GET all
const getAllBooksService = async () => {
  try {
    const books = await Book.find().lean();
    const count = books.length;
    return ok({
      total:count,
      libros:books
    }, 200
    );
  } catch (e) {
    return fail(e?.message || "Error al listar libros");
  }
};

// GET by ID (MongoId)
const getBookByIdService = async (id) => {
  try {
    const book = await Book.findById(id);
    if (!book) return fail("Libro no encontrado", 404);
    return ok(book, 200);
  } catch (e) {
    return fail(e?.message || "Error al obtener libro");
  }
};

// GET by ISBN (en BD)
const getBookByIsbnService = async (isbn) => {
  try {
    const code = toNormalized13(isbn); //normaliza a 13
    const book = await Book.findOne({ isbn: code });
    if (!book) return fail("Libro no encontrado", 404);
    return ok(book, 200);
  } catch (e) {
    return fail(e?.message || "Error al obtener por ISBN");
  }
};

// POST create
const addBookService = async (payload) => {
   try {
    if (!payload?.isbn) return fail("ISBN requerido", 400);

    // 1) Normalizar crudo (quita guiones, espacios, mayúsculas)
    const raw = normIsbn(payload.isbn);

    // 2) Validar formato (aceptamos 10 - 13)
    if (!isIsbn10(raw) && !isIsbn13(raw)) {
      return fail("ISBN inválido", 400);
    }

    // 3) Convertir a 13 si vino 10 (formato único interno de la BD)
    const isbn = isIsbn10(raw) ? toIsbn13(raw) : raw;

    // 4) Verificar duplicado en BD
    const exists = await Book.findOne({ isbn });
    if (exists) return fail("ISBN ya existe", 409);

    // 5) Guardar siempre como 13 “limpio”
    const saved = await new Book({ ...payload, isbn }).save();
    return ok(saved, 201);
  } catch (e) {
    return fail(e?.message || "Error al crear libro");
  }
};

// PUT update
const updateBookService = async (id, payload) => {
  try {
    if (!payload) return fail("Body requerido", 400);

    if (payload.isbn) {
      let nextIsbn = toNormalized13(payload.isbn); // normalizar
      if (!isIsbn13(nextIsbn)) return fail("ISBN inválido", 400);
      const dup = await Book.findOne({ isbn: nextIsbn, _id: { $ne: id } });
      if (dup) return fail("Duplicate ISBN", 409);
      payload.isbn = nextIsbn; // guardar normalizado
    }

    const updated = await Book.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return fail("Libro no encontrado", 404);
    return ok(updated, 200);
  } catch (e) {
    return fail(e?.message || "Error al actualizar libro");
  }
};
// UPDATE por ISBN
const updateBookByIsbnService = async (isbn, payload) => {
  try {
    if (!payload) return fail("Body requerido", 400);
    const code = toNormalized13(isbn); //

    if (payload.isbn) {
      let nextIsbn = toNormalized13(payload.isbn);
      if (!isIsbn13(nextIsbn)) return fail("ISBN inválido", 400);

      const current = await Book.findOne({ isbn: code }); // doc actual
      if (!current) return fail("Libro no encontrado", 404);

      const dup = await Book.findOne({
        isbn: nextIsbn,
        _id: { $ne: current._id },
      });
      if (dup) return fail("Duplicate ISBN", 409);

      payload.isbn = nextIsbn;
    }

    const updated = await Book.findOneAndUpdate({ isbn: code }, payload, {
      new: true,
    });
    if (!updated) return fail("Libro no encontrado", 404);
    return ok(updated, 200);
  } catch (e) {
    return fail(e?.message || "Error al actualizar por ISBN");
  }
};

// DELETE
const deleteBookService = async (id) => {
  try {
    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) return fail("Libro no encontrado", 404);
    return ok({ deleted: true, id }, 200);
  } catch (e) {
    return fail(e?.message || "Error al borrar libro");
  }
};
// DELETE por ISBN
const deleteBookByIsbnService = async (isbn) => {
  try {
    const code = toNormalized13(isbn); // normalizar
    const deleted = await Book.findOneAndDelete({ isbn: code });
    if (!deleted) return fail("Libro no encontrado", 404);
    return ok({ deleted: true, isbn: code }, 200);
  } catch (e) {
    return fail(e?.message || "Error al borrar por ISBN");
  }
};
// POST loan
const loanBookService = async (id, { borrowerName, desiredDate } = {}) => {
  try {
    if (!borrowerName) return fail("borrowerName requerido", 400);

    const book = await Book.findById(id);
    if (!book) return fail("Libro no encontrado", 404);
    if (book.condition === "poor")
      return fail('No se puede prestar un libro en estado "poor"', 409);
    if (book.isLoaned) return fail("Libro ya prestado", 409);

    book.isLoaned = true;
    book.currentLoan = {
      borrowerName,
      loanDate: desiredDate ? new Date(desiredDate) : new Date(),
    };
    const saved = await book.save();
    return ok(saved, 200);
  } catch (e) {
    return fail(e?.message || "Error al prestar libro");
  }
};

// LOAN por ISBN
const loanBookByIsbnService = async (
  isbn,
  { borrowerName, desiredDate } = {}
) => {
  try {
    if (!borrowerName) return fail("borrowerName requerido", 400);
    const code = toNormalized13(isbn);

    const book = await Book.findOne({ isbn: code });
    if (!book) return fail("Libro no encontrado", 404);
    if (book.condition === "poor")
      return fail('No se puede prestar un libro en estado "poor"', 409);
    if (book.isLoaned) return fail("Libro ya prestado", 409);

    book.isLoaned = true;
    book.currentLoan = {
      borrowerName,
      loanDate: desiredDate ? new Date(desiredDate) : new Date(),
    };

    const saved = await book.save();
    return ok(saved, 200);
  } catch (e) {
    return fail(e?.message || "Error al prestar por ISBN");
  }
};

// POST return
const returnBookService = async (id) => {
  try {
    const book = await Book.findById(id);
    if (!book) return fail("Libro no encontrado", 404);
    if (!book.isLoaned) return fail("Libro no prestado", 409); // 👈 mensaje uniforme

    const closed = book.currentLoan
      ? {
          ...(book.currentLoan.toObject?.() ?? book.currentLoan),
          returnDate: new Date(),
        }
      : { returnDate: new Date() };

    book.loanHistory.push(closed);
    book.isLoaned = false;
    book.currentLoan = null;

    const saved = await book.save();
    return ok(saved, 200);
  } catch (e) {
    return fail(e?.message || "Error al devolver libro");
  }
};

// RETURN por ISBN
const returnBookByIsbnService = async (isbn) => {
  try {
    const code = toNormalized13(isbn);
    const book = await Book.findOne({ isbn: code });
    if (!book) return fail("Libro no encontrado", 404);
    if (!book.isLoaned) return fail("Libro no prestado", 409);

    const closed = book.currentLoan
      ? {
          ...(book.currentLoan.toObject?.() ?? book.currentLoan),
          returnDate: new Date(),
        }
      : { returnDate: new Date() };

    book.loanHistory.push(closed);
    book.isLoaned = false;
    book.currentLoan = null;

    const saved = await book.save();
    return ok(saved, 200);
  } catch (e) {
    return fail(e?.message || "Error al devolver por ISBN");
  }
};

// Búsqueda unificada:
const searchBooksUnifiedService = async ({
  q,
  isbn,
  maxResults,
  includeLocal,
  onlyLocal,
  onlyMissing,
}) => {
  try {
    // 1) Google
    const ext = await searchBooksGoogleService({ q, isbn, maxResults });
    if (ext.statusCode !== 200) return ext;

    const { query, resolvedIsbn } = ext.data;
    const googleItems = ext.data.items || [];

    // 2) Reunir ISBNs de Google ya normalizados
    const allIsbns = new Set();
    for (const it of googleItems) {
      for (const ii of it.industryIdentifiers || []) {
        const n = toNormalized13(ii.identifier); //  asegura 13
        if (n && isIsbn13(n)) allIsbns.add(n);
      }
    }

    // 3) Mapear coincidencias locales por ISBN
    let localByIsbn = {};
    if (allIsbns.size) {
      const locals = await Book.find(
        { isbn: { $in: Array.from(allIsbns) } },
        { _id: 1, isbn: 1 }
      ).lean();

      localByIsbn = locals.reduce((acc, b) => {
        acc[normIsbn(b.isbn)] = b._id.toString();
        return acc;
      }, {});
    }

    // 4) Enriquecer items de Google con flags
    let merged = googleItems.map((it) => {
      const ids = it.industryIdentifiers || [];
      const match = ids.find((ii) => localByIsbn[normIsbn(ii.identifier)]);
      return {
        ...it,
        inLocalDb: Boolean(match),
        localId: match ? localByIsbn[normIsbn(match.identifier)] : null,
      };
    });

    // 5) Filtros opcionales sobre Google
    if (onlyLocal) {
      merged = merged.filter((x) => x.inLocalDb);
    } else if (onlyMissing) {
      merged = merged.filter((x) => !x.inLocalDb);
    }

    // 6) (Opcional) Buscar coincidencias locales adicionales
    let localMatches = [];
    if (String(includeLocal) === "1" || includeLocal === true) {
      const isbnFromQ = resolvedIsbn || detectIsbnInText(q);

      const or = [];
      if (isbnFromQ) {
        or.push({ isbn: normIsbn(isbnFromQ) });
      }
      if (q && q.trim().length >= 3) {
        // regex prudente (case-insensitive) sobre title
        or.push({
          title: {
            $regex: q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        });
      }

      if (or.length) {
        localMatches = await Book.find({ $or: or })
          .select({
            _id: 1,
            isbn: 1,
            title: 1,
            author: 1,
            year: 1,
            isLoaned: 1,
          })
          .limit(10)
          .lean();
      }
    }

    return ok(
      {
        query,
        resolvedIsbn,
        total: merged.length,
        items: merged,
        ...(localMatches.length ? { localMatches } : {}),
      },
      200
    );
  } catch (e) {
    return fail(e?.message || "Error en búsqueda unificada");
  }
};

module.exports = {
  getAllBooksService,
  getBookByIdService,
  getBookByIsbnService,
  addBookService,
  updateBookService,
  deleteBookService,
  loanBookService,
  returnBookService,
  updateBookByIsbnService,
  loanBookByIsbnService,
  returnBookByIsbnService,
  deleteBookByIsbnService,
  searchBooksUnifiedService,
};

(function (root, factory) {
  "use strict";

  var api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ShipCashboxScanEngine = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function () {
  "use strict";

  var CURRENCY_PATTERN = /(?:EUR|EURO|USD|GBP|RSD|DIN|HRK|BAM|CHF|JPY|CNY|RUB|\u20ac|\$|\u00a3|\u00a5)/i;
  var AMOUNT_CONTEXT_PATTERN = /\b(?:amount|amt|total|sum|balance|payment|paid|cash|price|grand|due|eur|euro|suma|ukupno|iznos|placeno|gotovina|betrag|gesamt|summe|preis|zahlung|bar|totale|importo|pagato|contanti|tarjeta|efectivo|importe)\b/i;
  var STRONG_TOTAL_CONTEXT_PATTERN = /\b(?:grand\s+total|amount\s+due|balance\s+due|total\s+due|to\s+pay|total|ukupno|za\s+platiti|iznos|gesamt|summe|totale|importe|total\s+a\s+pagar)\b|(?:итого|к\s+оплате|всего|сумма)/i;
  var WEAK_AMOUNT_CONTEXT_PATTERN = /\b(?:subtotal|sub\s+total|vat|tax|pdv|iva|mwst|discount|disc|rabatt|popust|change|refund|tip|qty|quantity|kom|pcs|kg|liter|litre|item|artikl|code|auth|approval|terminal|merchant|phone|tel|iban|swift|oib|pib|jib|tin|id|no|nr|broj|card|kartica|karte)\b/i;
  var CARD_FRAGMENT_CONTEXT_PATTERN = /(?:\*{2,}|x{2,}|card|kartica|karte|auth|approval|terminal|iban|swift|phone|tel)/i;
  var DATE_CONTEXT_PATTERN = /\b(?:date|datum|issued|issue|invoice|receipt|time|created|posted|paid|service|document|doc|racun|fecha|data|emesso)\b/i;
  var WEAK_DATE_CONTEXT_PATTERN = /\b(?:expiry|expires|valid|due|birth|dob|card|batch|terminal|auth|approval)\b/i;

  var MONTHS = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12
  };

  function normalizeOcrText(input) {
    return buildOcrBlocks(input).map(function (block) {
      return normalizeLine(block.text);
    }).filter(Boolean).join("\n");
  }

  function normalizeAmountCandidate(candidate) {
    var raw = getCandidateRaw(candidate);
    var text = normalizeLine(raw);
    var currency = detectCurrency(text);
    var numericText = text
      .replace(/[Oo]/g, replaceOcrZero)
      .replace(CURRENCY_PATTERN, " ")
      .replace(/[^\d,.'`\s+\-]/g, " ")
      .replace(/[`']/g, "")
      .replace(/\s+/g, "");

    if (/\-$/.test(numericText) && numericText.indexOf("-") === numericText.length - 1) {
      numericText = "-" + numericText.slice(0, -1);
    }

    var sign = "";
    if (/^[+\-]/.test(numericText)) {
      sign = numericText.charAt(0) === "-" ? "-" : "";
      numericText = numericText.slice(1);
    }

    if (!/\d/.test(numericText)) {
      return {
        ok: false,
        value: null,
        raw: raw,
        normalized: "",
        currency: currency,
        reasonCodes: ["amount.no_digits"]
      };
    }

    var decimalInfo = resolveDecimalSeparator(numericText);
    var normalized;
    var reasonCodes = ["amount.has_digits"];

    if (decimalInfo.separator) {
      normalized = stripThousands(numericText.slice(0, decimalInfo.index)) + "." + numericText.slice(decimalInfo.index + 1).replace(/[^\d]/g, "");
      reasonCodes.push(decimalInfo.decimalDigits === 2 ? "amount.decimal_2" : "amount.decimal");
    } else {
      normalized = numericText.replace(/[^\d]/g, "");
      reasonCodes.push("amount.integer");
    }

    normalized = sign + normalized;

    var value = Number(normalized);
    if (!isFinite(value)) {
      return {
        ok: false,
        value: null,
        raw: raw,
        normalized: normalized,
        currency: currency,
        reasonCodes: reasonCodes.concat(["amount.not_finite"])
      };
    }

    if (currency) {
      reasonCodes.push("amount.currency");
    }

    return {
      ok: true,
      value: roundMoney(value),
      raw: raw,
      normalized: normalized,
      currency: currency,
      decimalDigits: decimalInfo.decimalDigits,
      reasonCodes: reasonCodes
    };
  }

  function extractAmountCandidates(input, options) {
    var opts = options || {};
    var blocks = buildOcrBlocks(input);
    var candidates = [];

    blocks.forEach(function (block, lineIndex) {
      var text = normalizeLine(block.text);
      if (!text) {
        return;
      }

      collectAmountMatches(candidates, text, block, lineIndex, /(?:EUR|EURO|USD|GBP|RSD|DIN|HRK|BAM|CHF|JPY|CNY|RUB|\u20ac|\$|\u00a3|\u00a5)\s*[+\-]?\s*\d[\d\s,.'`]*\d?/gi, "amount.currency_before");
      collectAmountMatches(candidates, text, block, lineIndex, /[+\-]?\s*\d[\d\s,.'`]*\d?\s*(?:EUR|EURO|USD|GBP|RSD|DIN|HRK|BAM|CHF|JPY|CNY|RUB|\u20ac|\$|\u00a3|\u00a5)/gi, "amount.currency_after");
      collectAmountMatches(candidates, text, block, lineIndex, /(?:^|[^\dA-Za-z,.])([+\-]?\s*\d{1,3}(?:[\s.'`]\d{3})+[,.]\d{1,2}|[+\-]?\s*\d{1,6}[,.]\d{1,2})(?=$|[^\dA-Za-z,.])/g, "amount.decimal_number", 1);

      if (AMOUNT_CONTEXT_PATTERN.test(text)) {
        collectAmountMatches(candidates, text, block, lineIndex, /(?:^|[^\dA-Za-z,.])([+\-]?\s*\d{1,6})(?=$|[^\dA-Za-z,.])/g, "amount.context_integer", 1);
      }
    });

    return dedupeCandidates(candidates).map(function (candidate) {
      var score = scoreAmountCandidate(candidate, {
        lineCount: blocks.length,
        options: opts
      });
      return assign({}, candidate, score);
    }).sort(sortByScore);
  }

  function extractDateCandidates(input, options) {
    var opts = options || {};
    var blocks = buildOcrBlocks(input);
    var candidates = [];

    blocks.forEach(function (block, lineIndex) {
      var text = normalizeLine(block.text);
      if (!text) {
        return;
      }

      collectDateMatches(candidates, text, block, lineIndex, /(?:^|[^\d])(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})(?=$|[^\d])/g, "date.iso_numeric", function (match) {
        return parseDateParts(match[1], match[2], match[3], false, opts);
      });

      collectDateMatches(candidates, text, block, lineIndex, /(?:^|[^\d])(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})(?=$|[^\d])/g, "date.local_numeric", function (match) {
        return parseDateParts(match[3], match[2], match[1], true, opts);
      });

      collectDateMatches(candidates, text, block, lineIndex, /(?:^|[^A-Za-z])(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})(?=$|[^A-Za-z])/g, "date.month_name", function (match) {
        var month = MONTHS[String(match[2]).toLowerCase()];
        return parseDateParts(match[3], month, match[1], false, opts);
      });

      collectDateMatches(candidates, text, block, lineIndex, /(?:^|[^A-Za-z])([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{2,4})(?=$|[^A-Za-z])/g, "date.month_name", function (match) {
        var month = MONTHS[String(match[1]).toLowerCase()];
        return parseDateParts(match[3], month, match[2], false, opts);
      });
    });

    return dedupeCandidates(candidates).map(function (candidate) {
      var score = scoreDateCandidate(candidate, {
        lineCount: blocks.length,
        options: opts
      });
      return assign({}, candidate, score);
    }).sort(sortByScore);
  }

  function scoreAmountCandidate(candidate, context) {
    var normalized = normalizeAmountCandidate(candidate);
    var reasonCodes = [];
    var score = 0;
    var line = normalizeLine(candidate.context || candidate.raw || "");
    var lineCount = context && context.lineCount ? context.lineCount : null;
    var value = normalized.value;

    if (!normalized.ok) {
      return {
        score: 0,
        reasonCodes: normalized.reasonCodes.concat(["score.invalid_amount"])
      };
    }

    reasonCodes = reasonCodes.concat(normalized.reasonCodes);
    if (candidate.source) {
      reasonCodes.push(candidate.source);
    }
    score += 20;

    if (Math.abs(value) > 0) {
      score += 5;
      reasonCodes.push("score.non_zero");
    } else {
      score -= 12;
      reasonCodes.push("score.zero_penalty");
    }

    if (normalized.currency) {
      score += 16;
      reasonCodes.push("score.currency");
    }

    if (normalized.decimalDigits === 2) {
      score += 18;
      reasonCodes.push("score.money_decimals");
    } else if (normalized.decimalDigits === 1) {
      score += 8;
      reasonCodes.push("score.single_decimal");
    }

    if (AMOUNT_CONTEXT_PATTERN.test(line)) {
      score += 24;
      reasonCodes.push("score.amount_context");
    }

    if (STRONG_TOTAL_CONTEXT_PATTERN.test(line)) {
      score += 18;
      reasonCodes.push("score.strong_total_context");
    }

    if (WEAK_AMOUNT_CONTEXT_PATTERN.test(line)) {
      score -= 22;
      reasonCodes.push("score.weak_amount_context_penalty");
    }

    if (CARD_FRAGMENT_CONTEXT_PATTERN.test(line) && normalized.decimalDigits === 0) {
      score -= 38;
      reasonCodes.push("score.card_or_identifier_penalty");
    }

    if (!normalized.currency && looksLikeDateFragment(candidate.raw)) {
      score -= 30;
      reasonCodes.push("score.date_like_penalty");
    }

    if (Math.abs(value) >= 100000) {
      score -= 18;
      reasonCodes.push("score.large_value_penalty");
    }

    if (lineCount && typeof candidate.lineIndex === "number" && lineCount > 1) {
      if (candidate.lineIndex / (lineCount - 1) >= 0.55) {
        score += 6;
        reasonCodes.push("score.lower_receipt_line");
      }
    }

    var confidence = normalizeConfidence(candidate.confidence);
    if (confidence !== null) {
      score += Math.round(confidence * 10);
      reasonCodes.push("score.confidence");
    }

    return {
      score: clampScore(score),
      value: normalized.value,
      raw: normalized.raw,
      normalized: normalized.normalized,
      currency: normalized.currency,
      reasonCodes: unique(reasonCodes)
    };
  }

  function scoreDateCandidate(candidate, context) {
    var reasonCodes = [];
    var score = 0;
    var line = normalizeLine(candidate.context || candidate.raw || "");
    var lineCount = context && context.lineCount ? context.lineCount : null;

    if (!candidate || !candidate.value) {
      return {
        score: 0,
        reasonCodes: ["score.invalid_date"]
      };
    }

    score += 35;
    reasonCodes.push("date.valid", candidate.source || "date.candidate");

    if (candidate.hasFourDigitYear) {
      score += 12;
      reasonCodes.push("score.four_digit_year");
    } else {
      score += 4;
      reasonCodes.push("score.two_digit_year");
    }

    if (DATE_CONTEXT_PATTERN.test(line)) {
      score += 20;
      reasonCodes.push("score.date_context");
    }

    if (WEAK_DATE_CONTEXT_PATTERN.test(line)) {
      score -= 8;
      reasonCodes.push("score.weak_date_context_penalty");
    }

    if (lineCount && typeof candidate.lineIndex === "number" && lineCount > 1) {
      if (candidate.lineIndex / (lineCount - 1) <= 0.45) {
        score += 6;
        reasonCodes.push("score.upper_receipt_line");
      }
    }

    if (candidate.ambiguousDayMonth) {
      score -= 4;
      reasonCodes.push("score.ambiguous_day_month_penalty");
    }

    var confidence = normalizeConfidence(candidate.confidence);
    if (confidence !== null) {
      score += Math.round(confidence * 10);
      reasonCodes.push("score.confidence");
    }

    return {
      score: clampScore(score),
      value: candidate.value,
      raw: candidate.raw,
      reasonCodes: unique(reasonCodes)
    };
  }

  function pickScanSuggestions(input, options) {
    var opts = options || {};
    var maxAmounts = positiveInteger(opts.maxAmounts, 5);
    var maxDates = positiveInteger(opts.maxDates, 5);
    var minAmountScore = typeof opts.minAmountScore === "number" ? opts.minAmountScore : 25;
    var minDateScore = typeof opts.minDateScore === "number" ? opts.minDateScore : 25;
    var amountCandidates = extractAmountCandidates(input, opts).filter(function (candidate) {
      return candidate.score >= minAmountScore;
    });
    var dateCandidates = extractDateCandidates(input, opts).filter(function (candidate) {
      return candidate.score >= minDateScore;
    });

    return {
      amounts: dedupeByValue(amountCandidates).slice(0, maxAmounts).map(publicAmountCandidate),
      dates: dedupeByValue(dateCandidates).slice(0, maxDates).map(publicDateCandidate)
    };
  }

  function buildOcrBlocks(input) {
    if (Array.isArray(input)) {
      return input.map(function (item, index) {
        var text;
        var bbox = null;
        var confidence = null;

        if (item && typeof item === "object") {
          text = item.text || item.raw || item.value || "";
          bbox = item.bbox || item.box || item.boundingBox || null;
          confidence = item.confidence;
          if (confidence === undefined) {
            confidence = item.conf;
          }
        } else {
          text = item;
        }

        return {
          text: text == null ? "" : String(text),
          bbox: bbox,
          confidence: normalizeConfidence(confidence),
          lineIndex: index
        };
      });
    }

    return String(input == null ? "" : input).split(/\r?\n/).map(function (line, index) {
      return {
        text: line,
        bbox: null,
        confidence: null,
        lineIndex: index
      };
    });
  }

  function normalizeLine(value) {
    var text = String(value == null ? "" : value);
    if (typeof text.normalize === "function") {
      text = text.normalize("NFKC");
    }

    return text
      .replace(/\u00a0/g, " ")
      .replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-")
      .replace(/[\u201c\u201d\u201e]/g, '"')
      .replace(/[\u2018\u2019\u201a]/g, "'")
      .replace(/[|]/g, "I")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getCandidateRaw(candidate) {
    if (candidate && typeof candidate === "object") {
      return String(candidate.raw || candidate.text || candidate.value || "");
    }

    return String(candidate == null ? "" : candidate);
  }

  function detectCurrency(text) {
    var match = String(text || "").match(CURRENCY_PATTERN);
    if (!match) {
      return null;
    }

    var token = match[0].toUpperCase();
    if (token === "\u20ac" || token === "EURO") {
      return "EUR";
    }
    if (token === "$") {
      return "USD";
    }
    if (token === "\u00a3") {
      return "GBP";
    }
    if (token === "\u00a5") {
      return "JPY";
    }

    return token;
  }

  function resolveDecimalSeparator(text) {
    var separators = [];
    var index;

    for (index = 0; index < text.length; index += 1) {
      if (text.charAt(index) === "," || text.charAt(index) === ".") {
        separators.push(index);
      }
    }

    if (!separators.length) {
      return {
        separator: null,
        index: -1,
        decimalDigits: 0
      };
    }

    var last = separators[separators.length - 1];
    var decimalDigits = text.slice(last + 1).replace(/[^\d]/g, "").length;

    if (decimalDigits > 0 && decimalDigits <= 2) {
      return {
        separator: text.charAt(last),
        index: last,
        decimalDigits: decimalDigits
      };
    }

    return {
      separator: null,
      index: -1,
      decimalDigits: 0
    };
  }

  function stripThousands(text) {
    return String(text || "").replace(/[^\d]/g, "");
  }

  function replaceOcrZero(match, offset, text) {
    var before = offset > 0 ? text.charAt(offset - 1) : "";
    var after = offset + 1 < text.length ? text.charAt(offset + 1) : "";

    return /\d/.test(before) || /\d/.test(after) ? "0" : match;
  }

  function roundMoney(value) {
    return Math.round(value * 100) / 100;
  }

  function collectAmountMatches(candidates, text, block, lineIndex, pattern, source, groupIndex) {
    var match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      var raw = match[groupIndex || 0];
      var normalized = normalizeAmountCandidate(raw);

      if (normalized.ok) {
        candidates.push({
          value: normalized.value,
          raw: raw.trim(),
          normalized: normalized.normalized,
          currency: normalized.currency,
          context: text,
          lineIndex: lineIndex,
          bbox: block.bbox,
          confidence: block.confidence,
          source: source,
          reasonCodes: normalized.reasonCodes.concat([source])
        });
      }
    }
  }

  function collectDateMatches(candidates, text, block, lineIndex, pattern, source, parser) {
    var match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      var parsed = parser(match);

      if (parsed && parsed.ok) {
        candidates.push({
          value: parsed.value,
          raw: trimBoundary(match[0]),
          context: text,
          lineIndex: lineIndex,
          bbox: block.bbox,
          confidence: block.confidence,
          source: source,
          hasFourDigitYear: parsed.hasFourDigitYear,
          ambiguousDayMonth: parsed.ambiguousDayMonth,
          reasonCodes: parsed.reasonCodes.concat([source])
        });
      }
    }
  }

  function parseDateParts(yearPart, monthPart, dayPart, localOrder, options) {
    var opts = options || {};
    var year = Number(yearPart);
    var month = Number(monthPart);
    var day = Number(dayPart);
    var hasFourDigitYear = String(yearPart).length === 4;
    var ambiguousDayMonth = false;

    if (!month || !day) {
      return null;
    }

    if (!hasFourDigitYear) {
      year = year >= 70 ? 1900 + year : 2000 + year;
    }

    if (localOrder) {
      var dayFirst = opts.dayFirst !== false;
      if (dayFirst && month > 12 && day <= 12) {
        var oldDay = day;
        day = month;
        month = oldDay;
      } else if (!dayFirst && day > 12 && month <= 12) {
        var oldMonth = month;
        month = day;
        day = oldMonth;
      } else if (day <= 12 && month <= 12) {
        ambiguousDayMonth = true;
      }
    }

    if (!isValidDate(year, month, day)) {
      return null;
    }

    return {
      ok: true,
      value: pad4(year) + "-" + pad2(month) + "-" + pad2(day),
      hasFourDigitYear: hasFourDigitYear,
      ambiguousDayMonth: ambiguousDayMonth,
      reasonCodes: ["date.valid"]
    };
  }

  function isValidDate(year, month, day) {
    if (year < 1900 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }

    var date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function trimBoundary(value) {
    return String(value || "").replace(/^[^\dA-Za-z]+|[^\dA-Za-z]+$/g, "").trim();
  }

  function looksLikeDateFragment(value) {
    return /\d{1,2}[.\-/]\d{1,2}(?:[.\-/]\d{2,4})?/.test(String(value || ""));
  }

  function normalizeConfidence(confidence) {
    if (confidence === null || confidence === undefined || confidence === "") {
      return null;
    }

    var value = Number(confidence);
    if (!isFinite(value)) {
      return null;
    }

    if (value > 1) {
      value /= 100;
    }

    return Math.max(0, Math.min(1, value));
  }

  function dedupeCandidates(candidates) {
    var seen = {};
    var output = [];

    candidates.forEach(function (candidate) {
      var key = [candidate.value, candidate.raw, candidate.lineIndex, candidate.source].join("|");
      if (!seen[key]) {
        seen[key] = true;
        output.push(candidate);
      }
    });

    return output;
  }

  function dedupeByValue(candidates) {
    var seen = {};
    var output = [];

    candidates.forEach(function (candidate) {
      var key = String(candidate.value);
      if (!seen[key]) {
        seen[key] = true;
        output.push(candidate);
      }
    });

    return output;
  }

  function publicAmountCandidate(candidate) {
    return {
      score: candidate.score,
      value: candidate.value,
      raw: candidate.raw,
      normalized: candidate.normalized,
      currency: candidate.currency || null,
      lineIndex: candidate.lineIndex,
      bbox: candidate.bbox || null,
      confidence: candidate.confidence,
      reasonCodes: candidate.reasonCodes
    };
  }

  function publicDateCandidate(candidate) {
    return {
      score: candidate.score,
      value: candidate.value,
      raw: candidate.raw,
      lineIndex: candidate.lineIndex,
      bbox: candidate.bbox || null,
      confidence: candidate.confidence,
      reasonCodes: candidate.reasonCodes
    };
  }

  function sortByScore(a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (typeof b.value === "number" && typeof a.value === "number" && b.value !== a.value) {
      return Math.abs(b.value) - Math.abs(a.value);
    }

    return String(a.raw || "").localeCompare(String(b.raw || ""));
  }

  function clampScore(score) {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function positiveInteger(value, fallback) {
    var number = Number(value);
    if (!isFinite(number) || number <= 0) {
      return fallback;
    }

    return Math.floor(number);
  }

  function unique(values) {
    var seen = {};
    var output = [];

    values.forEach(function (value) {
      if (!seen[value]) {
        seen[value] = true;
        output.push(value);
      }
    });

    return output;
  }

  function assign(target) {
    var index;
    var source;
    var key;

    for (index = 1; index < arguments.length; index += 1) {
      source = arguments[index] || {};
      for (key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  }

  function pad2(value) {
    return String(value).length < 2 ? "0" + value : String(value);
  }

  function pad4(value) {
    var text = String(value);
    while (text.length < 4) {
      text = "0" + text;
    }
    return text;
  }

  return {
    normalizeOcrText: normalizeOcrText,
    normalizeAmountCandidate: normalizeAmountCandidate,
    extractAmountCandidates: extractAmountCandidates,
    extractDateCandidates: extractDateCandidates,
    scoreAmountCandidate: scoreAmountCandidate,
    scoreDateCandidate: scoreDateCandidate,
    pickScanSuggestions: pickScanSuggestions
  };
});

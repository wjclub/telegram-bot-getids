const html = require("html-escaper");
const codes = require("./node_modules/iso-lang-codes/src/index.js");

exports.renderTree = function (object, title = "Root") {
  return `<b>${title.toString()}</b>\n${renderLines(object).join("\n")}`;
};

function renderLines(object, depth = 0, prefix = [], parentKey = "") {
  var keys = Object.keys(object);
  var lines = [];
  const isArr = Array.isArray(object);
  for (var i = 0; i < keys.length; ) {
    var key = keys[i];
    var isLast = ++i === keys.length;

    if (typeof object[key] !== "object") {
      // render key
      var text =
        renderPrefix(prefix, isLast) + (isArr ? "" : `<b>${key}:</b> `);

      // render value
      const valString = escapeHtml(object[key].toString());

      if (key === "username") {
        text +=
          '<a href="https://t.me/' + object[key] + '">' + valString + "</a>";
      } else if (key === "file_size" && typeof object[key] !== "string") {
        text += formatSizeUnits(object[key]);
      } else if (key === "set_name" && typeof object[key] === "string") {
        text +=
          '<a href="https://t.me/addstickers/' +
          object[key] +
          '">' +
          valString +
          "</a>";
      } else if (key === "duration") {
        text += formatTime(object[key]);
      } else if (key === "language_code") {
        const langString = codes.locales[valString] || "-";
        text += `<code>${valString}</code> (${langString})`;
      } else if (key === "message_id" || key === "created") {
        text += object[key];
      } else if (typeof object[key] === "number" || key.indexOf("id") !== -1) {
        text += "<code>" + valString + "</code>";
      } else {
        text += valString;
      }

      lines.push(text);
    } else {
      // go to deeper level
      lines.push(renderPrefix(prefix, isLast) + "<b>" + key + "</b>");
      lines = lines.concat(
        renderLines(
          object[key],
          depth + 1,
          prefix.concat([isLast ? " " : "┊"]),
          key
        )
      );
    }
  }
  return lines;
}

function renderPrefix(prefix, isLast) {
  return " " + prefix.concat([isLast ? "└" : "├"]).join("  ") + " ";
}

function formatSizeUnits(bytes) {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + " GB";
  } else if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + " kB";
  } else if (bytes > 1) {
    return bytes + " bytes";
  } else if (bytes === 1) {
    return bytes + " byte";
  } else {
    return "0 bytes";
  }
}
exports.formatSizeUnits = formatSizeUnits;

function formatTime(seconds) {
  let res = {};
  var started = false;

  [
    // time units to calculate
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
    ["s", 1],
  ].forEach((unit) => {
    // don't include leading 0 values
    if (!started) {
      if (seconds > unit[1]) started = true;
      else return;
    }

    // extract maximal amount of full units
    res[unit[0]] = Math.floor(seconds / unit[1]);
    seconds %= unit[1];
  });

  // if empty, enter at least seconds
  if (!started) res = { s: 0 };

  return Object.values(res).join(":") + " (" + Object.keys(res).join(":") + ")";
}
exports.formatTime = formatTime;

function escapeHtml(unsafe) {
  if (unsafe === undefined) {
    return unsafe;
  } else if (typeof unsafe === "object") {
    for (var key in unsafe) {
      unsafe[key] = escapeHtml(unsafe[key]);
    }
    return unsafe;
  } else if (typeof unsafe === "string") {
    return html.escape(unsafe);
  } else {
    return unsafe;
  }
}
exports.escapeHtml = escapeHtml;

/* DEBUG AREA */

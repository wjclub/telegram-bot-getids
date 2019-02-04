/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const html = require('html-escaper');
const idage = require('./idage.js').getAge;


exports.renderTree = function (object, title = 'Root') {
    return `${title.toString()}\n${renderLines(object).join('\n')}`;
};

function renderLines(object, depth = 0, prefix = []) {
    var keys = Object.keys(object);
    var lines = [];
    for (var i = 0; i < keys.length; ) {    
        var key = keys[i];
        var isCode = (typeof object[key] === 'number' || key.indexOf('id') !== -1);
        var isLast = (++i === keys.length);

        if (typeof object[key] !== 'object') {
            // render key:value
            var text = renderPrefix(prefix, isLast) + `<b>${key}:</b> `;
            text += (isCode ? '<code>' : '') + object[key].toString() + (isCode ? '</code>' : '');
            lines.push(text);

        } else {
            // go to deeper level
            lines.push(renderPrefix(prefix, isLast) + '<b>' + key + '</b>');
            lines = lines.concat(renderLines(object[key], depth + 1, prefix.concat([(isLast ? ' ' : '┊')])));
        }
    }
    return lines;
}

function renderPrefix(prefix, isLast) {
    return ' ' + prefix.concat([(isLast ? '└' : '├')]).join('  ') + ' ';
}





function formatSizeUnits(bytes) {
    if (bytes >= 1073741824)
        return (bytes / 1073741824).toFixed(2) + ' GB';
    else if (bytes >= 1048576)
        return (bytes / 1048576).toFixed(2) + ' MB';
    else if (bytes >= 1024)
        return (bytes / 1024).toFixed(2) + ' kB';
    else if (bytes > 1)
        return bytes + ' bytes';
    else if (bytes === 1)
        return bytes + ' byte';
    else
        return'0 bytes';
}
exports.formatSizeUnits = formatSizeUnits;

function formatTime(seconds) {
    
    let res = {};
    var started = false;
    
    [ // time units to calculate
        ['d', 86400],
        ['h', 3600],
        ['m', 60],
        ['s', 1]
    ].forEach(unit => {
        
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
    if (!started) res = {s:0};
    
    return res;
}
exports.formatTime = formatTime;




function escapeHtml(unsafe) {
    if (unsafe === undefined)
        return unsafe;
    else if (typeof unsafe === 'object') {
        for (var key in unsafe) {
            unsafe[key] = escapeHtml(unsafe[key]);
        }
        return unsafe;
    } else if (typeof unsafe === 'string') {
        return html.escape(unsafe);
    } else
        return unsafe;

}
exports.escapeHtml = escapeHtml;

/* DEBUG AREA*/

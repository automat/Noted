//temporary patch to fix ace´s markdown list indentation

const CHAR = 1;
const CHAR_EXT = 2;
const PLACEHOLDER_START = 3;
const PLACEHOLDER_BODY =  4;
const PUNCTUATION = 9;
const SPACE = 10;
const TAB = 11;
const TAB_SPACE = 12;

ace.EditSession.prototype.$computeWrapSplits = function(tokens, wrapLimit, tabSize) {
    if (tokens.length == 0) {
        return [];
    }

    var splits = [];
    var displayLength = tokens.length;
    var lastSplit = 0, lastDocSplit = 0;

    var isCode = this.$wrapAsCode;

    var indentedSoftWrap = this.$indentedSoftWrap;
    var maxIndent = wrapLimit <= Math.max(2 * tabSize, 8)
    || indentedSoftWrap === false ? 0 : Math.floor(wrapLimit / 2);

    function getWrapIndent() {
        var indentation = 0;

        if (maxIndent === 0)
            return indentation;
        if (indentedSoftWrap) {
            var punctuationCount = 0;
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (token == SPACE)
                    indentation += 1;
                else if (token == TAB)
                    indentation += tabSize;
                //PATCH BEGIN
                else if (token == PUNCTUATION && punctuationCount === 0){
                    indentation += 1;
                    punctuationCount++;
                }
                //PATCH BEGIN
                else if (token == TAB_SPACE)
                    continue;
                else
                    break;
            }
        }

        if (isCode && indentedSoftWrap !== false)
            indentation += tabSize;
        return Math.min(indentation, maxIndent);
    }
    function addSplit(screenPos) {
        var displayed = tokens.slice(lastSplit, screenPos);
        var len = displayed.length;
        displayed.join("").
            replace(/12/g, function() {
                len -= 1;
            }).
            replace(/2/g, function() {
                len -= 1;
            });

        if (!splits.length) {
            indent = getWrapIndent();
            splits.indent = indent;
        }
        lastDocSplit += len;
        splits.push(lastDocSplit);
        lastSplit = screenPos;
    }
    var indent = 0;
    while (displayLength - lastSplit > wrapLimit - indent) {
        var split = lastSplit + wrapLimit - indent;
        if (tokens[split - 1] >= SPACE && tokens[split] >= SPACE) {
            addSplit(split);
            continue;
        }
        if (tokens[split] == PLACEHOLDER_START || tokens[split] == PLACEHOLDER_BODY) {
            for (split; split != lastSplit - 1; split--) {
                if (tokens[split] == PLACEHOLDER_START) {
                    break;
                }
            }
            if (split > lastSplit) {
                addSplit(split);
                continue;
            }
            split = lastSplit + wrapLimit;
            for (split; split < tokens.length; split++) {
                if (tokens[split] != PLACEHOLDER_BODY) {
                    break;
                }
            }
            if (split == tokens.length) {
                break;  // Breaks the while-loop.
            }
            addSplit(split);
            continue;
        }
        var minSplit = Math.max(split - (wrapLimit -(wrapLimit>>2)), lastSplit - 1);
        while (split > minSplit && tokens[split] < PLACEHOLDER_START) {
            split --;
        }
        if (isCode) {
            while (split > minSplit && tokens[split] < PLACEHOLDER_START) {
                split --;
            }
            while (split > minSplit && tokens[split] == PUNCTUATION) {
                split --;
            }
        } else {
            while (split > minSplit && tokens[split] < SPACE) {
                split --;
            }
        }
        if (split > minSplit) {
            addSplit(++split);
            continue;
        }
        split = lastSplit + wrapLimit;
        if (tokens[split] == CHAR_EXT)
            split--;
        addSplit(split - indent);
    }
    return splits;
};
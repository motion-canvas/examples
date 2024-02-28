import {HighlightStyle} from '@codemirror/language';
import {parser as gd} from '@examples/lezer-gdscript';
import {tags} from '@lezer/highlight';
import {parser as java} from '@lezer/java';
import {parser as js} from '@lezer/javascript';
import {parser as rs} from '@lezer/rust';
import {parser as yaml} from '@lezer/yaml';
import {
  Code,
  CodeProps,
  HighlightResult,
  LezerHighlighter,
  withDefaults,
} from '@motion-canvas/2d';
import {map} from '@motion-canvas/core';

const KEYWORD = '#ff5d62';
const TEXT = '#dbdbdb';
const BRACES = '#b2b2b2';
const FUNCTION = '#eabe71';
const STRING = '#98bb6c';
const NUMBER = '#75b9ab';
const CLASS = '#68ABDF';
const COMMENT = '#808586';
const OPERATOR = '#d27e99';

export const Style = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.modifier, tags.self],
    color: KEYWORD,
  },
  {
    tag: [
      tags.function(tags.variableName),
      tags.function(tags.name),
      tags.function(tags.propertyName),
      tags.standard(tags.name),
    ],
    color: FUNCTION,
  },
  {
    tag: [
      tags.name,
      tags.variableName,
      tags.deleted,
      tags.character,
      tags.macroName,
    ],
    color: TEXT,
  },
  {
    tag: tags.definition(tags.name),
    color: KEYWORD,
  },
  {
    tag: [tags.number, tags.changed, tags.annotation, tags.namespace],
    color: NUMBER,
  },
  {
    tag: [tags.typeName, tags.bool, tags.className],
    color: CLASS,
  },
  {
    tag: tags.operator,
    color: OPERATOR,
  },
  {
    tag: [tags.brace, tags.separator, tags.bracket, tags.punctuation],
    color: BRACES,
  },
  {
    tag: [tags.string, tags.content],
    color: STRING,
  },
  {
    tag: tags.comment,
    color: COMMENT,
  },
]);

class CsharpHighlighter extends LezerHighlighter {
  highlight(index, cache): HighlightResult {
    const value = super.highlight(index, cache);
    const node = cache.tree.resolveInner(index, 1);
    const code = cache.code.slice(node.from, node.to);

    switch (code) {
      case 'Resolve':
      case 'Get':
      case 'Set':
      case 'ResolveAir':
      case 'ResolveGround':
      case 'ResolveIdle':
      case 'ResolveRunAnimation':
      case 'CheckCollision':
        if (
          cache.code[node.from - 1] === '.' ||
          cache.code[node.from - 2] === '?' ||
          cache.code[node.from - 2] === ':' ||
          cache.code[node.from - 2] === '=' ||
          cache.code[node.from - 2] === ','
        ) {
          value.color = FUNCTION;
        }
        break;
      case 'struct':
      case 'override':
        value.color = KEYWORD;
        break;
      case 'AnimationFrame':
      case 'ReanimatorNode':
      case 'SwitchNode':
      case 'RootSwitchNode':
      case 'GroundSwitchNode':
      case 'AirSwitchNode':
      case 'IdleSwitchNode':
      case 'RunAnimationNode':
      case 'Params':
        value.color = CLASS;
        break;
    }

    return value;
  }
}

class YamlHighlighter extends LezerHighlighter {
  tokenize(code: string): string[] {
    const tokens: string[] = [];
    let currentToken = '';
    let whitespace = false;

    for (const char of code) {
      switch (char) {
        case ' ':
        case '\t':
        case '\n':
        case '"':
        case "'":
        case '{':
        case '}':
        case '[':
          if (!whitespace && currentToken !== '') {
            tokens.push(currentToken);
            currentToken = '';
          }
          whitespace = true;
          currentToken += char;
          break;
        case '(':
        case ')':
        case ',':
        case ':':
          if (currentToken !== '') {
            tokens.push(currentToken);
            currentToken = '';
          }
          whitespace = false;
          tokens.push(char);
          break;
        default:
          if (whitespace && currentToken !== '') {
            tokens.push(currentToken);
            currentToken = '';
          }
          whitespace = false;
          currentToken += char;
          break;
      }
    }

    if (currentToken !== '') {
      tokens.push(currentToken);
    }

    return tokens;
  }
}

const Defaults: CodeProps = {
  drawHooks: {
    token(ctx, text, position, color, selection) {
      ctx.fillStyle = color;
      ctx.globalAlpha *= map(0.32, 1, selection);
      ctx.fillText(text, position.x, position.y);
    },
  },
  fill: OPERATOR,
  fontFamily: 'JetBrains Mono',
  lineHeight: '150%',
  fontSize: 28,
};

export const PlainCode = withDefaults(Code, Defaults);

export const JSCode = withDefaults(Code, {
  highlighter: new LezerHighlighter(js, Style),
  ...Defaults,
});

export const CSCode = withDefaults(Code, {
  highlighter: new CsharpHighlighter(java, Style),
  ...Defaults,
});

export const RSCode = withDefaults(Code, {
  highlighter: new LezerHighlighter(rs, Style),
  ...Defaults,
});

export const YamlCode = withDefaults(Code, {
  highlighter: new YamlHighlighter(yaml, Style),
  ...Defaults,
});

export const GdCode = withDefaults(Code, {
  highlighter: new LezerHighlighter(gd, Style),
  ...Defaults,
});

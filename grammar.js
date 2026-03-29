/**
 * @file functional C
 * @author kevin0x0 <kevin0x00@163.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  assignment: 1,
  and: 3,
  or: 4,
  relational: 5,
  additive: 6,
  multiplicative: 7,
  shift: 8,
  bitwise: 9,
};

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

const MODULE_PREC = {
  "module": 0,
  "module_toplevel": 1
}

module.exports = grammar({
  name: "fc",

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => seq(
      optional($.module_header),
      optional($.module_path),
      repeat($.module_element),
    ),

    module_header: $ => prec(MODULE_PREC.module_toplevel, seq(
      "module",
      $.identifier,
      ";",
    )),

    module_path: $ => seq(
      "@",
      $.string_literal,
      ";",
    ),

    module_element: $ => choice(
      $.import_declaration,
      $.module_declaration,
      $.typeclass_declaration,
      $.impl_declaration,
      $.function_declaration,
      $.macro_declaration,
      $.const_declaration,
      $.static_declaration,
      $.type_declaration,
      $.struct_declaration,
      $.union_declaration,
      $.enum_declaration,
    ),

    import_declaration: $ => seq(
      "import",
      choice($.string_literal, $.name_spec),
      ";",
    ),

    module_declaration: $ => prec(MODULE_PREC.module, seq(
      "module",
      $.identifier,
      choice(
        ";",
        seq("{", repeat($.module_element), "}"),
      ),
    )),

    typeclass_declaration: $ => seq(
      "typeclass",
      $.typeclass_name,
      $.identifier,
      "{",
      repeat($.function_declaration),
      "}",
    ),

    typeclass_name: $ => seq(
      $.identifier,
      optional(seq("(", commaSep1($.name_spec), ")")),
    ),

    impl_declaration: $ => seq(
      "impl",
      optional($.generic_parameters),
      choice(
        seq(
          "for",
          $.identifier,
          "{",
          repeat($.impl_item),
          "}",
        ),
        seq(
          $.name_spec,
          "for",
          $.type,
          "{",
          repeat($.function_declaration),
          "}",
        ),
      ),
    ),

    impl_item: $ => choice(
      $.function_declaration,
      $.const_declaration,
      $.static_declaration,
    ),

    function_declaration: $ => seq(
      "fn",
      optional($.attribute_list),
      optional($.generic_parameters),
      $.identifier,
      $.parameter_list,
      optional($.return_type),
      choice(";", $.block),
    ),

    macro_declaration: $ => seq(
      "macro",
      $.identifier,
      $.macro_parameters,
      "=>",
      $.expression,
      ";",
    ),

    const_declaration: $ => prec(1, seq(
      "const",
      optional($.generic_parameters),
      $.identifier,
      optional(seq(":", $.type)),
      "=",
      $.expression,
      ";",
    )),

    static_declaration: $ => seq(
      "static",
      optional($.attribute_list),
      choice(
        $.identifier,
        seq("const", $.identifier),
      ),
      optional(seq(":", $.type)),
      optional(seq("=", $.expression)),
      ";",
    ),

    type_declaration: $ => choice(
      seq(
        "type",
        $.typevarspec,
        "=",
        $.type,
        ";",
      ),
      seq(
        "type",
        $.generic_parameters,
        $.typevarspec,
        "=",
        $.type,
        ";",
      ),
      seq(
        "type",
        $.typevarspec_list,
        $.type,
        "=",
        $.type,
        ";",
      ),
    ),

    struct_declaration: $ => seq($.struct_type, ";"),
    union_declaration: $ => seq($.union_type, ";"),
    enum_declaration: $ => seq($.enum_type, ";"),

    struct_type: $ => prec.right(seq(
      "struct",
      optional($.generic_parameters),
      optional($.identifier),
      optional($.struct_layout),
    )),

    union_type: $ => prec.right(seq(
      "union",
      optional($.generic_parameters),
      optional($.identifier),
      optional($.struct_layout),
    )),

    struct_layout: $ => seq(
      "{",
      commaSep($.struct_layout_item),
      "}",
    ),

    struct_layout_item: $ => choice(
      $.member_definition,
      $.struct_layout_struct,
      $.struct_layout_union,
    ),

    struct_layout_struct: $ => seq(
      "struct",
      $.struct_layout,
    ),

    struct_layout_union: $ => seq(
      "union",
      $.struct_layout,
    ),

    member_definition: $ => seq(
      $.identifier,
      ":",
      $.type,
    ),

    enum_type: $ => seq(
      "enum",
      optional($.identifier),
      ":",
      $.type,
      "{",
      commaSep($.enum_member),
      "}",
    ),

    enum_member: $ => seq(
      $.identifier,
      optional(seq("=", $.expression)),
    ),

    attribute_list: $ => seq(
      "[",
      commaSep1($.identifier),
      "]",
    ),

    generic_parameters: $ => seq(
      "<",
      commaSep1($.generic_parameter),
      ">",
    ),

    generic_parameter: $ => seq(
      $.typevarspec,
      optional(seq(":", sep1($.name_spec, "&"))),
    ),

    typevarspec_list: $ => seq(
      "|",
      commaSep1($.typevarspec),
      "|",
    ),

    typevarspec: $ => seq(
      $.identifier,
      optional(seq("@", $.identifier)),
    ),

    parameter_list: $ => seq(
      "(",
      commaSep($.expression),
      ")",
    ),

    return_type: $ => seq(
      "->",
      $.type,
    ),

    block: $ => seq(
      "{",
      repeat($.statement),
      "}",
    ),

    statement: $ => choice(
      $.enum_declaration,
      $.struct_declaration,
      $.union_declaration,
      $.const_declaration,
      $.type_declaration,
      $.static_declaration,
      $.let_statement,
      $.for_statement,
      $.match_statement,
      $.do_while_statement,
      $.while_statement,
      $.if_statement,
      $.goto_statement,
      $.break_statement,
      $.continue_statement,
      $.return_statement,
      $.label_statement,
      $.block,
      $.expression_statement,
    ),

    let_statement: $ => seq(
      "let",
      $.expression,
      optional(seq(
        "=",
        $.expression,
        optional(seq($.in_keyword, $.expression)),
      )),
      ";",
    ),

    for_statement: $ => seq(
      "for",
      "(",
      choice($.let_statement, $.expression_statement),
      $.expression,
      ";",
      $.expression,
      ")",
      $.statement,
    ),

    match_statement: $ => seq(
      "match",
      "(",
      $.expression,
      ")",
      "{",
      repeat($.match_case),
      "}",
    ),

    match_case: $ => seq(
      $.expression,
      "=>",
      $.statement,
    ),

    if_statement: $ => prec.right(seq(
      "if",
      "(",
      choice($.let_condition, $.expression),
      ")",
      $.statement,
      optional(seq("else", $.statement)),
    )),

    let_condition: $ => seq(
      "let",
      $.expression,
      "=",
      $.expression,
    ),

    while_statement: $ => seq(
      "while",
      "(",
      choice($.let_condition, $.expression),
      ")",
      $.statement,
    ),

    do_while_statement: $ => seq(
      "do",
      $.statement,
      "while",
      "(",
      $.expression,
      ")",
      ";",
    ),

    goto_statement: $ => seq(
      "goto",
      $.expression,
      ";",
    ),

    break_statement: $ => seq(
      "break",
      optional(choice($.identifier, $.integer_literal)),
      ";",
    ),

    continue_statement: $ => seq(
      "continue",
      optional(choice($.identifier, $.integer_literal)),
      ";",
    ),

    return_statement: $ => seq(
      "return",
      optional($.expression),
      ";",
    ),

    label_statement: $ => seq(
      "@",
      $.identifier,
      $.statement,
    ),

    expression_statement: $ => seq(
      $.expression,
      ";",
    ),

    expression: $ => choice(
      $.let_expression,
      $.case_expression,
      $.function_expression,
      $.macro_expression,
      $.binary_expression,
    ),

    let_expression: $ => prec.right(seq(
      "let",
      $.expression,
      "=",
      $.expression,
      $.in_keyword,
      $.expression,
    )),

    case_expression: $ => prec.right(seq(
      "case",
      $.expression,
      "of",
      commaSep1($.case_pair),
    )),

    case_pair: $ => seq(
      $.expression,
      "=>",
      $.expression,
    ),

    function_expression: $ => seq(
      "fn",
      $.parameter_list,
      optional($.return_type),
      choice(
        seq("=>", $.expression),
        $.block,
      ),
    ),

    macro_expression: $ => seq(
      "macro",
      $.macro_parameters,
      "=>",
      $.expression,
    ),

    macro_parameters: $ => seq(
      "!",
      "(",
      commaSep($.expression),
      ")",
    ),

    unary_expression: $ => choice(
      seq(
        choice("-", "!", "~", "++", "--", "*", "&", "const"),
        $.unary_expression,
      ),
      $.postfix_expression,
    ),

    postfix_expression: $ => prec.right(choice(
      $.primary_expression,
      seq($.postfix_expression, "@", optional("const")),
      seq($.postfix_expression, "^"),
      seq($.postfix_expression, "++"),
      seq($.postfix_expression, "--"),
      seq($.postfix_expression, ":", $.type),
      seq($.postfix_expression, ".", choice($.identifier, $.integer_literal)),
      seq($.postfix_expression, "->", $.identifier),
      seq($.postfix_expression, $.argument_list),
      seq($.postfix_expression, $.subscript),
      seq($.postfix_expression, $.macro_arguments),
    )),

    argument_list: $ => seq(
      "(",
      commaSep($.expression),
      ")",
    ),

    macro_arguments: $ => seq(
      "!",
      "(",
      commaSep($.expression),
      ")",
    ),

    subscript: $ => seq(
      "[",
      optional($.expression),
      optional(seq(";", optional($.expression))),
      "]",
    ),

    binary_expression: $ => choice(
      prec.right(PREC.assignment, seq($.expression, choice(
        "=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>=",
      ), $.expression)),
      prec.left(PREC.and, seq($.binary_expression, "&&", $.binary_expression)),
      prec.left(PREC.or, seq($.binary_expression, "||", $.binary_expression)),
      prec.left(PREC.relational, seq($.binary_expression, choice("<", "<=", ">", ">=", "==", "!=",), $.binary_expression)),
      prec.left(PREC.additive, seq($.binary_expression, choice("+", "-"), $.binary_expression)),
      prec.left(PREC.multiplicative, seq($.binary_expression, choice("*", "/", "%"), $.binary_expression)),
      prec.left(PREC.shift, seq($.binary_expression, choice("<<", ">>"), $.binary_expression)),
      prec.left(PREC.bitwise, seq($.binary_expression, choice("&", "|", "<>"), $.binary_expression)),
      $.unary_expression,
    ),

    primary_expression: $ => choice(
      $.construction_expression,
      $.name_spec,
      $.integer_literal,
      $.float_literal,
      $.char_literal,
      $.string_literal,
      $.boolean_literal,
      $.binding_identifier,
      $.wildcard,
      $.array_expression,
      $.parenthesized_expression,
    ),

    construction_expression: $ => seq(
      $.name_spec,
      "{",
      commaSep($.init_pair),
      "}",
    ),

    init_pair: $ => seq(
      $.identifier,
      "=",
      $.expression,
    ),

    array_expression: $ => seq(
      "[",
      commaSep($.expression),
      "]",
    ),

    parenthesized_expression: $ => choice(
      seq("(", ")"),
      seq("(", $.expression, ")"),
      seq("(", $.expression, ",", commaSep($.expression), ")"),
      seq("(", $.block, ")"),
    ),

    name_spec: $ => seq(
      $.identifier,
      repeat(choice(
        seq("::", $.identifier),
        seq("::", $.type_arguments),
      )),
    ),

    type_arguments: $ => seq(
      "<",
      commaSep1($.type),
      ">",
    ),

    type: $ => prec.right(choice(
      $.type_atom,
      seq("&", optional("const"), $.type),
      seq($.type, "@", $.type),
    )),

    type_atom: $ => choice(
      $.type_name,
      $.type_literal,
      $.enum_type,
      $.struct_type,
      $.union_type,
      $.type_function,
      $.type_parenthesized,
      $.type_bracket,
      $.type_in_expression,
    ),

    type_name: $ => prec.right(seq(
      $.name_spec,
      optional($.type_arguments),
    )),

    type_literal: $ => choice(
      $.integer_literal,
      $.boolean_literal,
      $.wildcard,
    ),

    type_function: $ => prec.right(seq(
      "fn",
      $.type_tuple,
      "->",
      $.type,
    )),

    type_parenthesized: $ => choice(
      seq("(", ")"),
      seq("(", $.type, ")"),
      seq("(", $.type, ",", commaSep($.type), ")"),
    ),

    type_tuple: $ => seq(
      "(",
      commaSep($.type),
      ")",
    ),

    type_bracket: $ => choice(
      seq(
        "[",
        optional("const"),
        $.type,
        "]",
      ),
      seq(
        "[",
        optional("const"),
        $.type,
        ";",
        $.type,
        "]",
      ),
      seq(
        "[",
        optional("const"),
        $.type,
        ":",
        $.expression,
        "]",
      ),
      seq(
        "[",
        "@",
        $.type,
        $.type,
        "]",
      ),
    ),

    type_in_expression: $ => prec.right(seq(
      "type",
      optional($.typevarspec_list),
      $.type,
      "=",
      $.type,
      $.in_keyword,
      $.type,
    )),

    in_keyword: _ => choice("in", "<-"),

    comment: _ => token(choice(
      /\/\/[^\n\r]*/,
      /\/\*([^*]|\*[^\/])*\*\//,
    )),

    identifier: _ => token(prec(-1, /[A-Za-z_][A-Za-z0-9_]*/)),
    binding_identifier: _ => token(/`[A-Za-z_][A-Za-z0-9_]*/),
    wildcard: _ => token(/_/),
    integer_literal: _ => token(/(0[xX][0-9A-Fa-f]+|0[bB][01]+|0[oO]?[0-7]+|[1-9][0-9]*|0)([uU]?([lL]|[hH]{1,2}|[zZ])?)?/),
    float_literal: _ => token(/[0-9]+\.[0-9]+([lL]?[fF])?/),
    char_literal: _ => token(/'([^'\\]|\\x[0-9A-Fa-f]+|\\.)'/),
    string_literal: _ => token(/"([^"\\]|\\.)*"/),
    boolean_literal: _ => token(choice("true", "false")),
  },

});

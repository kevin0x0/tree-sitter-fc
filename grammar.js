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

  word: $ => $._common_identifier,

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
      choice($.string_literal, $._name_spec),
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
      optional(seq("(", commaSep1($._type_name_spec), ")")),
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
          $._type_name_spec,
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
      choice(";", $.comp_statement),
    ),

    macro_declaration: $ => seq(
      "macro",
      $.identifier,
      $.macro_parameters,
      "=>",
      $._expression,
      ";",
    ),

    const_declaration: $ => prec(1, seq(
      "const",
      optional($.generic_parameters),
      $.identifier,
      optional(seq(":", $.type)),
      "=",
      $._expression,
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
      optional(seq("=", $._expression)),
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
      optional($.type_identifier),
      optional($.struct_layout),
    )),

    union_type: $ => prec.right(seq(
      "union",
      optional($.generic_parameters),
      optional($.type_identifier),
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
      optional($.type_identifier),
      ":",
      $.type,
      "{",
      commaSep($.enum_member),
      "}",
    ),

    enum_member: $ => seq(
      $.identifier,
      optional(seq("=", $._expression)),
    ),

    attribute_list: $ => seq(
      "[",
      commaSep1($.identifier),
      "]",
    ),

    generic_parameters: $ => seq(
      "<",
      commaSep1($._generic_parameter),
      ">",
    ),

    _generic_parameter: $ => seq(
      $.typevarspec,
      $.generic_parameter_spec,
    ),

    generic_parameter_spec: $ => seq(
      $.typevarspec,
      optional(seq(":", sep1($._type_name_spec, "&")))
    ),

    typevarspec_list: $ => seq(
      "|",
      commaSep1($.typevarspec),
      "|",
    ),

    typevarspec: $ => seq(
      $.type_identifier,
      optional(seq("@", choice("int", "bool"))),
    ),

    parameter_list: $ => seq(
      "(",
      commaSep($._expression),
      ")",
    ),

    return_type: $ => seq(
      "->",
      $.type,
    ),

    comp_statement: $ => seq(
      "{",
      repeat($._statement),
      "}",
    ),

    _statement: $ => choice(
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
      $.comp_statement,
      $.expression_statement,
    ),

    let_statement: $ => seq(
      "let",
      $._expression,
      optional(seq(
        "=",
        $._expression,
        optional(seq($.in_keyword, $._expression)),
      )),
      ";",
    ),

    for_statement: $ => seq(
      "for",
      "(",
      choice($.let_statement, $.expression_statement),
      $._expression,
      ";",
      $._expression,
      ")",
      $._statement,
    ),

    match_statement: $ => seq(
      "match",
      "(",
      $._expression,
      ")",
      "{",
      repeat($.match_case),
      "}",
    ),

    match_case: $ => seq(
      $._expression,
      "=>",
      $._statement,
    ),

    if_statement: $ => prec.right(seq(
      "if",
      "(",
      choice($.let_condition, $._expression),
      ")",
      $._statement,
      optional(seq("else", $._statement)),
    )),

    let_condition: $ => seq(
      "let",
      $._expression,
      "=",
      $._expression,
    ),

    while_statement: $ => seq(
      "while",
      "(",
      choice($.let_condition, $._expression),
      ")",
      $._statement,
    ),

    do_while_statement: $ => seq(
      "do",
      $._statement,
      "while",
      "(",
      $._expression,
      ")",
      ";",
    ),

    goto_statement: $ => seq(
      "goto",
      $._expression,
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
      optional($._expression),
      ";",
    ),

    label_statement: $ => seq(
      "@",
      $.identifier,
      $._statement,
    ),

    expression_statement: $ => seq(
      $._expression,
      ";",
    ),

    _expression: $ => choice(
      $.let_expression,
      $.case_expression,
      $.function_expression,
      $.macro_expression,
      $._binary_expression,
    ),

    let_expression: $ => prec.right(seq(
      "let",
      $._expression,
      "=",
      $._expression,
      $.in_keyword,
      $._expression,
    )),

    case_expression: $ => prec.right(seq(
      "case",
      $._expression,
      "of",
      commaSep1($.case_pair),
    )),

    case_pair: $ => seq(
      $._expression,
      "=>",
      $._expression,
    ),

    function_expression: $ => seq(
      "fn",
      $.parameter_list,
      optional($.return_type),
      choice(
        seq("=>", $._expression),
        $.comp_statement,
      ),
    ),

    macro_expression: $ => seq(
      "macro",
      $.macro_parameters,
      "=>",
      $._expression,
    ),

    macro_parameters: $ => seq(
      "!",
      "(",
      commaSep($._expression),
      ")",
    ),

    _unary_expression: $ => choice(
      $._postfix_expression,
      $.neg_expression,
      $.not_expression,
      $.bnot_expression,
      $.prefix_inc_expression,
      $.prefix_dec_expression,
      $.prefix_deref_expression,
      $.prefix_ref_expression ,
      $.const_expression,
    ),

    neg_expression: $ => seq("-", $._unary_expression),
    not_expression: $ => seq("!", $._unary_expression),
    bnot_expression: $ => seq("~", $._unary_expression),
    prefix_inc_expression: $ => seq("++", $._unary_expression),
    prefix_dec_expression: $ => seq("--", $._unary_expression),
    prefix_deref_expression: $ => seq("*", $._unary_expression),
    prefix_ref_expression: $ => seq("&", $._unary_expression),
    const_expression: $ => seq("const", $._unary_expression),

    _postfix_expression: $ => prec.right(choice(
      $._primary_expression,
      $.postfix_ref_expression,
      $.postfix_deref_expression,
      $.postfix_inc_expression,
      $.postfix_dec_expression,
      $.annotation_expression,
      $.dot_expression,
      $.function_call_expression,
      $.subscript_expression,
      $.macro_call_expression,
    )),

    postfix_ref_expression: $ => seq($._postfix_expression, "@", optional("const")),
    postfix_deref_expression: $ => seq($._postfix_expression, "^"),
    postfix_inc_expression: $ => seq($._postfix_expression, "++"),
    postfix_dec_expression: $ => seq($._postfix_expression, "--"),
    annotation_expression: $ => prec.right(seq($._postfix_expression, ":", $.type)),

    function_call_expression: $ => seq(
      $._postfix_expression,
      "(",
      commaSep($._expression),
      ")",
    ),

    dot_expression: $ => seq(
      $._postfix_expression, ".",
      choice($.identifier, $.integer_literal),
    ),

    macro_call_expression: $ => seq(
      $._postfix_expression,
      "!",
      "(",
      commaSep($._expression),
      ")",
    ),

    subscript_expression: $ => seq(
      $._postfix_expression,
      "[",
      choice(
        $._expression,
        seq(
          optional($._expression),
          ";",
          optional($._expression)
        )
      ),
      "]",
    ),

    _binary_expression: $ => choice(
      $._unary_expression,
      $.binary_expression,
    ),

    binary_expression: $ => choice(
      prec.right(PREC.assignment, seq($._binary_expression, choice(
        "=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>=",
      ), $._binary_expression)),
      prec.left(PREC.and, seq($._binary_expression, "&&", $._binary_expression)),
      prec.left(PREC.or, seq($._binary_expression, "||", $._binary_expression)),
      prec.left(PREC.relational, seq($._binary_expression, choice("<", "<=", ">", ">=", "==", "!=",), $._binary_expression)),
      prec.left(PREC.additive, seq($._binary_expression, choice("+", "-"), $._binary_expression)),
      prec.left(PREC.multiplicative, seq($._binary_expression, choice("*", "/", "%"), $._binary_expression)),
      prec.left(PREC.shift, seq($._binary_expression, choice("<<", ">>"), $._binary_expression)),
      prec.left(PREC.bitwise, seq($._binary_expression, choice("&", "|", "<>"), $._binary_expression)),
    ),

    _primary_expression: $ => choice(
      $.construction_expression,
      $._name_spec,
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
      $._name_spec,
      "{",
      commaSep($.init_pair),
      "}",
    ),

    init_pair: $ => seq(
      $.identifier,
      "=",
      $._expression,
    ),

    array_expression: $ => seq(
      "[",
      commaSep($._expression),
      "]",
    ),

    parenthesized_expression: $ => choice(
      seq("(", ")"),
      seq("(", $._expression, ")"),
      seq("(", $._expression, ",", commaSep($._expression), ")"),
      seq("(", $.comp_statement, ")"),
    ),

    _name_spec: $ => choice(
      $.identifier,
      $.instantiation,
      $.path,
    ),

    instantiation: $ => seq($._name_spec, "::", $.type_arguments),
    path: $ => seq($._name_spec, "::", $.identifier),

    _type_name_spec: $ => choice(
      $.type_identifier,
      $.type_instantiation,
      $.type_path,
    ),

    type_instantiation: $ => seq($._type_name_spec, "::", $.type_arguments),
    type_path: $ => seq($._type_name_spec, "::", $.type_identifier),

    type_arguments: $ => seq(
      "<",
      commaSep1($.type),
      ">",
    ),

    type: $ => choice(
      $._type_atom,
      $.prefix_ref_type,
      $.postfix_ref_type,
    ),

    prefix_ref_type: $ => prec.right(seq("&", optional("const"), $.type)),
    postfix_ref_type: $ => prec.right(seq($.type, "@", $.type)),

    _type_atom: $ => choice(
      $._type_name_spec,
      $._type_literal,
      $.enum_type,
      $.struct_type,
      $.union_type,
      $.type_function,
      $.type_parenthesized,
      $.type_bracket,
      $.type_in_expression,
    ),

    type_short_instantiation: $ => prec.right(seq(
      $._type_name_spec,
      optional($.type_arguments),
    )),

    _type_literal: $ => choice(
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
        $._expression,
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

    _common_identifier: _ => token(/[A-Za-z_][A-Za-z0-9_]*/),
    type_identifier: $ => $._common_identifier,
    identifier: $ => $._common_identifier,
    binding_identifier: _ => token(/`[A-Za-z_][A-Za-z0-9_]*/),
    wildcard: _ => token(/_/),
    integer_literal: _ => token(/(0[xX][0-9A-Fa-f]+|0[bB][01]+|0[oO]?[0-7]+|[1-9][0-9]*|0)([uU]?([lL]|[hH]{1,2}|[zZ])?)?/),
    float_literal: _ => token(/[0-9]+\.[0-9]+([lL]?[fF])?/),
    char_literal: _ => token(/'([^'\\]|\\x[0-9A-Fa-f]+|\\.)'/),
    string_literal: _ => token(/"([^"\\]|\\.)*"/),
    boolean_literal: _ => token(choice("true", "false")),
  },

});

; Literals
(comment) @comment
(string_literal) @string
(char_literal) @character
(integer_literal) @number
(float_literal) @number
(boolean_literal) @boolean
(wildcard) @constant.builtin
(binding_identifier) @variable.parameter

; Keywords
[
  "module"
  "import"
  "typeclass"
  "impl"
  "fn"
  "macro"
  "const"
  "static"
  "type"
  "struct"
  "union"
  "enum"
  "let"
  "for"
  "match"
  "do"
  "while"
  "if"
  "else"
  "goto"
  "break"
  "continue"
  "return"
  "case"
  "of"
  "in"
  "<-"
] @keyword

; Types and type parameters
(struct_type (identifier) @type)
(union_type (identifier) @type)
(enum_type (identifier) @type)
(typeclass_declaration (typeclass_name (identifier) @type))
(typeclass_declaration (identifier) @type)
(type_declaration (typevarspec (identifier) @type))
(type_name (name_spec (identifier) @type))
(generic_parameter (typevarspec (identifier) @type.parameter))

; Functions and macros
(function_declaration (identifier) @function)
(macro_declaration (identifier) @function.macro)

; Calls
(
  (postfix_expression
    (name_spec) @function.call
    (argument_list))
)
(
  (postfix_expression
    (postfix_expression
      (name_spec) @function.call)
    (argument_list))
)
(
  (postfix_expression
    (postfix_expression
      (postfix_expression
        "."
        (identifier) @function.method.call))
    (argument_list))
)
(
  (postfix_expression
    (postfix_expression
      (postfix_expression
        (name_spec)
        "."
        (identifier) @function.method.call))
    (argument_list))
)
(
  (postfix_expression
    (name_spec) @function.macro.call
    (macro_arguments))
)
(
  (postfix_expression
    (postfix_expression
      (name_spec) @function.macro.call)
    (macro_arguments))
)

; Constants and enum members
(const_declaration (identifier) @constant)
(enum_member (identifier) @constant)

; Properties and fields
(member_definition (identifier) @property)
(init_pair (identifier) @property)

; Attributes and labels
(attribute_list (identifier) @attribute)
(label_statement (identifier) @label)
(goto_statement (identifier) @label)
(break_statement (identifier) @label)
(continue_statement (identifier) @label)

; Punctuation
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "::"
  "."
  "->"
  "=>"
  "@"
  "?"
] @punctuation.delimiter

; Operators
[
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "&="
  "|="
  "^="
  "<<="
  ">>="
  "&&"
  "||"
  "!"
  "~"
  "+"
  "-"
  "*"
  "/"
  "%"
  "&"
  "|"
  "<>"
  "<<"
  ">>"
  "<"
  "<="
  ">"
  ">="
  "=="
  "!="
  "^"
  "++"
  "--"
] @operator

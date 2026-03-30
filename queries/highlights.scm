; Literals
(comment) @comment
(string_literal) @string
(char_literal) @character
(integer_literal) @number
(float_literal) @number
(boolean_literal) @boolean
(wildcard) @constant.builtin
[ "true" "false" ] @constant.builtin
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

; Type
(type_identifier) @type

; Functions and macros
(function_declaration (identifier) @function)
(macro_declaration (identifier) @function.macro)

; Calls
(function_call_expression
  (identifier) @function.call
  "(")

(function_call_expression
  (path
      "::"
     (identifier) @function.call)
  "(")

(function_call_expression
  (instantiation
    (path 
      "::"
      (identifier) @function.call))
  "(")

(function_call_expression
  (instantiation
    (identifier) @function.call
    "::")
  "(")

(function_call_expression
  (dot_expression
    "."
    (identifier) @function.method.call))

(function_call_expression
  (arrow_expression
    "->"
    (identifier) @function.method.call))

(macro_call_expression
    (path) @function.macro.call)

(macro_call_expression
    (identifier) @function.macro.call)

; Constants and enum members
(const_declaration (identifier) @constant)
(enum_member (identifier) @constant)

; Properties and fields
(member_definition (identifier) @property)
(init_pair (identifier) @property)

; Attributes and labels
(attribute_list (identifier) @attribute)
(label_statement "@" (identifier) @label)
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

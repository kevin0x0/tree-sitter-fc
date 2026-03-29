package tree_sitter_fc_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_fc "github.com/kevin0x0/tree-sitter-fc/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_fc.Language())
	if language == nil {
		t.Errorf("Error loading Fc grammar")
	}
}

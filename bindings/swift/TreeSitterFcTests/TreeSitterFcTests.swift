import XCTest
import SwiftTreeSitter
import TreeSitterFc

final class TreeSitterFcTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_fc())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Fc grammar")
    }
}

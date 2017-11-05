var AccessibilityExt = require("nativescript-accessibility-ext").AccessibilityExt;
var accessibilityExt = new AccessibilityExt();

describe("greet function", function() {
    it("exists", function() {
        expect(accessibilityExt.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(accessibilityExt.greet()).toEqual("Hello, NS");
    });
});
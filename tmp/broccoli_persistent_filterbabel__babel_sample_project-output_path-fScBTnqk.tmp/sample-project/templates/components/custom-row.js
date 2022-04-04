define("sample-project/templates/components/custom-row", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "revision": "Ember@2.9.1",
              "loc": {
                "source": null,
                "start": {
                  "line": 6,
                  "column": 6
                },
                "end": {
                  "line": 8,
                  "column": 6
                }
              },
              "moduleName": "sample-project/templates/components/custom-row.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("img");
              dom.setAttribute(el1, "class", "icon mg-l-15");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element1 = dom.childAt(fragment, [1]);
              var morphs = new Array(1);
              morphs[0] = dom.createAttrMorph(element1, 'src');
              return morphs;
            },
            statements: [["attribute", "src", ["get", "model.icon", ["loc", [null, [7, 40], [7, 50]]], 0, 0, 0, 0], 0, 0, 0, 0]],
            locals: [],
            templates: []
          };
        })();
        var child1 = (function () {
          return {
            meta: {
              "revision": "Ember@2.9.1",
              "loc": {
                "source": null,
                "start": {
                  "line": 9,
                  "column": 6
                },
                "end": {
                  "line": 17,
                  "column": 6
                }
              },
              "moduleName": "sample-project/templates/components/custom-row.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "input", [], ["class", "input", "value", ["subexpr", "@mut", [["get", "model.value", ["loc", [null, [12, 16], [12, 27]]], 0, 0, 0, 0]], [], [], 0, 0], "autoFocus", true, "mouseLeave", ["subexpr", "action", ["onBlur", ["get", "model", ["loc", [null, [14, 38], [14, 43]]], 0, 0, 0, 0]], [], ["loc", [null, [14, 21], [14, 44]]], 0, 0], "disabled", ["subexpr", "@mut", [["get", "isDisabled", ["loc", [null, [15, 19], [15, 29]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [10, 8], [16, 10]]], 0, 0]],
            locals: [],
            templates: []
          };
        })();
        var child2 = (function () {
          return {
            meta: {
              "revision": "Ember@2.9.1",
              "loc": {
                "source": null,
                "start": {
                  "line": 17,
                  "column": 6
                },
                "end": {
                  "line": 24,
                  "column": 6
                }
              },
              "moduleName": "sample-project/templates/components/custom-row.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "input", [], ["class", ["subexpr", "if", [["get", "showHover", ["loc", [null, [19, 20], [19, 29]]], 0, 0, 0, 0], "input interactable text-ellipsis", "input text-ellipsis"], [], ["loc", [null, [19, 16], [19, 87]]], 0, 0], "value", ["subexpr", "@mut", [["get", "model.value", ["loc", [null, [20, 16], [20, 27]]], 0, 0, 0, 0]], [], [], 0, 0], "doubleClick", ["subexpr", "action", ["onDoubleClick", ["get", "model", ["loc", [null, [21, 46], [21, 51]]], 0, 0, 0, 0]], [], ["loc", [null, [21, 22], [21, 52]]], 0, 0], "disabled", true], ["loc", [null, [18, 8], [23, 10]]], 0, 0]],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "revision": "Ember@2.9.1",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 4
              },
              "end": {
                "line": 25,
                "column": 4
              }
            },
            "moduleName": "sample-project/templates/components/custom-row.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            morphs[1] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "if", [["get", "model.icon", ["loc", [null, [6, 12], [6, 22]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [6, 6], [8, 13]]]], ["block", "if", [["get", "isEditing", ["loc", [null, [9, 12], [9, 21]]], 0, 0, 0, 0]], [], 1, 2, ["loc", [null, [9, 6], [24, 13]]]]],
          locals: [],
          templates: [child0, child1, child2]
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          var child0 = (function () {
            return {
              meta: {
                "revision": "Ember@2.9.1",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 28,
                    "column": 8
                  },
                  "end": {
                    "line": 30,
                    "column": 8
                  }
                },
                "moduleName": "sample-project/templates/components/custom-row.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("          ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("img");
                dom.setAttribute(el1, "class", "icon");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var element0 = dom.childAt(fragment, [1]);
                var morphs = new Array(1);
                morphs[0] = dom.createAttrMorph(element0, 'src');
                return morphs;
              },
              statements: [["attribute", "src", ["get", "model.icon", ["loc", [null, [29, 34], [29, 44]]], 0, 0, 0, 0], 0, 0, 0, 0]],
              locals: [],
              templates: []
            };
          })();
          return {
            meta: {
              "revision": "Ember@2.9.1",
              "loc": {
                "source": null,
                "start": {
                  "line": 27,
                  "column": 6
                },
                "end": {
                  "line": 32,
                  "column": 6
                }
              },
              "moduleName": "sample-project/templates/components/custom-row.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("span");
              var el2 = dom.createComment("");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(2);
              morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
              morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2]), 0, 0);
              dom.insertBoundary(fragment, 0);
              return morphs;
            },
            statements: [["block", "if", [["get", "model.icon", ["loc", [null, [28, 14], [28, 24]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [28, 8], [30, 15]]]], ["content", "model.hint", ["loc", [null, [31, 14], [31, 28]]], 0, 0, 0, 0]],
            locals: [],
            templates: [child0]
          };
        })();
        return {
          meta: {
            "revision": "Ember@2.9.1",
            "loc": {
              "source": null,
              "start": {
                "line": 26,
                "column": 4
              },
              "end": {
                "line": 33,
                "column": 4
              }
            },
            "moduleName": "sample-project/templates/components/custom-row.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "dd.content", [], ["class", "basic-dropdown-menu"], 0, null, ["loc", [null, [27, 6], [32, 21]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.9.1",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 2
            },
            "end": {
              "line": 34,
              "column": 2
            }
          },
          "moduleName": "sample-project/templates/components/custom-row.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "dd.trigger", [], ["class", "dropdown-trigger"], 0, null, ["loc", [null, [5, 4], [25, 19]]]], ["block", "if", [["subexpr", "and", [["get", "model.hint", ["loc", [null, [26, 15], [26, 25]]], 0, 0, 0, 0], ["subexpr", "not", [["get", "isEditing", ["loc", [null, [26, 31], [26, 40]]], 0, 0, 0, 0]], [], ["loc", [null, [26, 26], [26, 41]]], 0, 0]], [], ["loc", [null, [26, 10], [26, 42]]], 0, 0]], [], 1, null, ["loc", [null, [26, 4], [33, 11]]]]],
        locals: ["dd"],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.9.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 35,
            "column": 6
          }
        },
        "moduleName": "sample-project/templates/components/custom-row.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("label");
        dom.setAttribute(el1, "class", "muted-text label-text");
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 1, 1);
        return morphs;
      },
      statements: [["content", "model.label", ["loc", [null, [2, 38], [2, 53]]], 0, 0, 0, 0], ["block", "basic-dropdown", [], ["horizontalPosition", "left"], 0, null, ["loc", [null, [4, 2], [34, 21]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
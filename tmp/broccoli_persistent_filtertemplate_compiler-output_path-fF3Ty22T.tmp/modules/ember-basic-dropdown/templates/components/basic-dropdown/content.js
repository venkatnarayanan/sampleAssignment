export default Ember.HTMLBars.template((function() {
  var child0 = (function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@2.9.1",
            "loc": {
              "source": null,
              "start": {
                "line": 3,
                "column": 4
              },
              "end": {
                "line": 5,
                "column": 4
              }
            },
            "moduleName": "modules/ember-basic-dropdown/templates/components/basic-dropdown/content.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","ember-basic-dropdown-overlay");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@2.9.1",
            "loc": {
              "source": null,
              "start": {
                "line": 6,
                "column": 4
              },
              "end": {
                "line": 13,
                "column": 4
              }
            },
            "moduleName": "modules/ember-basic-dropdown/templates/components/basic-dropdown/content.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["content","yield",["loc",[null,[12,6],[12,15]]],0,0,0,0]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@2.9.1",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 14,
              "column": 2
            }
          },
          "moduleName": "modules/ember-basic-dropdown/templates/components/basic-dropdown/content.hbs"
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
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          morphs[1] = dom.createMorphAt(fragment,1,1,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","overlay",["loc",[null,[3,10],[3,17]]],0,0,0,0]],[],0,null,["loc",[null,[3,4],[5,11]]]],
          ["block","basic-dropdown/content-element",[],["tagName",["subexpr","@mut",[["get","_contentTagName",["loc",[null,[7,14],[7,29]]],0,0,0,0]],[],[],0,0],"id",["subexpr","@mut",[["get","dropdownId",["loc",[null,[8,9],[8,19]]],0,0,0,0]],[],[],0,0],"class",["subexpr","concat",["ember-basic-dropdown-content ",["get","class",["loc",[null,[9,52],[9,57]]],0,0,0,0]," ",["get","defaultClass",["loc",[null,[9,62],[9,74]]],0,0,0,0]," ",["subexpr","if",[["get","renderInPlace",["loc",[null,[9,83],[9,96]]],0,0,0,0],"ember-basic-dropdown-content--in-place "],[],["loc",[null,[9,79],[9,139]]],0,0],["subexpr","if",[["get","hPosition",["loc",[null,[9,144],[9,153]]],0,0,0,0],["subexpr","concat",["ember-basic-dropdown-content--",["get","hPosition",["loc",[null,[9,195],[9,204]]],0,0,0,0]],[],["loc",[null,[9,154],[9,205]]],0,0]],[],["loc",[null,[9,140],[9,206]]],0,0]," ",["subexpr","if",[["get","vPosition",["loc",[null,[9,215],[9,224]]],0,0,0,0],["subexpr","concat",["ember-basic-dropdown-content--",["get","vPosition",["loc",[null,[9,266],[9,275]]],0,0,0,0]],[],["loc",[null,[9,225],[9,276]]],0,0]],[],["loc",[null,[9,211],[9,277]]],0,0]," ",["get","animationClass",["loc",[null,[9,282],[9,296]]],0,0,0,0]],[],["loc",[null,[9,12],[9,297]]],0,0],"style",["subexpr","@mut",[["get","style",["loc",[null,[10,12],[10,17]]],0,0,0,0]],[],[],0,0],"dir",["subexpr","@mut",[["get","dir",["loc",[null,[11,10],[11,13]]],0,0,0,0]],[],[],0,0]],1,null,["loc",[null,[6,4],[13,39]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
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
            "line": 15,
            "column": 0
          }
        },
        "moduleName": "modules/ember-basic-dropdown/templates/components/basic-dropdown/content.hbs"
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
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","ember-wormhole",[],["to",["subexpr","@mut",[["get","to",["loc",[null,[2,23],[2,25]]],0,0,0,0]],[],[],0,0],"renderInPlace",["subexpr","@mut",[["get","renderInPlace",["loc",[null,[2,40],[2,53]]],0,0,0,0]],[],[],0,0],"class","ember-basic-dropdown-content-wormhole-origin"],0,null,["loc",[null,[2,2],[14,21]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }());
  var child1 = (function() {
    return {
      meta: {
        "revision": "Ember@2.9.1",
        "loc": {
          "source": null,
          "start": {
            "line": 15,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 0
          }
        },
        "moduleName": "modules/ember-basic-dropdown/templates/components/basic-dropdown/content.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("  ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ember-basic-dropdown-content-placeholder");
        dom.setAttribute(el1,"style","display: none;");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1]);
        var morphs = new Array(1);
        morphs[0] = dom.createAttrMorph(element0, 'id');
        return morphs;
      },
      statements: [
        ["attribute","id",["get","dropdownId",["loc",[null,[16,12],[16,22]]],0,0,0,0],0,0,0,0]
      ],
      locals: [],
      templates: []
    };
  }());
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
          "line": 17,
          "column": 7
        }
      },
      "moduleName": "modules/ember-basic-dropdown/templates/components/basic-dropdown/content.hbs"
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
      morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
      dom.insertBoundary(fragment, 0);
      dom.insertBoundary(fragment, null);
      return morphs;
    },
    statements: [
      ["block","if",[["get","dropdown.isOpen",["loc",[null,[1,6],[1,21]]],0,0,0,0]],[],0,1,["loc",[null,[1,0],[17,7]]]]
    ],
    locals: [],
    templates: [child0, child1]
  };
}()));
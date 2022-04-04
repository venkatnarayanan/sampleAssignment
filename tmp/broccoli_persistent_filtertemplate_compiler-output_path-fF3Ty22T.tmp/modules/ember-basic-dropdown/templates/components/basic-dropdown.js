export default Ember.HTMLBars.template((function() {
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
          "line": 27,
          "column": 0
        }
      },
      "moduleName": "modules/ember-basic-dropdown/templates/components/basic-dropdown.hbs"
    },
    isEmpty: false,
    arity: 0,
    cachedFragment: null,
    hasRendered: false,
    buildFragment: function buildFragment(dom) {
      var el0 = dom.createDocumentFragment();
      var el1 = dom.createComment("");
      dom.appendChild(el0, el1);
      var el1 = dom.createTextNode("\n");
      dom.appendChild(el0, el1);
      return el0;
    },
    buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
      var morphs = new Array(1);
      morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
      dom.insertBoundary(fragment, 0);
      return morphs;
    },
    statements: [
      ["inline","yield",[["subexpr","hash",[],["uniqueId",["get","publicAPI.uniqueId",["loc",[null,[2,11],[2,29]]],0,0,0,0],"isOpen",["get","publicAPI.isOpen",["loc",[null,[3,9],[3,25]]],0,0,0,0],"disabled",["get","publicAPI.disabled",["loc",[null,[4,11],[4,29]]],0,0,0,0],"actions",["get","publicAPI.actions",["loc",[null,[5,10],[5,27]]],0,0,0,0],"trigger",["subexpr","component",[["get","triggerComponent",["loc",[null,[6,21],[6,37]]],0,0,0,0]],["dropdown",["subexpr","readonly",[["get","publicAPI",["loc",[null,[7,23],[7,32]]],0,0,0,0]],[],["loc",[null,[7,13],[7,33]]],0,0],"hPosition",["subexpr","readonly",[["get","hPosition",["loc",[null,[8,24],[8,33]]],0,0,0,0]],[],["loc",[null,[8,14],[8,34]]],0,0],"onFocus",["subexpr","action",["handleFocus"],[],["loc",[null,[9,12],[9,34]]],0,0],"renderInPlace",["subexpr","readonly",[["get","renderInPlace",["loc",[null,[10,28],[10,41]]],0,0,0,0]],[],["loc",[null,[10,18],[10,42]]],0,0],"vPosition",["subexpr","readonly",[["get","vPosition",["loc",[null,[11,24],[11,33]]],0,0,0,0]],[],["loc",[null,[11,14],[11,34]]],0,0]],["loc",[null,[6,10],[12,3]]],0,0],"content",["subexpr","component",[["get","contentComponent",["loc",[null,[13,21],[13,37]]],0,0,0,0]],["dropdown",["subexpr","readonly",[["get","publicAPI",["loc",[null,[14,23],[14,32]]],0,0,0,0]],[],["loc",[null,[14,13],[14,33]]],0,0],"hPosition",["subexpr","readonly",[["get","hPosition",["loc",[null,[15,24],[15,33]]],0,0,0,0]],[],["loc",[null,[15,14],[15,34]]],0,0],"renderInPlace",["subexpr","readonly",[["get","renderInPlace",["loc",[null,[16,28],[16,41]]],0,0,0,0]],[],["loc",[null,[16,18],[16,42]]],0,0],"preventScroll",["subexpr","readonly",[["get","preventScroll",["loc",[null,[17,28],[17,41]]],0,0,0,0]],[],["loc",[null,[17,18],[17,42]]],0,0],"vPosition",["subexpr","readonly",[["get","vPosition",["loc",[null,[18,24],[18,33]]],0,0,0,0]],[],["loc",[null,[18,14],[18,34]]],0,0],"destination",["subexpr","readonly",[["get","destination",["loc",[null,[19,26],[19,37]]],0,0,0,0]],[],["loc",[null,[19,16],[19,38]]],0,0],"top",["subexpr","readonly",[["get","top",["loc",[null,[20,18],[20,21]]],0,0,0,0]],[],["loc",[null,[20,8],[20,22]]],0,0],"left",["subexpr","readonly",[["get","left",["loc",[null,[21,19],[21,23]]],0,0,0,0]],[],["loc",[null,[21,9],[21,24]]],0,0],"right",["subexpr","readonly",[["get","right",["loc",[null,[22,20],[22,25]]],0,0,0,0]],[],["loc",[null,[22,10],[22,26]]],0,0],"width",["subexpr","readonly",[["get","width",["loc",[null,[23,20],[23,25]]],0,0,0,0]],[],["loc",[null,[23,10],[23,26]]],0,0],"height",["subexpr","readonly",[["get","height",["loc",[null,[24,21],[24,27]]],0,0,0,0]],[],["loc",[null,[24,11],[24,28]]],0,0]],["loc",[null,[13,10],[25,3]]],0,0]],["loc",[null,[1,8],[26,1]]],0,0]],[],["loc",[null,[1,0],[26,3]]],0,0]
    ],
    locals: [],
    templates: []
  };
}()));
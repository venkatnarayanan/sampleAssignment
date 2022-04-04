define("sample-project/routes/application", ["exports", "ember"], function (exports, _ember) {

  var data = [[{ editable: false, label: "Opportunity Name", value: "Biffco Enterprices Ltd" }, { editable: true, label: "Deal Amount", value: "100" } // deal amount
  ], [{ editable: false, label: "Alert", hint: "Deal Stage moved to Negotation", value: "1 Notification" }, // 1 notification
  { editable: false, label: "Nektar Score", value: "80" } // nektar score
  ], [{ editable: false, label: "Deal Stage", hint: "Deal amount has been reduced in last 10 days", icon: "flag.png", value: "Negotation" }, // image
  { editable: false, label: "Created At", value: "19 days ago" }]];

  var Route = _ember["default"].Route;
  exports["default"] = Route.extend({
    model: function model() {
      return data;
    }
  });
});
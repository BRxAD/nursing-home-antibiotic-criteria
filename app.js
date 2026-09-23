(function () {
  var data = AntibioticCriteria;
  var state = {
    conditionId: null,
    pathwayId: null,
    selected: {},
    gateOn: false,
    infoOpen: false,
    tableOpen: false,
    submitted: false
  };

  var app = document.getElementById("app");
  var tableDialog = document.getElementById("table-dialog");
  var lastFocus = null;

  function pathway() {
    return state.pathwayId ? data.pathways[state.pathwayId] : null;
  }

  function condition() {
    return data.conditions.find(function (entry) {
      return entry.id === state.conditionId;
    });
  }

  function resultFor(current) {
    return data.evaluate(current, state.selected, state.gateOn);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function linkLabel(label) {
    var fragment = document.createDocumentFragment();
    var pattern = /\b(Fever|Delirium|delirium)\b/g;
    var last = 0;
    var match;
    while ((match = pattern.exec(label))) {
      if (match.index > last) fragment.appendChild(document.createTextNode(label.slice(last, match.index)));
      var link = document.createElement("a");
      link.href = "#table-2";
      link.className = "table-link";
      link.textContent = match[1];
      link.title = "Supplementary Material, Table 2";
      link.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        openTable();
      });
      fragment.appendChild(link);
      last = match.index + match[0].length;
    }
    if (last < label.length) fragment.appendChild(document.createTextNode(label.slice(last)));
    return fragment;
  }

  function render() {
    app.replaceChildren();
    if (!state.conditionId) {
      renderHome();
      return;
    }
    var currentCondition = condition();
    if (!state.pathwayId) {
      renderBranch(currentCondition);
      return;
    }
    renderAssess(pathway());
  }

  function renderHome() {
    var header = el("header", "home-head");
    header.appendChild(el("p", "eyebrow", "Nursing home"));
    header.appendChild(el("h1", "home-title", "Empiric antibiotic criteria"));
    header.appendChild(el("p", "lede", "Select the suspected infection. Check the findings that are present, then submit."));
    app.appendChild(header);

    var list = el("div", "choice-list");
    data.conditions.forEach(function (entry) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      var name = el("span", "choice-name", entry.name);
      var scope = el("span", "choice-scope", entry.scope);
      button.append(name, scope, chevron());
      button.addEventListener("click", function () {
        openCondition(entry);
      });
      list.appendChild(button);
    });
    app.appendChild(list);
    app.appendChild(disclaimer());
  }

  function renderBranch(currentCondition) {
    app.appendChild(mast(currentCondition.name, "Conditions", function () {
      state.conditionId = null;
      state.pathwayId = null;
      clearFindings();
      render();
    }, null));

    var intro = el("p", "rule", "Choose the presentation that matches this resident.");
    app.appendChild(intro);

    var list = el("div", "choice-list");
    currentCondition.pathways.forEach(function (id) {
      var entry = data.pathways[id];
      var button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.append(el("span", "choice-name", entry.name), chevron());
      button.addEventListener("click", function () {
        state.pathwayId = id;
        clearFindings();
        render();
      });
      list.appendChild(button);
    });
    app.appendChild(list);
  }

  function renderAssess(current) {
    var parent = condition();
    var backLabel = parent.pathways.length > 1 ? parent.name : "Conditions";
    var bar = mast(current.name, backLabel, function () {
      if (parent.pathways.length > 1) {
        state.pathwayId = null;
      } else {
        state.conditionId = null;
        state.pathwayId = null;
      }
      clearFindings();
      render();
    }, current);
    app.appendChild(bar);

    var sheet = el("div", "sheet");
    if (current.notice) sheet.appendChild(el("p", "notice", current.notice));

    if (current.gate) {
      sheet.appendChild(gateControl(current));
    }

    walkGroups(current.logic, function (group) {
      sheet.appendChild(groupSection(group));
    });

    var tools = el("div", "sheet-tools");
    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "text-button";
    clear.textContent = "Clear findings";
    clear.addEventListener("click", function () {
      clearFindings();
      render();
    });
    var submit = document.createElement("button");
    submit.type = "button";
    submit.className = "submit-button";
    submit.textContent = "Submit";
    submit.addEventListener("click", function () {
      state.submitted = true;
      paintResult(current);
      var detail = document.getElementById("detail");
      if (detail) {
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        detail.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      }
    });
    tools.append(clear, submit);
    sheet.appendChild(tools);
    app.appendChild(sheet);

    var detail = el("section", "detail");
    detail.id = "detail";
    app.appendChild(detail);
    app.appendChild(disclaimer());
    if (state.submitted) paintResult(current);
  }

  function walkGroups(node, fn) {
    if (!node.op) {
      fn(node);
      return;
    }
    if (node.heading) {
      var wrap = el("section", "group nested");
      node.groups.forEach(function (group) {
        wrap.appendChild(groupSection(group));
      });
      fn.nested = true;
      var sheetParent = wrap;
      return sheetParent;
    }
    node.groups.forEach(function (group) {
      if (group.op) {
        var nested = walkGroups(group, fn);
        if (nested) fn(nested);
      } else {
        fn(group);
      }
    });
  }

  function groupSection(group) {
    if (group.nodeType === 1) return group;
    var section = el("section", "group");
    group.items.forEach(function (entry) {
      section.appendChild(checkRow(entry));
    });
    return section;
  }

  function checkRow(entry) {
    var label = document.createElement("label");
    label.className = "check" + (state.selected[entry.id] ? " is-on" : "");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!state.selected[entry.id];
    input.addEventListener("change", function () {
      state.selected[entry.id] = input.checked;
      if (!input.checked) delete state.selected[entry.id];
      label.classList.toggle("is-on", input.checked);
      state.submitted = false;
      clearResult();
    });
    var copy = el("span", "check-copy");
    var title = el("span", "check-label");
    title.appendChild(linkLabel(entry.label));
    copy.appendChild(title);
    if (entry.hint) copy.appendChild(el("span", "hint", entry.hint));
    label.append(input, copy);
    return label;
  }

  function gateControl(current) {
    var label = document.createElement("label");
    label.className = "check gate" + (state.gateOn ? " is-on" : "");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.gateOn;
    input.addEventListener("change", function () {
      state.gateOn = input.checked;
      label.classList.toggle("is-on", input.checked);
      state.submitted = false;
      clearResult();
    });
    var copy = el("span", "check-copy");
    copy.appendChild(el("span", "check-label", current.gate.label));
    copy.appendChild(el("span", "hint", "Leave this unchecked when the result is expected within 24 hours. Await the result if the resident is clinically stable."));
    label.append(input, copy);
    var section = el("section", "group");
    section.appendChild(label);
    return section;
  }

  function clearResult() {
    var detail = document.getElementById("detail");
    if (detail) detail.replaceChildren();
  }

  function paintResult(current) {
    var detail = document.getElementById("detail");
    if (!detail || !state.submitted) return;
    var outcome = resultFor(current);
    detail.replaceChildren();

    var verdict = el("div", "verdict " + (outcome.met ? "is-met" : "is-hold"));
    verdict.setAttribute("role", "status");
    verdict.setAttribute("aria-live", "polite");
    var flag = el("div", "flag");
    var word = el("p", "verdict-word", outcome.met ? "Met" : "Not met");
    var meaning = el("p", "verdict-meaning", outcome.met
      ? "Minimum criteria for empiric antibiotic therapy are met."
      : "Minimum criteria for empiric antibiotic therapy are not met.");
    var text = el("div", "verdict-text");
    text.append(word, meaning);
    verdict.append(flag, text);
    detail.appendChild(verdict);

    if (!outcome.met) detail.appendChild(supportBlock(current.support));
  }

  function supportBlock(support) {
    var section = el("section", "panel support");
    section.appendChild(el("h2", "panel-title", "Supportive care"));
    section.appendChild(el("p", null, support.lead));
    var list = el("ul", "plain-list");
    support.steps.forEach(function (step) {
      list.appendChild(el("li", null, step));
    });
    section.appendChild(list);
    if (support.close) section.appendChild(el("p", null, support.close));
    return section;
  }

  function mast(title, backLabel, onBack, current) {
    var bar = el("div", "mast");
    var row = el("div", "mast-row");
    var back = document.createElement("button");
    back.type = "button";
    back.className = "back";
    back.append(chevronBack(), el("span", null, backLabel));
    back.addEventListener("click", onBack);
    row.appendChild(back);
    if (current) row.appendChild(infoButton(current));
    var heading = el("h1", "mast-title", title);
    bar.append(row, heading);
    return bar;
  }

  function infoButton(current) {
    var wrap = el("div", "info-wrap");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "info-button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", current.interpretation.title);
    button.appendChild(el("span", "info-mark", "i"));

    var pop = el("div", "info-pop");
    pop.hidden = true;
    pop.setAttribute("role", "region");
    pop.setAttribute("aria-label", current.interpretation.title);
    var head = el("div", "dialog-head");
    head.appendChild(el("h2", null, current.interpretation.title));
    var close = document.createElement("button");
    close.type = "button";
    close.className = "dialog-close";
    close.textContent = "Close";
    head.appendChild(close);
    var list = el("ul", "plain-list");
    current.interpretation.steps.forEach(function (step) {
      list.appendChild(el("li", null, step));
    });
    pop.append(head, list);

    wrap._pinned = false;
    function show() {
      pop.hidden = false;
      button.setAttribute("aria-expanded", "true");
    }
    function hide() {
      if (wrap._pinned) return;
      pop.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }
    button.addEventListener("click", function () {
      wrap._pinned = pop.hidden || !wrap._pinned;
      if (wrap._pinned) show();
      else hide();
    });
    close.addEventListener("click", function (event) {
      event.stopPropagation();
      wrap._pinned = false;
      hide();
      button.focus();
    });
    wrap.addEventListener("mouseenter", show);
    wrap.addEventListener("mouseleave", hide);

    wrap.append(button, pop);
    return wrap;
  }

  function openTable() {
    lastFocus = document.activeElement;
    tableDialog.hidden = false;
    state.tableOpen = true;
    document.getElementById("table-close").focus();
  }

  function closeDialogs() {
    tableDialog.hidden = true;
    state.tableOpen = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openCondition(entry) {
    state.conditionId = entry.id;
    clearFindings();
    if (entry.pathways.length === 1) state.pathwayId = entry.pathways[0];
    else state.pathwayId = null;
    render();
  }

  function clearFindings() {
    state.selected = {};
    state.gateOn = false;
    state.submitted = false;
  }

  function disclaimer() {
    return el("p", "disclaimer", "Decision aid only. It applies the minimum criteria for starting empiric antibiotics and does not replace clinical judgment, resident-specific assessment, or local protocol.");
  }

  function chevron() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("chevron");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M7 4l6 6-6 6");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    svg.appendChild(path);
    return svg;
  }

  function chevronBack() {
    var svg = chevron();
    svg.classList.add("chevron-back");
    return svg;
  }

  document.getElementById("table-close").addEventListener("click", closeDialogs);
  tableDialog.addEventListener("click", function (event) {
    if (event.target === tableDialog) closeDialogs();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    closeDialogs();
    document.querySelectorAll(".info-wrap").forEach(function (wrap) {
      wrap._pinned = false;
      var pop = wrap.querySelector(".info-pop");
      var button = wrap.querySelector(".info-button");
      if (pop) pop.hidden = true;
      if (button) button.setAttribute("aria-expanded", "false");
    });
  });

  render();
})();

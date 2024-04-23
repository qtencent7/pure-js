import {
    jsx as _jsx,
    jsxs as _jsxs,
    Fragment as _Fragment
  } from "react/jsx-runtime";
_jsxs(_Fragment, {
    children: [
      _jsxs("div", {
        class: true,
        var: "container",
        children: [
          _jsx("input", {
            placeholder: true,
            type: true,
            var: "input"
          }),
          _jsx("input", {
            type: true,
            value: true,
            onclick: true,
            var: "button"
          })
        ]
      }),
      _jsx("div", {
        children: _jsxs("div", {
          for: "videos",
          children: [
            _jsx("h1", {
              children: "#title#"
            }),
            _jsx("video", {
              src: true,
              controls: true
            })
          ]
        })
      })
    ]
  });
  
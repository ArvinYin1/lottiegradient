import json

import py_aep

GRAD_FILL = "ADBE Vector Graphic - G-Fill"
GRAD_STROKE = "ADBE Vector Graphic - G-Stroke"
GRAD_MATCH = {GRAD_FILL, GRAD_STROKE}


def r3(value):
    out = round(float(value), 3)
    return 0.0 if out == 0 else out


def expand_stops(stops, value_getter):
    """Bodymovin 的中点展开：N 个停靠点 → 2N-1 个。"""
    out = []
    for i, stop in enumerate(stops):
        out.append((float(stop.offset), value_getter(stop)))
        if i + 1 < len(stops):
            nxt = stops[i + 1]
            mid = float(getattr(stop, "midpoint", 0.5) or 0.5)
            offset = float(stop.offset) + (float(nxt.offset) - float(stop.offset)) * mid
            va, vb = value_getter(stop), value_getter(nxt)
            if isinstance(va, tuple):
                value = tuple(a + (b - a) * mid for a, b in zip(va, vb))
            else:
                value = va + (vb - va) * mid
            out.append((offset, value))
    return out


def gradient_to_lottie(grad):
    colors = expand_stops(grad.color_stops, lambda s: tuple(float(c) for c in s.color))
    alphas = expand_stops(grad.alpha_stops, lambda s: float(s.alpha))
    k = []
    for offset, rgb in colors:
        k.extend([r3(offset)] + [r3(c) for c in rgb])
    has_alpha = any(round(a, 3) != 1 for _, a in alphas)
    if has_alpha:
        for offset, alpha in alphas:
            k.extend([r3(offset), r3(alpha)])
    return k, len(colors), has_alpha


def _walk(group, trail, found):
    for sub in getattr(group, "properties", []) or []:
        match_name = getattr(sub, "match_name", "") or ""
        name = getattr(sub, "name", "") or ""
        if match_name in GRAD_MATCH:
            found.append((trail + [name], sub, match_name))
        elif match_name == "ADBE Vector Group":
            try:
                inner = sub.property("ADBE Vectors Group")
            except Exception:
                inner = sub
            _walk(inner, trail + [name], found)


def collect(aep_path):
    """返回该工程里所有形状层的渐变（含真实色标与透明度色标）。"""
    app = py_aep.parse(aep_path)
    out = []
    for comp in app.project.compositions:
        for layer in comp.layers:
            try:
                root = layer.property("ADBE Root Vectors Group")
            except Exception:
                continue
            found = []
            _walk(root, [], found)
            for trail, prop, match_name in found:
                try:
                    colors_prop = prop.property("ADBE Vector Grad Colors")
                except Exception:
                    continue
                time_varying = bool(getattr(colors_prop, "is_time_varying", False))
                if time_varying:
                    keys = getattr(colors_prop, "keyframes", []) or []
                    grad = keys[0].value if keys else None
                else:
                    grad = colors_prop.value
                if grad is None:
                    continue
                k, p, has_alpha = gradient_to_lottie(grad)
                out.append({
                    "path": [comp.name, layer.name] + trail,
                    "comp": comp.name,
                    "layer": layer.name,
                    "groups": trail[:-1],
                    "nm": trail[-1],
                    "ty": "gf" if match_name == GRAD_FILL else "gs",
                    "time_varying": time_varying,
                    "p": p,
                    "k": k,
                    "has_alpha": has_alpha,
                    "ae": {
                        "colors": [[r3(s.offset), [r3(c) for c in s.color]] for s in grad.color_stops],
                        "alphas": [[r3(s.offset), r3(s.alpha)] for s in grad.alpha_stops],
                    },
                })
    return out

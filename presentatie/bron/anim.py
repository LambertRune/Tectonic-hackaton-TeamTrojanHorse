import bpy, math, os, sys
from mathutils import Vector
HERE = "/tmp/claude-1000/-home-rlambert-Documents-GitHub-Tectonic-hackaton-TeamTrojanHorse/aab61bc7-9e1a-47e5-a282-a39e933ee13d/scratchpad"
exec(open(f"{HERE}/weather.py").read())

N = 48  # loop length in frames (2 s at 24 fps)
AOUT = f"{HERE}/anim"


def cyc(ob, path=None):
    ad = ob.animation_data if path is None else path.animation_data
    if not ad or not ad.action:
        return
    act = ad.action
    curves = []
    # Blender 5 layered actions: walk channelbags; fall back to legacy fcurves
    try:
        for layer in act.layers:
            for strip in layer.strips:
                for cb in strip.channelbags:
                    curves += list(cb.fcurves)
    except AttributeError:
        curves = list(act.fcurves)
    for fc in curves:
        if not any(m.type == "CYCLES" for m in fc.modifiers):
            fc.modifiers.new("CYCLES")


def wave(ob, attr, idx, base, amp, phase=0):
    for i, f in enumerate(range(0, N + 1, N // 4)):
        v = base + amp * (0, 1, 0, -1, 0)[i]
        getattr(ob, attr)[idx] = v
        ob.keyframe_insert(attr, index=idx, frame=f + phase)
    cyc(ob)


def pivot():
    """Parent every object (except camera/lights) to an empty that sways +-10 deg."""
    e = bpy.data.objects.new("Pivot", None)
    sc.collection.objects.link(e)
    for o in list(sc.collection.objects):
        if o.type in {"CAMERA", "LIGHT"} or o is e or o.parent or o.hide_render:
            continue
        o.parent = e
    wave(e, "rotation_euler", 2, 0, math.radians(10))
    return e


def objs(prefix):
    return [o for o in sc.collection.objects if o.name.startswith(prefix)]


def rays_spin():
    ray_objs = [o for o in sc.collection.objects if o.type == "MESH" and o.active_material and o.active_material.name == "SunRay"]
    core = [o for o in sc.collection.objects if o.type == "MESH" and o.active_material and o.active_material.name == "Sun"]
    if not core:
        return
    c = core[0]
    hub = bpy.data.objects.new("RayHub", None); sc.collection.objects.link(hub)
    hub.location = c.location.copy()
    for r in ray_objs:
        mw = r.matrix_world.copy(); r.parent = hub; r.matrix_parent_inverse = hub.matrix_world.inverted(); r.matrix_world = mw
    hub.rotation_euler[1] = 0; hub.keyframe_insert("rotation_euler", index=1, frame=0)
    hub.rotation_euler[1] = math.tau / 10; hub.keyframe_insert("rotation_euler", index=1, frame=N)
    for fc in _curves(hub):
        for k in fc.keyframe_points:
            k.interpolation = "LINEAR"
    cyc(hub)
    for i, (f, s) in enumerate(((0, 1.0), (N // 2, 1.06), (N, 1.0))):
        c.scale = (s, s, s); c.keyframe_insert("scale", frame=f)
    cyc(c)


def _curves(ob):
    act = ob.animation_data.action
    try:
        return [fc for l in act.layers for st in l.strips for cb in st.channelbags for fc in cb.fcurves]
    except AttributeError:
        return list(act.fcurves)


def falling(drops, fall=1.3, slant=0.0):
    for i, d in enumerate(drops):
        ph = int(i * N / max(len(drops), 1)) % N
        z0, x0 = d.location.z + fall / 2, d.location.x - slant / 2
        s = d.scale[0]
        keys = ((0, z0, x0, 0.0), (6, z0 - fall * 0.12, x0 + slant * 0.12, s), (36, z0 - fall * 0.8, x0 + slant * 0.8, s), (42, z0 - fall, x0 + slant, 0.0), (48, z0, x0, 0.0))
        for f, z, x, sc_ in keys:
            d.location.z = z; d.location.x = x; d.scale = (sc_, sc_, sc_)
            d.keyframe_insert("location", frame=f + ph); d.keyframe_insert("scale", frame=f + ph)
        for fc in _curves(d):
            for k in fc.keyframe_points:
                k.interpolation = "LINEAR"
        cyc(d)


def flash(bolts, windows):
    for b, (on, off) in zip(bolts, windows):
        s = b.scale[0]
        for f, v in ((0, 0.0), (on - 1, 0.0), (on, s * 1.1), (on + 2, s), (off, s), (off + 1, 0.0), (N, 0.0)):
            b.scale = (v, v, v); b.keyframe_insert("scale", frame=f)
        for fc in _curves(b):
            for k in fc.keyframe_points:
                k.interpolation = "CONSTANT" if k.co[1] == 0 else "BEZIER"
        cyc(b)


def meta(name_prefix="Cloud"):
    return [o for o in sc.collection.objects if o.type == "META"]


def drops_list():
    return [o for o in sc.collection.objects if o.type == "MESH" and o.active_material and o.active_material.name == "Drop"]


def bolts_list():
    return sorted([o for o in sc.collection.objects if o.name.startswith("Bolt")], key=lambda o: o.name)


def animate(name):
    clouds = meta()
    if name in ("zon", "bewolkt"):
        rays_spin()
    for i, c in enumerate(clouds):
        wave(c, "location", 2, c.location.z, 0.08, phase=i * 6)
    if name == "bewolkt":
        for c in clouds:
            wave(c, "location", 0, c.location.x, 0.18)
    if name in ("regen",):
        falling(drops_list(), fall=1.2, slant=-0.25)
    if name == "storm":
        falling(drops_list(), fall=1.4, slant=-0.6)
        flash(bolts_list(), [(6, 16), (26, 34)])
        for c in clouds:
            wave(c, "location", 0, c.location.x, 0.06)
    if name == "donder":
        flash(bolts_list(), [(10, 40)])
    if name == "mist":
        bars = [o for o in sc.collection.objects if o.type == "MESH" and o.active_material and o.active_material.name == "Mist"]
        for i, b in enumerate(bars):
            wave(b, "location", 0, b.location.x, 0.35 * (1 if i % 2 else -1), phase=i * 5)
    if name == "regenboog":
        arcs = [o for o in sc.collection.objects if o.type == "MESH" and o.active_material and o.active_material.name.startswith("RB")]
        for i, a in enumerate(arcs):
            for f, s in ((0, 1.0), (12, 1.035), (24, 1.0), (48, 1.0)):
                a.scale = (s, s, s); a.keyframe_insert("scale", frame=f + i * 3)
            cyc(a)
    pivot()


def render_anim(name):
    os.makedirs(f"{AOUT}/{name}", exist_ok=True)
    sc.frame_start, sc.frame_end = 0, N - 1
    sc.render.fps = 24
    sc.render.resolution_x = sc.render.resolution_y = 560
    try:
        sc.eevee.taa_render_samples = 24
    except AttributeError:
        pass
    sc.render.filepath = f"{AOUT}/{name}/f_"
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    names = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else list(SCENES)
    for n in names:
        build(n)
        animate(n)
        render_anim(n)
        print("RENDERED", n, flush=True)

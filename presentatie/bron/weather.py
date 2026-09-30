import bpy, math, os
from mathutils import Vector

OUT = "/tmp/claude-1000/-home-rlambert-Documents-GitHub-Tectonic-hackaton-TeamTrojanHorse/aab61bc7-9e1a-47e5-a282-a39e933ee13d/scratchpad/renders"
os.makedirs(OUT, exist_ok=True)

# Work in a dedicated scene so the user's scene stays untouched
if bpy.app.background:
    sc = bpy.context.scene
else:
    sc = bpy.data.scenes.get("KBC_Weer") or bpy.data.scenes.new("KBC_Weer")
    bpy.context.window.scene = sc


def clear():
    for o in list(sc.collection.all_objects):
        bpy.data.objects.remove(o, do_unlink=True)


def mat(name, color, rough=0.35, emit=0.0, coat=0.6, alpha=1.0, sss=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    for k, v in (("Coat Weight", coat), ("Coat Roughness", 0.15)):
        if k in b.inputs:
            b.inputs[k].default_value = v
    if emit:
        b.inputs["Emission Color"].default_value = (*color, 1)
        b.inputs["Emission Strength"].default_value = emit
    if sss and "Subsurface Weight" in b.inputs:
        b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Alpha"].default_value = alpha
    return m


def link(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)
    return o


def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def cloud(loc=(0, 0, 0), s=1.0, m=None, name="Cloud"):
    mb = bpy.data.metaballs.new(name)
    mb.resolution = 0.06
    mb.render_resolution = 0.04
    ob = bpy.data.objects.new(name, mb)
    sc.collection.objects.link(ob)
    blobs = [(-1.1, 0, -0.15, 0.85), (0, 0, 0.35, 1.15), (1.05, 0, 0.0, 0.9),
             (-0.4, 0.1, -0.45, 0.8), (0.55, 0.1, -0.45, 0.8), (1.7, 0, -0.35, 0.6), (-1.75, 0, -0.4, 0.55)]
    for x, y, z, r in blobs:
        e = mb.elements.new()
        e.co = (x, y, z)
        e.radius = r
    ob.location = loc
    ob.scale = (s, s, s)
    mb.materials.append(m)
    return ob


def sun(loc=(0, 0, 0), s=1.0, rays=True):
    core = mat("Sun", (1.0, 0.6, 0.06), rough=0.25, emit=0.35)
    ray = mat("SunRay", (1.0, 0.5, 0.04), rough=0.3, emit=0.3)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0 * s, location=loc, segments=64, ring_count=32)
    smooth(link(bpy.context.object, core))
    if rays:
        for i in range(10):
            a = i / 10 * math.tau
            p = Vector(loc) + Vector((math.cos(a), 0, math.sin(a))) * 1.55 * s
            bpy.ops.mesh.primitive_cylinder_add(radius=0.13 * s, depth=0.5 * s, location=p, vertices=32)
            r = bpy.context.object
            r.rotation_euler = (0, -a + math.pi / 2, 0)
            bev = r.modifiers.new("b", "BEVEL"); bev.width = 0.12 * s; bev.segments = 6
            smooth(link(r, ray))


def bolt(loc=(0, 0, 0), s=1.0):
    m = mat("Bolt", (1.0, 0.78, 0.0), rough=0.2, emit=0.5)
    pts = [(0.15, 0.9), (-0.45, -0.05), (-0.02, -0.05), (-0.3, -0.95), (0.5, 0.2), (0.07, 0.2), (0.35, 0.9)]
    me = bpy.data.meshes.new("Bolt")
    verts = [(x, 0, z) for x, z in pts]
    me.from_pydata(verts, [], [list(range(len(verts)))])
    ob = bpy.data.objects.new("Bolt", me)
    sc.collection.objects.link(ob)
    so = ob.modifiers.new("s", "SOLIDIFY"); so.thickness = 0.22; so.offset = 0
    bv = ob.modifiers.new("b", "BEVEL"); bv.width = 0.05; bv.segments = 4; bv.limit_method = "ANGLE"
    ob.location = loc; ob.scale = (s, s, s)
    link(ob, m)
    return ob


def drop(loc, s=0.22, tilt=0.0, m=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=loc, segments=32, ring_count=16)
    d = bpy.context.object
    # pull top vertices into a point for a teardrop
    for v in d.data.vertices:
        if v.co.z > 0:
            f = v.co.z
            v.co.x *= (1 - f) ** 1.2
            v.co.y *= (1 - f) ** 1.2
            v.co.z *= 1.6
    d.scale = (s, s, s)
    d.rotation_euler = (0, tilt, 0)
    smooth(link(d, m))


def rainbow(loc=(0, 0, 0), s=1.0):
    cols = [(0.95, 0.2, 0.25), (1.0, 0.55, 0.1), (1.0, 0.85, 0.15), (0.3, 0.8, 0.35), (0.1, 0.55, 0.95), (0.45, 0.3, 0.85)]
    for i, c in enumerate(cols):
        R = (2.0 - i * 0.24) * s
        bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=0.12 * s, major_segments=128, minor_segments=24,
                                         location=loc, rotation=(math.pi / 2, 0, 0))
        t = bpy.context.object
        smooth(link(t, mat(f"RB{i}", c, rough=0.3)))
        # keep upper half only
        bs = t.modifiers.new("cut", "BOOLEAN")
        bpy.ops.mesh.primitive_cube_add(size=10, location=(loc[0], loc[1], loc[2] - 5))
        cutter = bpy.context.object
        cutter.hide_render = True; cutter.hide_viewport = True
        bs.object = cutter


def bar(loc, length, m):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=length, location=loc, rotation=(0, math.pi / 2, 0), vertices=32)
    b = bpy.context.object
    bv = b.modifiers.new("b", "BEVEL"); bv.width = 0.1; bv.segments = 8
    smooth(link(b, m))


def setup_render(cam_loc=(0, -14, 1.2), look=(0, 0, 0), lens=60):
    cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = lens
    cam = bpy.data.objects.new("Cam", cam_d); sc.collection.objects.link(cam)
    cam.location = cam_loc
    d = Vector(look) - Vector(cam_loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    for n, loc, e, sz, col in (("Key", (-5, -6, 7), 900, 6, (1, 0.96, 0.9)),
                               ("Fill", (6, -5, 1), 350, 8, (0.8, 0.9, 1.0)),
                               ("Rim", (0, 6, 5), 700, 5, (1, 1, 1))):
        ld = bpy.data.lights.new(n, "AREA"); ld.energy = e; ld.size = sz; ld.color = col
        lo = bpy.data.objects.new(n, ld); sc.collection.objects.link(lo); lo.location = loc
        dd = Vector((0, 0, 0)) - Vector(loc)
        lo.rotation_euler = dd.to_track_quat("-Z", "Y").to_euler()
    if not sc.world:
        sc.world = bpy.data.worlds.new("W")
    sc.world.use_nodes = True
    bg = next(n for n in sc.world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs[0].default_value = (0.75, 0.82, 0.95, 1); bg.inputs[1].default_value = 0.6
    r = sc.render
    r.engine = "BLENDER_EEVEE"
    r.film_transparent = True
    r.resolution_x = r.resolution_y = 1024
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGBA"
    try:
        sc.view_settings.view_transform = "AgX"
    except TypeError:
        pass


def render(name):
    sc.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)


WHITE = mat("CloudWhite", (0.95, 0.97, 1.0), rough=0.55, coat=0.2, sss=0.15)
GREY = mat("CloudGrey", (0.55, 0.6, 0.7), rough=0.55, coat=0.2)
DARK = mat("CloudDark", (0.22, 0.25, 0.33), rough=0.5, coat=0.3)
BLUE = mat("Drop", (0.05, 0.55, 1.0), rough=0.08, coat=1.0)
MIST = mat("Mist", (0.8, 0.85, 0.92), rough=0.6, coat=0.1)


def scene_zon():
    sun()


def scene_bewolkt():
    sun(loc=(0.9, 0.6, 0.9), s=0.75)
    cloud(loc=(-0.2, 0, -0.3), m=WHITE)


def scene_regen():
    cloud(loc=(0, 0, 0.6), m=GREY)
    for x, z in ((-1.2, -1.2), (-0.3, -1.6), (0.6, -1.25), (1.4, -1.7), (-0.8, -2.2), (0.15, -2.4)):
        drop((x, -0.2, z), m=BLUE, tilt=0.25)


def scene_donder():
    cloud(loc=(0, 0.2, 0.6), m=GREY)
    bolt(loc=(0.1, -0.6, -1.0), s=1.3)


def scene_storm():
    cloud(loc=(0, 0.2, 0.7), s=1.1, m=DARK)
    bolt(loc=(-0.5, -0.6, -1.1), s=1.2)
    bolt(loc=(1.1, -0.4, -1.2), s=0.8)
    for x, z in ((-1.6, -1.0), (0.3, -1.6), (1.8, -2.0), (-1.0, -2.3), (0.9, -2.6)):
        drop((x, -0.3, z), m=BLUE, tilt=0.6, s=0.18)


def scene_mist():
    cloud(loc=(0, 0.4, 0.7), s=0.9, m=MIST)
    for z, x, l in ((-0.6, -0.3, 3.2), (-1.1, 0.4, 3.6), (-1.6, -0.2, 2.8), (-2.1, 0.3, 2.2)):
        bar((x, -0.6, z), l, MIST)


def scene_regenboog():
    rainbow(loc=(0, 0, -0.9))
    cloud(loc=(-1.75, -0.4, -0.9), s=0.45, m=WHITE)
    cloud(loc=(1.75, -0.4, -0.9), s=0.45, m=WHITE)


SCENES = {"zon": scene_zon, "bewolkt": scene_bewolkt, "regen": scene_regen, "donder": scene_donder,
          "storm": scene_storm, "mist": scene_mist, "regenboog": scene_regenboog}


def build(name):
    clear()
    setup_render()
    SCENES[name]()


def build_all():
    for n in SCENES:
        build(n)
        render(n)

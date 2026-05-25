(function () {
  "use strict";
  window.__BRAND__ = {
    name: "la Mona",
    tagline: "Joyas de plata y con baño de oro",
    sub: "Joyas personalizadas · Hecho en Perú 🇵🇪",
    handle: "@lamona_peru",
    whatsapp: "+51997918216",
    whatsappMsg: "Hola! Vi tu catálogo y me interesa hacer un pedido 🌸",
    instagram: "https://www.instagram.com/lamona_peru/",
    facebook: "https://www.facebook.com/share/1YAsh5Ffs1/",
    followers: "929",
    posts: "113",
    totalProducts: "69",
    price: "S/. 50",

    categories: [
      { id: "todos",     label: "Todos" },
      { id: "anillo",    label: "Anillos" },
      { id: "collar",    label: "Collares" },
      { id: "pulsera",   label: "Pulseras" },
      { id: "arete",     label: "Aretes" },
      { id: "conjunto",  label: "Conjuntos" }
    ],

    products: [
      /* ── ANILLOS ── */
      { id:"p01", cat:"anillo",   name:"Anillos con Piedras Naturales",       desc:"Banda trenzada con cabujón en 6 piedras: lapislázuli, cuarzo rosa, malaquita, ojo de tigre, ónix y zafiro.", photo:"assets/img/foto-1.jpeg",  tag:"Personalizable" },
      { id:"p02", cat:"anillo",   name:"Anillos con Piedras (6 colores)",      desc:"Banda trenzada elegante con piedra natural a elegir entre 6 colores únicos.", photo:"assets/img/foto-2.jpeg",  tag:"Personalizable" },
      { id:"p03", cat:"anillo",   name:"Set de 3 Anillos Minimalistas",        desc:"Trenzado, solitario con zirconia e infinito. Perfectos para apilar.", photo:"assets/img/foto-5.jpeg",  tag:"Set" },
      { id:"p04", cat:"anillo",   name:"Set Celestial (Luna, Estrella, Infinito)", desc:"3 anillos con motivos celestiales en plata 925 o acero inoxidable.", photo:"assets/img/foto-9.jpeg",  tag:"Set" },
      { id:"p05", cat:"anillo",   name:"Anillos de Ola",                       desc:"Diseño costero en dorado y plateado. Minimalista, ideal para el mar.", photo:"assets/img/foto-10.jpeg", tag:"" },
      { id:"p06", cat:"anillo",   name:"Set de 4 Anillos",                     desc:"Corazón, infinito, círculo y ola. Para llevar apilados con estilo.", photo:"assets/img/foto-11.jpeg", tag:"Set" },
      { id:"p07", cat:"anillo",   name:"Set de 8 Anillos",                     desc:"Corazón, estrella, corona, trenzado y más. El set definitivo.", photo:"assets/img/foto-12.jpeg", tag:"Set" },
      { id:"p08", cat:"anillo",   name:"Anillo Sello con Iniciales",           desc:"Banda dôme ovalada con tus iniciales grabadas. Llega en caja de terciopelo negro.", photo:"assets/img/foto-13.jpeg", tag:"Personalizable" },
      { id:"p09", cat:"anillo",   name:"Anillo Solitario con Cristal",         desc:"Banda delgada con cristal brillante central. Clásico para uso diario.", photo:"assets/img/foto-14.jpeg", tag:"" },
      { id:"p10", cat:"anillo",   name:"Solitario Bañado en Oro Rosado",       desc:"Delicado, con piedra transparente en engaste de 4 garras. Elegancia minimalista.", photo:"assets/img/foto-15.jpeg", tag:"Baño de oro" },
      { id:"p11", cat:"anillo",   name:"Anillo Nudo de Plata",                 desc:"Nudo entrelazado, símbolo de unión eterna. Diseño minimalista y sofisticado.", photo:"assets/img/foto-36.jpeg", tag:"" },
      { id:"p12", cat:"anillo",   name:"Anillo Sello con tu Inicial",          desc:"Forma ovalada con tu inicial grabada. Display de 3 tamaños sobre travertino.", photo:"assets/img/foto-44.jpeg", tag:"Personalizable" },
      { id:"p13", cat:"anillo",   name:"Set de 2 Anillos",                     desc:"Solitario con zirconia + onda minimalista. Llega en cajita rosa.", photo:"assets/img/foto-54.jpeg", tag:"Set" },

      /* ── COLLARES ── */
      { id:"p14", cat:"collar",   name:"Set Luna y Estrella",                  desc:"Dúo de collares con dijes de luna creciente y estrella de 5 puntas.", photo:"assets/img/foto-4.jpeg",  tag:"Set" },
      { id:"p15", cat:"collar",   name:"Set de 3 Collares Celestiales",        desc:"Luna, corazón y estrella. Para llevar en capas o por separado.", photo:"assets/img/foto-6.jpeg",  tag:"Set" },
      { id:"p16", cat:"collar",   name:"Collar Corazón Oscuro",                desc:"Cadena fina plateada con dije de corazón en tono oscuro. Elegante.", photo:"assets/img/foto-8.jpeg",  tag:"" },
      { id:"p17", cat:"collar",   name:"Collar Ángeles Místico",               desc:"Dije con serafines alados grabados en relieve. Estilo vintage y espiritual.", photo:"assets/img/foto-16.jpeg", tag:"" },
      { id:"p18", cat:"collar",   name:"Set Collarines Gatito",                desc:"Par de collares con silueta de gato minimalista. Para parejas o amigas.", photo:"assets/img/foto-22.jpeg", tag:"Set" },
      { id:"p19", cat:"collar",   name:"Collar Corazón con Cristal Azul",      desc:"Corazón abierto con piedra central azul. Delicado y romántico.", photo:"assets/img/foto-23.jpeg", tag:"" },
      { id:"p20", cat:"collar",   name:"Collares Huella de Mascota",           desc:"Circular plateado y corazón dorado con huella de pata. Para los pet lovers.", photo:"assets/img/foto-25.jpeg", tag:"" },
      { id:"p21", cat:"collar",   name:"Collar Corazón con tu Inicial",        desc:"Dije de corazón dorado con tu inicial grabada. Llega en caja blanca.", photo:"assets/img/foto-26.jpeg", tag:"Personalizable" },
      { id:"p22", cat:"collar",   name:"Collar con Nombre Grabado",            desc:"Cadena satelital con tu nombre grabado en dije oval plateado.", photo:"assets/img/foto-27.jpeg", tag:"Personalizable" },
      { id:"p23", cat:"collar",   name:"Collar con Nombre Grabado",            desc:"Cadena satelital con tu nombre. Diseño minimalista y elegante.", photo:"assets/img/foto-28.jpeg", tag:"Personalizable" },
      { id:"p24", cat:"collar",   name:"Collar Nombre en Caja de Regalo",      desc:"Collar personalizado con nombre, presentado en caja premium. El regalo perfecto.", photo:"assets/img/foto-29.jpeg", tag:"Personalizable" },
      { id:"p25", cat:"collar",   name:"Collar Medallón con Inicial",          desc:"Dije circular con tu inicial en cursiva y cristal rosado.", photo:"assets/img/foto-31.jpeg", tag:"Personalizable" },
      { id:"p26", cat:"collar",   name:"Collar Nombre Presentación Premium",   desc:"Cadena satelital con tu nombre. Presentación en caja blanca premium.", photo:"assets/img/foto-32.jpeg", tag:"Personalizable" },
      { id:"p27", cat:"collar",   name:"Collar Dorado con tu Inicial",         desc:"Medallón dorado con inicial en cursiva y mini gema rosada.", photo:"assets/img/foto-33.jpeg", tag:"Personalizable" },
      { id:"p28", cat:"collar",   name:"Collar Nombre en Cursiva",             desc:"Cadena fígaro con tu nombre en tipografía cursiva script.", photo:"assets/img/foto-39.jpeg", tag:"Personalizable" },
      { id:"p29", cat:"collar",   name:"Collar Nombre en Cursiva",             desc:"Cadena fígaro brillante con tu nombre a elección.", photo:"assets/img/foto-41.jpeg", tag:"Personalizable" },
      { id:"p30", cat:"collar",   name:"Collar Nombre en Cursiva",             desc:"Cadena fígaro con nombre grabado. Minimalista y moderno.", photo:"assets/img/foto-42.jpeg", tag:"Personalizable" },
      { id:"p31", cat:"collar",   name:"Collar Nombre en Cursiva",             desc:"Cadena fígaro plateada con el nombre que elijas.", photo:"assets/img/foto-43.jpeg", tag:"Personalizable" },
      { id:"p32", cat:"collar",   name:"Collar Girasol",                       desc:"Dije de girasol texturizado en acabado mate. Llega en cajita de terciopelo.", photo:"assets/img/foto-55.jpeg", tag:"" },
      { id:"p33", cat:"collar",   name:"Cadena Cubana Plateada",               desc:"Eslabones planos entrelazados. Clásico y sofisticado para cualquier look.", photo:"assets/img/foto-56.jpeg", tag:"" },
      { id:"p34", cat:"collar",   name:"Colección de Cadenas",                 desc:"7 estilos: Lisa, Mónaco, Eslabón, Cordón, Singapur, Tiffany y Cartier.", photo:"assets/img/foto-57.jpeg", tag:"" },
      { id:"p35", cat:"collar",   name:"Collar Mapa de Perú 🇵🇪",              desc:"Silueta del Perú con corazón calado. Orgullo peruano en plata.", photo:"assets/img/foto-59.jpeg", tag:"" },
      { id:"p36", cat:"collar",   name:"Collar Corazón con Gema",              desc:"Corazón abierto con piedra central delicada y cadena satinada.", photo:"assets/img/foto-65.jpeg", tag:"" },
      { id:"p37", cat:"collar",   name:"Collar Corazón Romántico",             desc:"Dije corazón abierto con gema solitaria. Perfecto para regalar.", photo:"assets/img/foto-67.jpeg", tag:"" },
      { id:"p38", cat:"collar",   name:"Colgantes Corazón con Gemas",          desc:"4 colores: negro, verde, azul y rosa. Elige tu piedra favorita.", photo:"assets/img/foto-68.jpeg", tag:"Personalizable" },

      /* ── PULSERAS ── */
      { id:"p39", cat:"pulsera",  name:"Set Pulseras Corazón (4 estilos)",     desc:"Sólido, cristal esmeralda, calado y mini. En cadena de bolitas plateada.", photo:"assets/img/foto-17.jpeg", tag:"Set" },
      { id:"p40", cat:"pulsera",  name:"Pulsera Bolitas con Corazón Toggle",   desc:"Cadena de bolitas con corazón abombado y cierre tipo toggle. Plata 925.", photo:"assets/img/foto-19.jpeg", tag:"" },
      { id:"p41", cat:"pulsera",  name:"Pulsera 'Merezco lo que Sueñas'",      desc:"Medallón grabado con frase inspiradora. Para recordarte lo que vales.", photo:"assets/img/foto-24.jpeg", tag:"" },
      { id:"p42", cat:"pulsera",  name:"Set de Pulseras en Caja de Madera",    desc:"4 pulseras personalizadas en caja de madera premium con cojines de lino.", photo:"assets/img/foto-30.jpeg", tag:"Personalizable" },
      { id:"p43", cat:"pulsera",  name:"Pulsera 'Eres Única'",                 desc:"Con dije grabado 'Eres única, y ese es tu poder'. Un abrazo de plata.", photo:"assets/img/foto-34.jpeg", tag:"" },
      { id:"p44", cat:"pulsera",  name:"Pulsera de Perlas con tu Inicial",     desc:"Perlas naturales de agua dulce con dije grabado en cursiva.", photo:"assets/img/foto-35.jpeg", tag:"Personalizable" },
      { id:"p45", cat:"pulsera",  name:"Pulsera con Texto a Elección",         desc:"Placa rectangular plana para grabar tu frase o nombre favorito.", photo:"assets/img/foto-37.jpeg", tag:"Personalizable" },
      { id:"p46", cat:"pulsera",  name:"Set Pulseras y Aretes",                desc:"Pulseras de bolitas con dije corazón + aretes tipo gota.", photo:"assets/img/foto-45.jpeg", tag:"Set" },
      { id:"p47", cat:"pulsera",  name:"Pulseras de Perlas con Cruz",          desc:"Perlas naturales de agua dulce con elegante cruz plateada.", photo:"assets/img/foto-46.jpeg", tag:"" },
      { id:"p48", cat:"pulsera",  name:"Pulsera Primera Comunión",             desc:"Perlas naturales con cruz calada. Perfecta para ocasiones especiales.", photo:"assets/img/foto-47.jpeg", tag:"" },
      { id:"p49", cat:"pulsera",  name:"Pulsera Macramé con Cruz",             desc:"Ajustable, en negro y azul con cruz plateada en acabado mate.", photo:"assets/img/foto-48.jpeg", tag:"" },
      { id:"p50", cat:"pulsera",  name:"Esclava con Placa Personalizable",     desc:"Placa rectangular para grabar tu fecha, frase o nombre especial.", photo:"assets/img/foto-49.jpeg", tag:"Personalizable" },
      { id:"p51", cat:"pulsera",  name:"Set Ojo Turco",                        desc:"Collar + pulsera con amuleto nazar esmaltado. Azul y rojo.", photo:"assets/img/foto-50.jpeg", tag:"" },
      { id:"p52", cat:"pulsera",  name:"Pulsera Macramé con tu Inicial",       desc:"Trenzado ajustable en negro con charm de tu letra inicial en plata.", photo:"assets/img/foto-61.jpeg", tag:"Personalizable" },
      { id:"p53", cat:"pulsera",  name:"Pulsera Bolitas Corazón Clásica",      desc:"Cadena de bolitas con corazón abombado y cierre toggle. Uso diario.", photo:"assets/img/foto-62.jpeg", tag:"" },
      { id:"p54", cat:"pulsera",  name:"Set de 4 Pulseras Corazón",            desc:"4 estilos de corazón en cadena de bolitas. Apílalas o regálalas.", photo:"assets/img/foto-63.jpeg", tag:"Set" },
      { id:"p55", cat:"pulsera",  name:"Pulsera Bolitas Corazón",              desc:"Cadena de bolitas con dije de corazón abultado. Minimalista romántico.", photo:"assets/img/foto-64.jpeg", tag:"" },
      { id:"p56", cat:"pulsera",  name:"Dúo Corazón y Girasol",               desc:"2 pulseras: cadena fina con corazón + cadena con dije de girasol.", photo:"assets/img/foto-66.jpeg", tag:"Set" },
      { id:"p57", cat:"pulsera",  name:"Pulsera Cuarzo Rosa y Perlas",         desc:"Cuarzo rosa facetado con perlas naturales y plata 925. Delicada y romántica.", photo:"assets/img/foto-69.jpeg", tag:"" },

      /* ── ARETES ── */
      { id:"p58", cat:"arete",    name:"Argollas Plateadas (3 tamaños)",       desc:"Diseño clásico y versátil para cualquier ocasión. Vienen en cajita hexagonal.", photo:"assets/img/foto-3.jpeg",  tag:"" },
      { id:"p59", cat:"arete",    name:"Set 6 Mini Studs Celestiales",         desc:"Luna, estrella, corazón, cruz, triángulo y esfera. En acero quirúrgico.", photo:"assets/img/foto-7.jpeg",  tag:"Set" },
      { id:"p60", cat:"arete",    name:"Set 6 Pares Argollas Doradas",         desc:"Desde mini huggies hasta hoops grandes. El kit de argollas definitivo.", photo:"assets/img/foto-18.jpeg", tag:"Set" },
      { id:"p61", cat:"arete",    name:"Set 7 Studs Oro Rosado",               desc:"Diseños celestiales y simbólicos bañados en oro rosado.", photo:"assets/img/foto-21.jpeg", tag:"Baño de oro" },
      { id:"p62", cat:"arete",    name:"Studs Taza de Café",                   desc:"Para las amantes del café. Estilo kawaii y minimalista en plata 925.", photo:"assets/img/foto-38.jpeg", tag:"" },
      { id:"p63", cat:"arete",    name:"Set Argollas + Studs Estrella",        desc:"2 pares en uno: argollas tubulares + toperoles estrella en plata.", photo:"assets/img/foto-58.jpeg", tag:"Set" },
      { id:"p64", cat:"arete",    name:"Aretes Colgantes Corazón",             desc:"Corazón abierto colgante con stud redondo. Moderno y romántico.", photo:"assets/img/foto-60.jpeg", tag:"" },

      /* ── CONJUNTOS ── */
      { id:"p65", cat:"conjunto", name:"Conjunto Corazón Abierto",             desc:"Collar + aretes a juego con diseño de corazón abierto. Plateado minimalista.", photo:"assets/img/foto-20.jpeg", tag:"" },
      { id:"p66", cat:"conjunto", name:"Set Grano de Café",                    desc:"Collar con dije + aretes de tachón con motivo de grano de café.", photo:"assets/img/foto-40.jpeg", tag:"" },
      { id:"p67", cat:"conjunto", name:"Colección la Mona",                    desc:"Collares mapa Perú + pulseras exclusivas de la marca. Nuestro favorito.", photo:"assets/img/foto-51.jpeg", tag:"Exclusivo" },
      { id:"p68", cat:"conjunto", name:"Conjunto Girasol",                     desc:"Collar + aretes con diseño de girasol. Romántico y femenino.", photo:"assets/img/foto-52.jpeg", tag:"" },
      { id:"p69", cat:"conjunto", name:"Conjunto Floral con Cristal",          desc:"Collar + aretes con diseño de margarita y gema central champagne.", photo:"assets/img/foto-53.jpeg", tag:"" }
    ]
  };
})();
